import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  ownerProposalModifiedTemplate,
  clientChangesConfirmedTemplate,
} from "@/lib/email/templates";

// =========================================================
// POST /api/confirm-changes
// Chiamata quando il cliente modifica la selezione DOPO aver
// gia' confermato l'email una volta. Non richiede una nuova
// verifica — l'indirizzo e' gia' verificato in precedenza.
// Salva la nuova selezione, allunga il timer di 48h, avvisa
// il proprietario e conferma al cliente.
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

    // Le modifiche senza riverifica sono permesse solo se l'email
    // e' gia' stata verificata in precedenza — controllo di sicurezza
    // lato server, indipendente da cosa mostra l'interfaccia.
    if (!proposal.email_verified) {
      return NextResponse.json(
        { success: false, error: "Email not verified yet" },
        { status: 403 }
      );
    }

    const leadData = proposal.proposal_data || {};

    const newExpiresAt = new Date(
      Date.now() + 48 * 60 * 60 * 1000
    ).toISOString();

    const { error: updateError } = await supabase
      .from("Proposal")
      .update({
        confirmed_selection: {
          experienceIds: experienceIds || [],
          enhancementIds: enhancementIds || [],
        },
        expires_at: newExpiresAt,
      })
      .eq("slug", slug);

    if (updateError) {
      console.error("confirm-changes update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Could not save changes" },
        { status: 500 }
      );
    }

    const summaryData = {
      name: leadData.name || "",
      email: leadData.email || "",
      experiences: leadData.experiences || [],
      moods: leadData.moods || [],
      guests: leadData.guests || "",
      budget: leadData.budget || "",
      startDate: leadData.start_date || "",
      endDate: leadData.end_date || "",
      slug,
    };

    // Email al proprietario — fire-and-forget, non deve bloccare
    // la risposta al cliente se dovesse fallire.
    sendEmail({
      to: process.env.OWNER_NOTIFICATION_EMAIL || "info@portovenere.com",
      subject: `Proposal modified — ${summaryData.name || "Client"}`,
      html: ownerProposalModifiedTemplate(summaryData),
    }).catch((err) => console.error("owner modified email failed:", err));

    // Email al cliente — nessuna nuova verifica richiesta
    if (leadData.email) {

      sendEmail({
        to: leadData.email,
        subject: "Your changes have been confirmed — Portovenere Experiences",
        html: clientChangesConfirmedTemplate(summaryData),
      }).catch((err) => console.error("client confirmed email failed:", err));
    }

    return NextResponse.json({
      success: true,
      expiresAt: newExpiresAt,
    });

  } catch (err) {

    console.error("confirm-changes error:", err);

    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}