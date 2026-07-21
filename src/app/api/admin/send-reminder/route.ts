import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/sendEmail";
import { reminderEmailTemplate, verificationEmailTemplate } from "@/lib/email/templates";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {

  try {

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !userData?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
    }

    const { data: proposal, error: fetchError } = await supabase
      .from("Proposal")
      .select("*")
      .eq("lead_id", leadId)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json({ success: false, error: "No proposal found for this lead" }, { status: 404 });
    }

    if (proposal.email_verified) {
      return NextResponse.json(
        { success: false, error: "This client has already confirmed their email — no reminder needed" },
        { status: 400 }
      );
    }

    const leadData = proposal.proposal_data || {};

    if (!leadData.email) {
      return NextResponse.json({ success: false, error: "No email on file for this lead" }, { status: 400 });
    }

    const isFirstSend = !proposal.verification_sent_at;
    const token = proposal.verification_token || randomUUID();

    const nextStage = isFirstSend
      ? null
      : (Math.min((proposal.reminder_stage || 0) + 1, 3) as 1 | 2 | 3);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.portovenere.com";
    const verifyUrl = `${siteUrl}/api/verify-email?token=${token}&slug=${proposal.slug}`;

    const summaryData = {
      name: leadData.name || "",
      email: leadData.email || "",
      experiences: leadData.experiences || [],
      moods: leadData.moods || [],
      guests: leadData.guests || "",
      budget: leadData.budget || "",
      startDate: leadData.start_date || "",
      endDate: leadData.end_date || "",
      slug: proposal.slug,
      experienceDetails: proposal.confirmed_selection?.experienceDetails || [],
      enhancementDetails: proposal.confirmed_selection?.enhancementDetails || [],
      totalPrice: proposal.total_price || 0,
    };

    const emailResult = await sendEmail({
      to: leadData.email,
      subject: isFirstSend
        ? "Confirm your booking request — Portovenere Experiences"
        : nextStage === 1
        ? "Your Riviera proposal is waiting for you"
        : nextStage === 2
        ? "Reminder: confirm your Riviera booking request"
        : "Last reminder: your Riviera proposal request",
      html: isFirstSend
        ? verificationEmailTemplate(summaryData, verifyUrl)
        : reminderEmailTemplate(summaryData, verifyUrl, nextStage as 1 | 2 | 3),
    });

    if (!emailResult.success) {
      return NextResponse.json({ success: false, error: "Email send failed" }, { status: 500 });
    }

    await supabase
      .from("Proposal")
      .update({
        verification_token: token,
        verification_sent_at: proposal.verification_sent_at || new Date().toISOString(),
        reminder_stage: isFirstSend
          ? proposal.reminder_stage || 0
          : Math.max(proposal.reminder_stage || 0, nextStage || 0),
      })
      .eq("lead_id", leadId);

    return NextResponse.json({ success: true, stage: isFirstSend ? 0 : nextStage });

  } catch (err) {

    console.error("send-reminder error:", err);

    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}