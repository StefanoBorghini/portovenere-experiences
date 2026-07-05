import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sendEmail";
import { ownerNewProposalTemplate } from "@/lib/email/templates";

// =========================================================
// POST /api/notify-new-proposal
// Chiamata subito dopo l'insert della Proposal in
// craft-your-experience/page.tsx — indipendente dal fatto
// che il cliente richieda o no il booking privato.
// =========================================================

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const {
      name,
      email,
      experiences,
      moods,
      guests,
      budget,
      startDate,
      endDate,
      slug,
    } = body;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Missing slug" },
        { status: 400 }
      );
    }

    const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL || "info@portovenere.com";

    const result = await sendEmail({
      to: ownerEmail,
      subject: `New proposal — ${name || "New lead"}`,
      html: ownerNewProposalTemplate({
        name: name || "",
        email: email || "",
        experiences: experiences || [],
        moods: moods || [],
        guests: guests || "",
        budget: budget || "",
        startDate: startDate || "",
        endDate: endDate || "",
        slug,
      }),
    });

    return NextResponse.json(result);

  } catch (err) {

    console.error("notify-new-proposal error:", err);

    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}