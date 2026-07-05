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

    const { slug } = await req.json();

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

    const { error: updateError } = await supabase
      .from("Proposal")
      .update({
        verification_token: token,
        verification_sent_at: new Date().toISOString(),
        booking_requested_at: new Date().toISOString(),
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

    return NextResponse.json(result);

  } catch (err) {

    console.error("request-booking error:", err);

    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}