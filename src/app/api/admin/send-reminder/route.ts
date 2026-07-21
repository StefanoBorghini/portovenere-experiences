import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/sendEmail";
import { reminderEmailTemplate } from "@/lib/email/templates";
import { getEnhancements } from "@/lib/supabase/enhancementRepository";

// =========================================================
// POST /api/admin/send-reminder
// Chiamata dal bottone "Send reminder now" nella pagina admin
// di dettaglio lead. Manda il prossimo reminder in sequenza
// (stage attuale + 1, saturato a 3) fuori dal timing automatico
// del cron — utile quando sai gia' che il cliente sta aspettando
// la mail (es. dopo una chiamata) e non vuoi aspettare le 12/24/36h.
//
// NOTA SICUREZZA: richiede il token della sessione admin (stesso
// meccanismo di auth gia' usato per proteggere /admin/leads lato
// client). Se il pattern di autenticazione reale del progetto e'
// diverso da supabase.auth.getUser(token), questo controllo va
// adattato — non avendo visto lib/supabase.ts non posso confermarlo
// al 100%.
// =========================================================

export async function POST(req: NextRequest) {

  try {

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !userData?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: "Missing leadId" },
        { status: 400 }
      );
    }

    const { data: proposal, error: fetchError } = await supabase
      .from("Proposal")
      .select("*")
      .eq("lead_id", leadId)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json(
        { success: false, error: "No proposal found for this lead" },
        { status: 404 }
      );
    }

    if (proposal.email_verified) {
      return NextResponse.json(
        { success: false, error: "This client has already confirmed their email — no reminder needed" },
        { status: 400 }
      );
    }

    if (!proposal.verification_sent_at) {
      return NextResponse.json(
        { success: false, error: "The client hasn't requested a booking yet — nothing to remind" },
        { status: 400 }
      );
    }

    const leadData = proposal.proposal_data || {};

    if (!leadData.email) {
      return NextResponse.json(
        { success: false, error: "No email on file for this lead" },
        { status: 400 }
      );
    }

    // Prossimo stage in sequenza — non torna mai indietro, e resta
    // fermo a 3 (ultimo reminder) se gia' arrivato li', cosi' il
    // bottone resta sempre utilizzabile per un "resend" a mano.
    const nextStage = Math.min((proposal.reminder_stage || 0) + 1, 3) as 1 | 2 | 3;

    let enhancementNames: string[] = [];

    try {
      const allEnhancements = await getEnhancements();
      const selectedIds = (proposal.confirmed_selection?.enhancementIds || [])
        .map((id: any) => String(id));

      enhancementNames = allEnhancements
        .filter((enh: any) => selectedIds.includes(String(enh.id)))
        .map((enh: any) => enh.title || enh.name || "")
        .filter(Boolean);
    } catch (enhErr) {
      console.error("send-reminder: could not resolve enhancement names:", enhErr);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.portovenere.com";

    const verifyUrl =
      `${siteUrl}/api/verify-email?token=${proposal.verification_token}&slug=${proposal.slug}`;

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
      enhancements: enhancementNames,
      totalPrice: proposal.total_price || 0,
    };

    const emailResult = await sendEmail({
      to: leadData.email,
      subject:
        nextStage === 1
          ? "Your Riviera proposal is waiting for you"
          : nextStage === 2
          ? "Reminder: confirm your Riviera booking request"
          : "Last reminder: your Riviera proposal request",
      html: reminderEmailTemplate(summaryData, verifyUrl, nextStage),
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: "Email send failed" },
        { status: 500 }
      );
    }

    // Non torniamo mai indietro nello stage anche se il cron nel
    // frattempo fosse gia' arrivato piu' avanti (caso limite, ma
    // meglio essere espliciti con Math.max invece di sovrascrivere).
    await supabase
      .from("Proposal")
      .update({ reminder_stage: Math.max(proposal.reminder_stage || 0, nextStage) })
      .eq("lead_id", leadId);

    return NextResponse.json({ success: true, stage: nextStage });

  } catch (err) {

    console.error("send-reminder error:", err);

    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}