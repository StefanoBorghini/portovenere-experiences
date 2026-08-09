import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/sendEmail";
import { bookingReminderTemplate } from "@/lib/email/templates";
import { getFeaturedExperienceLineItemForLead } from "@/lib/proposal-engine/getFeaturedExperienceForLead";

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

    // Un solo binario di reminder: proposal generate ma per cui il
    // cliente non ha MAI cliccato "Request Private Booking"
    // (booking_requested_at resta null finche' non clicca — vedi
    // /api/request-booking). Appena clicca, per qualsiasi motivo
    // (anche se poi non conferma l'email), la proposal esce per
    // sempre da questa query: nessun reminder oltre quel punto.
    const { data: pendingProposals, error: fetchError } = await db
      .from("Proposal")
      .select("*")
      .is("booking_requested_at", null)
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
          (now - new Date(proposal.created_at).getTime()) / (1000 * 60 * 60);

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

        const proposalUrl = `${SITE_URL}/results/proposal/${proposal.slug}`;

        // Chi non ha mai cliccato "Prenota ora" non ha confirmed_selection
        // (si popola solo li'): l'unica "selezione" reale rimane la
        // featured experience calcolata da generateProposal, la stessa
        // gia' mostrata nella mail di generazione — stesso dettaglio,
        // non un elenco vuoto.
        const featuredLineItem = await getFeaturedExperienceLineItemForLead({
          experiences: leadData.experiences,
          moods: leadData.moods,
          budget: leadData.budget,
          guests: leadData.guests,
          children: leadData.children,
          traveling_with_children: leadData.traveling_with_children,
          start_date: leadData.start_date,
          end_date: leadData.end_date,
        });

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
          experienceDetails: featuredLineItem ? [featuredLineItem] : [],
          totalPrice: featuredLineItem?.price ?? undefined,
        };

        const emailResult = await sendEmail({
          to: leadData.email,
          subject:
            dueStage === 1
              ? "Your Riviera proposal is still open"
              : dueStage === 2
              ? "Still there? Your Riviera proposal hasn't expired"
              : "Last chance to view your Riviera proposal",
          html: bookingReminderTemplate(summaryData, proposalUrl, dueStage as 1 | 2 | 3),
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