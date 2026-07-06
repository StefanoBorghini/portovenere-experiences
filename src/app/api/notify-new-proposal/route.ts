import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email/sendEmail";
import { ownerNewProposalTemplate } from "@/lib/email/templates";

// =========================================================
// POST /api/notify-new-proposal
// Chiamata subito dopo l'insert della Proposal in
// craft-your-experience/page.tsx — indipendente dal fatto
// che il cliente richieda o no il booking privato.
//
// Il client manda solo lo slug: tutti i dati veri (nome,
// email, esperienze, ecc.) vengono recuperati dal DB, non
// dal body della richiesta. Senza questo controllo, chiunque
// potrebbe chiamare questa route direttamente con dati finti
// e spammare la tua inbox con "nuove proposal" inventate.
// =========================================================

export async function POST(req: NextRequest) {

  try {

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const { slug } = await req.json();

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

    const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL || "info@portovenere.com";

    const result = await sendEmail({
      to: ownerEmail,
      subject: `New proposal — ${leadData.name || "New lead"}`,
      html: ownerNewProposalTemplate({
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

    return NextResponse.json(result);

  } catch (err) {

    console.error("notify-new-proposal error:", err);

    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}