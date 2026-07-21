import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/sendEmail";
import { reminderEmailTemplate } from "@/lib/email/templates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://experiences.portovenere.com";

const REMINDER_THRESHOLDS_HOURS: Record<number, number> = {
  1: 12,
  2: 24,
  3: 36,
};

export async function GET(req: NextRequest) {

  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 500 });
  }

  const db = supabase;

  try {

    const { data: pendingProposals, error: fetchError } = await db
      .from("Proposal")
      .select("*")
      .eq("email_verified", false)
      .not("verification_sent_at", "is", null)
      .lt("reminder_stage", 3);

    if (fetchError) {
      console.error("proposal-reminders fetch error:", fetchError);
      return NextResponse.json({ success: false, error: fetchError }, { status: 500 });
    }

    if (!pendingProposals || pendingProposals.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const now = Date.now();

    const results = await Promise.allSettled(

      pendingProposals.map(async (proposal) => {

        const hoursSincePending =
          (now - new Date(proposal.verification_sent_at).getTime()) / (1000 * 60 * 60);

        let dueStage = 0;

        if (hoursSincePending >= REMINDER_THRESHOLDS_HOURS[3]) dueStage = 3;
        else if (hoursSincePending >= REMINDER_THRESHOLDS_HOURS[2]) dueStage = 2;
        else if (hoursSincePending >= REMINDER_THRESHOLDS_HOURS[1]) dueStage = 1;

        if (dueStage === 0 || dueStage <= proposal.reminder_stage) {
          return { slug: proposal.slug, skipped: true };
        }

        const leadData = proposal.proposal_data || {};

        if (!leadData.email) {
          return { slug: proposal.slug, skipped: true, reason: "no email on file" };
        }

        const verifyUrl =
          `${SITE_URL}/api/verify-email?token=${proposal.verification_token}&slug=${proposal.slug}`;

        const summaryData = {
          name: leadData.name || "",
          email: leadData.email || "",
          experiences: leadData.experiences || [],
          moods: leadData.moods || [],
          guests: leadData.guests || "",
          budget: leadData.budget || "",
          startDate: leadData.start_date || "",
          endDate: leadData.end_date || "",
          slug: proposal.slug,
          experienceDetails: proposal.confirmed_selection?.experienceDetails || [],
          enhancementDetails: proposal.confirmed_selection?.enhancementDetails || [],
          totalPrice: proposal.total_price || 0,
        };

        const emailResult = await sendEmail({
          to: leadData.email,
          subject:
            dueStage === 1
              ? "Your Riviera proposal is waiting for you"
              : dueStage === 2
              ? "Reminder: confirm your Riviera booking request"
              : "Last reminder: your Riviera proposal request",
          html: reminderEmailTemplate(summaryData, verifyUrl, dueStage as 1 | 2 | 3),
        });

        if (!emailResult.success) {
          throw new Error(`Email send failed for ${proposal.slug}`);
        }

        await db
          .from("Proposal")
          .update({ reminder_stage: dueStage })
          .eq("slug", proposal.slug);

        return { slug: proposal.slug, sent: true, stage: dueStage };
      })
    );

    const sentCount = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any).sent
    ).length;

    const failedCount = results.filter((r) => r.status === "rejected").length;

    if (failedCount > 0) {
      console.error(
        "proposal-reminders: some reminders failed:",
        results.filter((r) => r.status === "rejected")
      );
    }

    return NextResponse.json({ success: true, sent: sentCount, failed: failedCount });

  } catch (err) {

    console.error("proposal-reminders error:", err);

    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}