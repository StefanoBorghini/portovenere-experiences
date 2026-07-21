import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/sendEmail";
import { ownerEmailConfirmedTemplate } from "@/lib/email/templates";

const ADMIN_DASHBOARD_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/admin/leads`
    : "https://www.portovenere.com/admin/leads";

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

    if (!proposal.email_verified) {

      await supabase
        .from("Proposal")
        .update({ email_verified: true })
        .eq("slug", slug);

      const leadData = proposal.proposal_data || {};

      const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL || "info@portovenere.com";

      let internalNotes = "";

      try {
        if (proposal.lead_id) {
          const { data: leadRow } = await supabase
            .from("leads")
            .select("internal_notes")
            .eq("id", proposal.lead_id)
            .maybeSingle();

          internalNotes = leadRow?.internal_notes || "";
        }
      } catch (leadErr) {
        console.error("verify-email: could not fetch lead notes:", leadErr);
      }

      const dashboardUrl = proposal.lead_id
        ? `${ADMIN_DASHBOARD_BASE_URL}/${proposal.lead_id}`
        : undefined;

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
          experienceDetails: proposal.confirmed_selection?.experienceDetails || [],
          enhancementDetails: proposal.confirmed_selection?.enhancementDetails || [],
          totalPrice: proposal.total_price || 0,
          notes: internalNotes,
          dashboardUrl,
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