import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { requireAdminSession } from "@/lib/auth/requireAdminSession";
import { sendEmail } from "@/lib/email/sendEmail";
import { partnerContractEmailTemplate } from "@/lib/email/templates";

// =========================================================
// POST /api/admin/partners/[id]/send-contract
//
// Manda il PDF del contratto (statico, sempre lo stesso file — vedi
// CONTRACT_PATH) all'operatore via email. Nessuna firma elettronica:
// l'accettazione e' "click-wrap", il pagamento gia' effettuato vale
// come accettazione (vedi partnerContractEmailTemplate). Aggiorna
// contract_sent_at solo se l'invio riesce davvero.
//
// Il file PDF va aggiunto manualmente in public/documents/ (non
// generato qui) — vedi public/documents/README.md.
// =========================================================

const CONTRACT_PATH = path.join(process.cwd(), "public", "documents", "partner-contract.pdf");

const PLAN_LABELS: Record<string, string> = {
  base: "Base",
  premium: "Premium",
  signature: "Signature",
  not_sure: "Standard",
};

function formatDate(value: string | null): string | undefined {
  if (!value) return undefined;
  return new Date(value).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const auth = await requireAdminSession(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {

    if (!fs.existsSync(CONTRACT_PATH)) {
      return NextResponse.json(
        { success: false, error: "Contract PDF not found — add it to public/documents/partner-contract.pdf" },
        { status: 500 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: partner, error: fetchError } = await supabaseAdmin
      .from("partner_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !partner) {
      return NextResponse.json({ success: false, error: "Partner not found" }, { status: 404 });
    }

    const contractBuffer = fs.readFileSync(CONTRACT_PATH);

    const emailResult = await sendEmail({
      to: partner.email,
      subject: `Il tuo contratto Portovenere Experience — ${partner.company_name}`,
      html: partnerContractEmailTemplate({
        companyName: partner.company_name,
        contactName: partner.contact_name,
        planLabel: PLAN_LABELS[partner.plan_interest] || "Standard",
        subscriptionStart: formatDate(partner.subscription_start_date),
        subscriptionEnd: formatDate(partner.subscription_end_date),
      }),
      attachments: [
        {
          filename: "Contratto Portovenere Experience.pdf",
          content: contractBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    if (!emailResult.success) {
      return NextResponse.json({ success: false, error: "Email send failed" }, { status: 500 });
    }

    const sentAt = new Date().toISOString();

    await supabaseAdmin
      .from("partner_applications")
      .update({ contract_sent_at: sentAt, updated_at: sentAt })
      .eq("id", id);

    return NextResponse.json({ success: true, contractSentAt: sentAt });

  } catch (err) {
    console.error("send-partner-contract error:", err);
    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}
