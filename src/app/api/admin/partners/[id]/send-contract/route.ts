import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { requireAdminSession } from "@/lib/auth/requireAdminSession";
import { sendEmail } from "@/lib/email/sendEmail";
import { partnerContractEmailTemplate } from "@/lib/email/templates";
import { generatePartnerContractPdf } from "@/lib/pdf/partnerContractPdf";

// =========================================================
// POST /api/admin/partners/[id]/send-contract
//
// Genera il PDF del contratto al volo, compilato con i dati reali
// della candidatura (vedi generatePartnerContractPdf), e lo manda
// come allegato all'operatore. Nessuna firma elettronica:
// l'accettazione e' "click-wrap", il pagamento gia' effettuato vale
// come accettazione (vedi partnerContractEmailTemplate e l'ultima
// riga del PDF stesso). Aggiorna contract_sent_at solo se l'invio
// riesce davvero.
//
// Le clausole vere e proprie vivono in
// src/lib/pdf/partnerContractTerms.ts — attualmente sono un
// placeholder da far rivedere a un legale, NON testo vincolante.
// =========================================================

const PLAN_LABELS: Record<string, string> = {
  base: "Base",
  premium: "Premium",
  signature: "Signature",
  not_sure: "Standard",
};

// Stessi prezzi mostrati nel wizard /become-a-partner (vedi
// PLAN_OPTIONS in BecomePartnerClient.tsx) — se li cambi li,
// aggiornali anche qui.
const PLAN_PRICES: Record<string, string> = {
  base: "€120 / anno",
  premium: "€240 / anno",
  signature: "Su richiesta",
  not_sure: "Da definire",
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

    const { data: partner, error: fetchError } = await getSupabaseAdmin()
      .from("partner_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !partner) {
      return NextResponse.json({ success: false, error: "Partner not found" }, { status: 404 });
    }

    const planLabel = PLAN_LABELS[partner.plan_interest] || "Standard";
    const subscriptionStart = formatDate(partner.subscription_start_date);
    const subscriptionEnd = formatDate(partner.subscription_end_date);

    const contractBuffer = generatePartnerContractPdf({
      companyName: partner.company_name,
      contactName: partner.contact_name,
      email: partner.email,
      phone: partner.phone || undefined,
      category: partner.category,
      planLabel,
      planPrice: PLAN_PRICES[partner.plan_interest],
      subscriptionStart,
      subscriptionEnd,
    });

    const emailResult = await sendEmail({
      to: partner.email,
      subject: `Il tuo contratto Portovenere Experience — ${partner.company_name}`,
      html: partnerContractEmailTemplate({
        companyName: partner.company_name,
        contactName: partner.contact_name,
        planLabel,
        subscriptionStart,
        subscriptionEnd,
      }),
      attachments: [
        {
          filename: `Contratto Portovenere Experience — ${partner.company_name}.pdf`,
          content: contractBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    if (!emailResult.success) {
      return NextResponse.json({ success: false, error: "Email send failed" }, { status: 500 });
    }

    const sentAt = new Date().toISOString();

    await getSupabaseAdmin()
      .from("partner_applications")
      .update({ contract_sent_at: sentAt, updated_at: sentAt })
      .eq("id", id);

    return NextResponse.json({ success: true, contractSentAt: sentAt });

  } catch (err) {
    console.error("send-partner-contract error:", err);
    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}
