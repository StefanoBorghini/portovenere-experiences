import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/sendEmail";
import { ownerEmailConfirmedTemplate } from "@/lib/email/templates";

// =========================================================
// GET /api/verify-email?token=...&slug=...
// Link cliccato dal cliente nell'email di verifica.
// Marca la proposal come confermata, notifica il proprietario,
// e reindirizza il cliente a una pagina di conferma.
// =========================================================

export async function GET(req: NextRequest) {

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://experiences.portovenere.com";

  try {

    if (!supabase) {
      return NextResponse.redirect(`${siteUrl}/results/verification-error`);
    }

    const token = req.nextUrl.searchParams.get("token");
    const slug = req.nextUrl.searchParams.get("slug");

    if (!token || !slug) {
      return NextResponse.redirect(`${siteUrl}/results/verification-error`);
    }

    const { data: proposal, error: fetchError } = await supabase
      .from("Proposal")
      .select("*")
      .eq("slug", slug)
      .eq("verification_token", token)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.redirect(`${siteUrl}/results/verification-error`);
    }

    // Se e' gia' verificata, evitiamo di rimandare due volte
    // l'email al proprietario se il cliente clicca il link di nuovo.
    if (!proposal.email_verified) {

      await supabase
        .from("Proposal")
        .update({ email_verified: true })
        .eq("slug", slug);

      const leadData = proposal.proposal_data || {};

      const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL || "info@portovenere.com";

      await sendEmail({
        to: ownerEmail,
        subject: `Email confirmed — ${leadData.name || "Lead"}`,
        html: ownerEmailConfirmedTemplate({
          name: leadData.name || "",
          email: leadData.email || "",
          experiences: leadData.experiences || [],
          moods: leadData.moods || [],
          guests: leadData.guests || "",
          budget: leadData.budget || "",
          startDate: leadData.start_date || "",
          endDate: leadData.end_date || "",
          slug,
        }),
      });
    }

    return NextResponse.redirect(
      `${siteUrl}/results/booking-confirmed?slug=${slug}`
    );

  } catch (err) {

    console.error("verify-email error:", err);

    return NextResponse.redirect(`${siteUrl}/results/verification-error`);
  }
}