import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { requireAdminSession } from "@/lib/auth/requireAdminSession";
import { getSocialCardDataForSlug } from "@/lib/social-card/getSocialCardDataForProposal";

// =========================================================
// GET /api/admin/leads/[id]/social-card
// Genera i dati della Social Experience Card per la proposal
// collegata a questo lead — solo admin (vedi bottone "Generate
// Social Card" in admin/leads/[id]/page.tsx). La card non e' mai
// generabile dal cliente sulla proposal page pubblica: e' uno
// strumento marketing che usa Stefano, non una feature del wizard.
// =========================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const auth = await requireAdminSession(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {

    const { data: proposal, error } = await getSupabaseAdmin()
      .from("Proposal")
      .select("slug")
      .eq("lead_id", id)
      .maybeSingle();

    if (error || !proposal) {
      return NextResponse.json(
        { success: false, error: "This lead has no proposal yet" },
        { status: 404 }
      );
    }

    const socialCardData = await getSocialCardDataForSlug(proposal.slug);

    if (!socialCardData) {
      return NextResponse.json(
        { success: false, error: "Could not generate the social card for this proposal" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, socialCardData });

  } catch (err) {

    console.error("admin/leads/[id]/social-card error:", err);

    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}
