import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { getStripe, getConciergeFeeTier } from "@/lib/stripe/stripeClient";
import { computeLeadPricingSnapshot } from "@/lib/pricing/computeLeadPricingSnapshot";
import { sendEmail } from "@/lib/email/sendEmail";
import { conciergeFeePaymentRequestedTemplate } from "@/lib/email/templates";

// =========================================================
// POST /api/admin/request-payment
// Bottone "Request Concierge Fee" nella scheda lead in admin — SOLO
// azione che fa avanzare payment_status oltre 'none' (mai automatico su
// "Prenota Ora": decisione di prodotto, il team rivede disponibilita'
// prima di chiedere il pagamento).
//
// CONCIERGE FEE (Fase 1) — qui NON si addebita il valore delle
// esperienze (che il cliente paga direttamente a ciascun operatore,
// fuori da questo sistema), ma SOLO la commissione Portovenere a
// scaglioni sul totale (getConciergeFeeTier). Nessuno split, nessun
// requisito che gli operatori abbiano Stripe Connect attivo — la
// logica di split/Transfer della Fase 2 (vedi
// src/app/api/webhooks/stripe/route.ts) resta nel codice ma non viene
// mai alimentata da questa route.
// =========================================================

export async function POST(req: NextRequest) {

  try {

    if (!supabase) {
      return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 500 });
    }

    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !userData?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: proposal, error: fetchError } = await supabaseAdmin
      .from("Proposal")
      .select("*")
      .eq("lead_id", leadId)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json({ success: false, error: "No proposal found for this lead" }, { status: 404 });
    }

    if (!proposal.email_verified) {
      return NextResponse.json(
        { success: false, error: "Client hasn't confirmed their email yet — send/wait for confirmation first" },
        { status: 400 }
      );
    }

    if (proposal.payment_status === "deposit_paid") {
      return NextResponse.json(
        { success: false, error: "Deposit already paid for this proposal" },
        { status: 400 }
      );
    }

    const experienceIds: string[] = proposal.confirmed_selection?.experienceIds || [];
    const enhancementIds: string[] = proposal.confirmed_selection?.enhancementIds || [];

    if (experienceIds.length === 0 && enhancementIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No confirmed selection to charge" },
        { status: 400 }
      );
    }

    const leadData = proposal.proposal_data || {};

    const { finalPrice, lineItems } = await computeLeadPricingSnapshot({
      experienceIds,
      enhancementIds,
      guests: leadData.guests,
      children: leadData.children,
      checkInDate: leadData.start_date,
    });

    if (finalPrice <= 0) {
      return NextResponse.json(
        { success: false, error: "Nothing priced to charge (all items are on request)" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // CONCIERGE FEE — a scaglioni sul VALORE TOTALE esperienze
    // (finalPrice), non sul prezzo di ogni singola riga. Nessun
    // requisito di operatore/Stripe: il cliente paga ogni esperienza
    // direttamente all'operatore, fuori da questo pagamento — qui si
    // addebita solo la commissione Portovenere.
    // ---------------------------------------------------------

    const { percentage: feePercentage, amount: feeAmountEuros } = getConciergeFeeTier(finalPrice);
    const feeAmountCents = feeAmountEuros * 100;

    // ---------------------------------------------------------
    // STRIPE CHECKOUT SESSION — incasso diretto sul conto Portovenere,
    // nessun Connect/split coinvolto (importo = solo la fee).
    // ---------------------------------------------------------

    const stripe = getStripe();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://experiences.portovenere.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: leadData.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Portovenere Concierge Fee",
            },
            unit_amount: feeAmountCents,
          },
          quantity: 1,
        },
      ],
      // success_url porta alla pagina di sola lettura (mai piu' alla
      // proposal editabile) — vedi
      // results/proposal/[slug]/confirmed/page.tsx.
      success_url: `${siteUrl}/results/proposal/${proposal.slug}/confirmed`,
      cancel_url: `${siteUrl}/results/proposal/${proposal.slug}?payment=cancelled`,
      metadata: {
        proposalSlug: proposal.slug,
        leadId: String(leadId),
      },
    });

    const { error: updateError } = await supabaseAdmin
      .from("Proposal")
      .update({
        payment_status: "payment_requested",
        concierge_fee_amount: feeAmountEuros,
        concierge_fee_percentage: feePercentage,
        stripe_checkout_session_id: session.id,
      })
      .eq("lead_id", leadId);

    if (updateError) {
      console.error("request-payment: update error", updateError);
      return NextResponse.json({ success: false, error: "Could not save payment request" }, { status: 500 });
    }

    if (leadData.email && session.url) {
      const emailResult = await sendEmail({
        to: leadData.email,
        subject: "Activate your concierge — Portovenere Experiences",
        html: conciergeFeePaymentRequestedTemplate(
          {
            name: leadData.name || "",
            email: leadData.email || "",
            experiences: leadData.experiences || [],
            moods: leadData.moods || [],
            guests: leadData.guests || "",
            budget: leadData.budget || "",
            startDate: leadData.start_date || "",
            endDate: leadData.end_date || "",
            slug: proposal.slug,
            experienceDetails: lineItems
              .filter((item) => item.type === "experience")
              .map((item) => ({ title: item.title, price: item.price })),
            enhancementDetails: lineItems
              .filter((item) => item.type === "enhancement")
              .map((item) => ({ title: item.title, price: item.price })),
            totalPrice: finalPrice,
          },
          session.url,
          feeAmountEuros,
          feePercentage
        ),
      });

      if (!emailResult.success) {
        console.error("request-payment: email failed to send", emailResult.error);
      }
    }

    return NextResponse.json({ success: true, feeAmount: feeAmountEuros, feePercentage, checkoutUrl: session.url });

  } catch (err) {

    console.error("admin/request-payment error:", err);

    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}
