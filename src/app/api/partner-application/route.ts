import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { sendEmail } from "@/lib/email/sendEmail";
import { ownerNewPartnerApplicationTemplate } from "@/lib/email/templates";

// =========================================================
// POST /api/partner-application
// Wizard step-by-step su /become-a-partner, ricalca le 7 sezioni
// della scheda attivita' cartacea di Portovenere.com. Nessuna
// policy pubblica di insert su partner_applications (vedi
// migration) — l'unica scrittura passa da qui, lato server, con
// la service role key, dopo verifica Turnstile.
// =========================================================

const VALID_CATEGORIES = [
  "accommodation",
  "experiences_activities",
  "restaurant_food",
  "services",
  "shops",
];

const VALID_PLANS = ["base", "premium", "signature", "not_sure"];

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const {
      turnstileToken,
      companyName,
      contactName,
      email,
      phone,
      category,
      profile,
      details,
      booking,
      materials,
      consentAccepted,
      consentFullName,
      planInterest,
      website,
      instagram,
      message,
      locale,
    } = body;

    if (!turnstileToken) {
      return NextResponse.json(
        { success: false, error: "Missing captcha token" },
        { status: 400 }
      );
    }

    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return NextResponse.json(
        { success: false, error: "Captcha verification failed" },
        { status: 400 }
      );
    }

    if (
      !companyName ||
      !contactName ||
      !email ||
      !VALID_CATEGORIES.includes(category)
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Gate legale — senza consenso esplicito non salviamo nulla,
    // stesso principio della sezione 7 della scheda cartacea
    // ("Autorizzazione: Accetto" + firma).
    if (consentAccepted !== true || !consentFullName) {
      return NextResponse.json(
        { success: false, error: "Missing consent" },
        { status: 400 }
      );
    }

    const cleanPlan = VALID_PLANS.includes(planInterest)
      ? planInterest
      : "not_sure";

    const cleanProfile = asObject(profile);
    const cleanDetails = asObject(details);
    const cleanBooking = asObject(booking);
    const cleanMaterials = asObject(materials);

    const supabaseAdmin = getSupabaseAdmin();

    const { error: insertError } = await supabaseAdmin
      .from("partner_applications")
      .insert([
        {
          company_name: companyName,
          contact_name: contactName,
          email,
          phone: phone || null,
          category,
          profile: cleanProfile,
          details: cleanDetails,
          booking: cleanBooking,
          materials: cleanMaterials,
          consent_accepted: true,
          consent_full_name: consentFullName,
          plan_interest: cleanPlan,
          website: website || null,
          instagram: instagram || null,
          message: message || null,
          locale: locale || null,
        },
      ]);

    if (insertError) {
      console.error("partner-application insert error:", insertError);
      return NextResponse.json(
        { success: false, error: "Could not save application" },
        { status: 500 }
      );
    }

    const ownerEmail =
      process.env.OWNER_NOTIFICATION_EMAIL || "info@portovenere.com";

    const emailResult = await sendEmail({
      to: ownerEmail,
      subject: `New partner application — ${companyName}`,
      html: ownerNewPartnerApplicationTemplate({
        companyName,
        contactName,
        email,
        phone,
        category,
        profile: cleanProfile,
        details: cleanDetails,
        booking: cleanBooking,
        materials: cleanMaterials,
        consentFullName,
        planInterest: cleanPlan,
        website,
        instagram,
        message,
      }),
    });

    if (!emailResult.success) {
      console.error("partner-application notification email failed:", emailResult.error);
    }

    return NextResponse.json({ success: true });

  } catch (err) {

    console.error("partner-application error:", err);

    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
