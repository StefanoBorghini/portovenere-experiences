import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/sendEmail";
import { verificationEmailTemplate } from "@/lib/email/templates";
import { randomUUID } from "crypto";

// =========================================================
// POST /api/request-booking
// Chiamata quando il cliente clicca "Request Private Booking"
// sulla pagina della proposal. Genera un token, lo salva sulla
// riga Proposal, e invia al cliente (all'email salvata nel DB,
// non a quella passata dal client) il link di verifica con il
// resoconto completo della proposta.
// =========================================================

export async function POST(req: NextRequest) {

  try {

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const { slug, experienceIds, enhancementIds } = await req.json();

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Missing slug" },
        { status: 400 }
      );
    }

    // Recuperiamo la proposal dal DB — cosi' usiamo i dati REALI
    // (email compresa) invece di fidarci ciecamente di quello che
    // manda il client. Senza questo controllo, chiunque conoscesse
    // uno slug potrebbe far inviare email di verifica a un indirizzo
    // arbitrario passandolo semplicemente nel body della richiesta.
    const { data: proposal, error: fetchError } = await supabase
      .from("Proposal")
      .select("*")
      .eq("slug", slug)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json(
        { success: false, error: "Proposal not found" },
        { status: 404 }
      );
    }

    const leadData = proposal.proposal_data || {};

    if (!leadData.email) {
      return NextResponse.json(
        { success: false, error: "No email on file for this proposal" },
        { status: 400 }
      );
    }

    const token = randomUUID();

    // Il countdown sulla pagina SPARISCE non appena questa richiesta
    // va a buon fine (bookingState diventa "sent") — se non allunghiamo
    // qui anche la scadenza reale, il cliente vede "Check your inbox"
    // senza alcuna pressione di tempo, ma la prenotazione potrebbe
    // comunque scadere in background mentre lui controlla la posta.
    // Allunghiamo quindi expires_at di 48h fresche da ORA, esattamente
    // come gia' fa /api/confirm-changes per le modifiche successive —
    // cosi' countdown nascosto e scadenza reale sono sempre coerenti.
    const newExpiresAt =
      new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    // Salviamo gia' ora la selezione scelta al momento della richiesta —
    // diventera' il "confirmed_selection" di riferimento una volta che
    // l'email viene verificata. Se il cliente non verifica mai, questo
    // dato semplicemente non conta per nulla.
    const { error: updateError } = await supabase
      .from("Proposal")
      .update({
        verification_token: token,
        verification_sent_at: new Date().toISOString(),
        booking_requested_at: new Date().toISOString(),
        expires_at: newExpiresAt,
        confirmed_selection: {
          experienceIds: experienceIds || [],
          enhancementIds: enhancementIds || [],
        },
      })
      .eq("slug", slug);

    if (updateError) {
      console.error("request-booking update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Could not save verification token" },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.portovenere.com";

    const verifyUrl =
      `${siteUrl}/api/verify-email?token=${token}&slug=${encodeURIComponent(slug)}`;

    const result = await sendEmail({
      to: leadData.email,
      subject: "Confirm your booking request — Portovenere Experiences",
      html: verificationEmailTemplate(
        {
          name: leadData.name || "",
          email: leadData.email || "",
          experiences: leadData.experiences || [],
          moods: leadData.moods || [],
          guests: leadData.guests || "",
          budget: leadData.budget || "",
          startDate: leadData.start_date || "",
          endDate: leadData.end_date || "",
          slug,
        },
        verifyUrl
      ),
    });

    // Il client (proposalClient.tsx) non legge expires_at dalla
    // risposta di questa route oggi — vedi nota sotto per il
    // secondo intervento necessario lato frontend.
    return NextResponse.json({
      ...result,
      expiresAt: newExpiresAt,
    });

  } catch (err) {

    console.error("request-booking error:", err);

    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}