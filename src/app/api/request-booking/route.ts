import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/sendEmail";
import { verificationEmailTemplate } from "@/lib/email/templates";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {

  try {

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const {
      slug,
      experienceIds,
      enhancementIds,
      totalPrice,
      experienceDetails,
      enhancementDetails,
    } = await req.json();

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

    const leadData = proposal.proposal_data || {};

    if (!leadData.email) {
      return NextResponse.json(
        { success: false, error: "No email on file for this proposal" },
        { status: 400 }
      );
    }

    const token = randomUUID();

    const newExpiresAt =
      new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const safeTotalPrice =
      typeof totalPrice === "number" && Number.isFinite(totalPrice) && totalPrice > 0
        ? Math.round(totalPrice)
        : 0;

    const { error: updateError } = await supabase
      .from("Proposal")
      .update({
        verification_token: token,
        verification_sent_at: new Date().toISOString(),
        booking_requested_at: new Date().toISOString(),
        expires_at: newExpiresAt,
        total_price: safeTotalPrice,
        confirmed_selection: {
          experienceIds: experienceIds || [],
          enhancementIds: enhancementIds || [],
          // Dettagli gia' risolti lato client (titolo/operatore/
          // prezzo) — salvati qui cosi' reminder e route admin li
          // possono riusare senza ricalcolare nulla lato server.
          experienceDetails: experienceDetails || [],
          enhancementDetails: enhancementDetails || [],
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
          experienceDetails: experienceDetails || [],
          enhancementDetails: enhancementDetails || [],
          totalPrice: safeTotalPrice,
        },
        verifyUrl
      ),
    });

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