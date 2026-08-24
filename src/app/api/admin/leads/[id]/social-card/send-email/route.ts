import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/requireAdminSession";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { getSocialCardDataForSlug } from "@/lib/social-card/getSocialCardDataForProposal";
import { renderSocialCardFile } from "@/lib/social-card/renderSocialCardFile";
import { sendEmail } from "@/lib/email/sendEmail";
import { socialCardEmailTemplate } from "@/lib/email/templates";
import { SocialCardFormatId } from "@/types/socialCard";

// =========================================================
// POST /api/admin/leads/[id]/social-card/send-email
// Body: { format, showPrice, cta } — stessi parametri della route di
// export, cosi' l'admin manda esattamente cio' che sta guardando nel
// modale. Genera il file (stessa pipeline server-side di
// renderSocialCardFile.ts) e lo allega a un'email inviata all'indirizzo
// del lead — mai al cliente in autonomia, solo su azione esplicita
// dell'admin.
// =========================================================

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const auth = await requireAdminSession(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const formatId = (body.format || "portrait") as SocialCardFormatId;
  const showPrice = Boolean(body.showPrice);
  const requestedCta = typeof body.cta === "string" ? body.cta : "";

  try {

    const { data: proposal, error } = await getSupabaseAdmin()
      .from("Proposal")
      .select("slug, proposal_data")
      .eq("lead_id", id)
      .maybeSingle();

    if (error || !proposal) {
      return NextResponse.json(
        { success: false, error: "This lead has no proposal yet" },
        { status: 404 }
      );
    }

    const leadEmail: string | undefined = proposal.proposal_data?.email;
    const leadName: string | undefined = proposal.proposal_data?.name;

    if (!leadEmail) {
      return NextResponse.json(
        { success: false, error: "This lead has no email address on file" },
        { status: 400 }
      );
    }

    const socialCardData = await getSocialCardDataForSlug(proposal.slug);

    if (!socialCardData) {
      return NextResponse.json(
        { success: false, error: "Could not generate the social card for this proposal" },
        { status: 404 }
      );
    }

    const effectiveCta = requestedCta || socialCardData.cta;

    const { buffer, contentType, filename } = await renderSocialCardFile(
      socialCardData,
      formatId,
      showPrice,
      effectiveCta,
      proposal.slug
    );

    const emailResult = await sendEmail({
      to: leadEmail,
      subject: `A little something for your Riviera escape — Portovenere Experiences`,
      html: socialCardEmailTemplate({
        name: leadName || "",
        cardTitle: socialCardData.title,
        slug: proposal.slug,
      }),
      attachments: [{ filename, content: buffer, contentType }],
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: "Could not send the email — please try again" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, sentTo: leadEmail });

  } catch (err) {

    console.error("admin/leads/[id]/social-card/send-email error:", err);

    const message = err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      { success: false, error: `Could not send the email: ${message}` },
      { status: 500 }
    );
  }
}
