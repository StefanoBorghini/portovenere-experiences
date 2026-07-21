import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/sendEmail";
import { reminderEmailTemplate } from "@/lib/email/templates";

// =========================================================
// GET /api/cron/proposal-reminders
// Chiamata da Vercel Cron ogni 30 minuti (vedi vercel.json).
// Per ogni Proposal con email non verificata, controlla quante
// ore sono passate da created_at e invia il reminder dovuto
// (12h -> stage 1, 24h -> stage 2, 36h -> stage 3), uno per
// proposal per run, senza mai rimandare lo stesso stage due
// volte grazie al confronto con reminder_stage salvato in DB.
//
// Protetta da CRON_SECRET: Vercel Cron manda automaticamente
// l'header Authorization con questo valore, ma la route resta
// raggiungibile via URL diretto — senza questo controllo
// chiunque potrebbe triggerare invii massivi di email a caso.
// =========================================================

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

  // Assegnato a una costante locale subito dopo il check: dentro la
  // closure di .map() piu' sotto, TypeScript non riesce a "ricordare"
  // che supabase non e' null solo guardando il controllo qui sopra,
  // quindi segnala erroneamente "possibly null". Con questa costante
  // il narrowing resta valido in tutta la funzione.
  const db = supabase;

  try {

    const { data: pendingProposals, error: fetchError } = await db
      .from("Proposal")
      .select("*")
      .eq("email_verified", false)
      .lt("reminder_stage", 3);

    if (fetchError) {
      console.error("proposal-reminders fetch error:", fetchError);
      return NextResponse.json({ success: false, error: fetchError }, { status: 500 });
    }

    if (!pendingProposals || pendingProposals.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const now = Date.now();

    // Per ogni proposal calcoliamo lo stage dovuto e, se e'
    // superiore a quello gia' inviato, mandiamo il reminder.
    // Promise.allSettled: un fallimento su una proposal (es.
    // email malformata) non deve bloccare le altre in coda.

    const results = await Promise.allSettled(

      pendingProposals.map(async (proposal) => {

        const hoursSinceCreation =
          (now - new Date(proposal.created_at).getTime()) / (1000 * 60 * 60);

        let dueStage = 0;

        if (hoursSinceCreation >= REMINDER_THRESHOLDS_HOURS[3]) dueStage = 3;
        else if (hoursSinceCreation >= REMINDER_THRESHOLDS_HOURS[2]) dueStage = 2;
        else if (hoursSinceCreation >= REMINDER_THRESHOLDS_HOURS[1]) dueStage = 1;

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