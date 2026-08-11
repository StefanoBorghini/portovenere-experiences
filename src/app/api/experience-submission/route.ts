import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sendEmail";
import { ownerNewExperienceSubmissionTemplate } from "@/lib/email/templates";

// =========================================================
// POST /api/experience-submission
// Wizard step-by-step su /submit-experience — un operatore propone
// UNA singola esperienza (diverso da /become-a-partner, che riguarda
// l'intera attivita'). A differenza di partner-application, qui NON
// si scrive su Supabase: l'unico posto in cui la richiesta arriva e'
// l'email al proprietario — se l'invio fallisce, il chiamante deve
// saperlo (500) e poter ritentare, non vedere un falso successo.
// =========================================================

const CATEGORY_LABELS: Record<string, string> = {
  sea_escape: "Sea Escape",
  aerial_escape: "Aerial Escape",
  gourmet_escape: "Gourmet Escape",
  wild_escape: "Wild Escape",
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const {
      turnstileToken,
      businessName,
      contactName,
      email,
      phone,
      category,
      experienceTitle,
      shortDescription,
      fullDescription,
      details,
      basePrice,
      priceType,
      duration,
      minParticipants,
      maxParticipants,
      meetingPoint,
      availabilityNotes,
      photoDelivery,
      photoLink,
      message,
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

    const categoryLabel = CATEGORY_LABELS[category];

    if (!businessName || !contactName || !email || !categoryLabel || !experienceTitle) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ownerEmail =
      process.env.OWNER_NOTIFICATION_EMAIL || "info@portovenere.com";

    const emailResult = await sendEmail({
      to: ownerEmail,
      subject: `New experience submission — ${experienceTitle}`,
      html: ownerNewExperienceSubmissionTemplate({
        businessName,
        contactName,
        email,
        phone: asString(phone),
        categoryLabel,
        experienceTitle,
        shortDescription: asString(shortDescription),
        fullDescription: asString(fullDescription),
        details: asObject(details),
        basePrice: asString(basePrice),
        priceType: asString(priceType),
        duration: asString(duration),
        minParticipants: asString(minParticipants),
        maxParticipants: asString(maxParticipants),
        meetingPoint: asString(meetingPoint),
        availabilityNotes: asString(availabilityNotes),
        photoDelivery: asString(photoDelivery),
        photoLink: asString(photoLink),
        message: asString(message),
      }),
    });

    if (!emailResult.success) {
      console.error("experience-submission notification email failed:", emailResult.error);
      return NextResponse.json(
        { success: false, error: "Could not send notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {

    console.error("experience-submission error:", err);

    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
