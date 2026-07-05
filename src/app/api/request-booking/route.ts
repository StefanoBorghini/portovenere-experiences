import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/sendEmail";
import { verificationEmailTemplate } from "@/lib/email/templates";
import { randomUUID } from "crypto";

// =========================================================
// POST /api/request-booking
// Chiamata quando il cliente clicca "Request Private Booking"
// sulla pagina della proposal. Genera un token, lo salva sulla
// riga Proposal, e invia al cliente il link di verifica.
// =========================================================

export async function POST(req: NextRequest) {

  try {

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const { slug, name, email } = await req.json();

    if (!slug || !email) {
      return NextResponse.json(
        { success: false, error: "Missing slug or email" },
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://experiences.portovenere.com";

    const verifyUrl =
      `${siteUrl}/api/verify-email?token=${token}&slug=${encodeURIComponent(slug)}`;

    const result = await sendEmail({
      to: email,
      subject: "Confirm your booking request — Portovenere Experiences",
      html: verificationEmailTemplate(name || "", verifyUrl),
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