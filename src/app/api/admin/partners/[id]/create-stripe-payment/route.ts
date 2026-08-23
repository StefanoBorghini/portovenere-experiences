import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { requireAdminSession } from "@/lib/auth/requireAdminSession";
import { getStripe } from "@/lib/stripe/stripeClient";
import { sendEmail } from "@/lib/email/sendEmail";
import { customPaymentRequestedTemplate } from "@/lib/email/templates";
import { PLAN_LABELS, PLAN_AMOUNTS } from "@/lib/config/partnerPlans";

// =========================================================
// POST /api/admin/partners/[id]/create-stripe-payment
//
// Stesso pattern di /api/admin/create-custom-payment (Checkout
// Session Stripe una tantum, non un abbonamento Stripe vero e
// proprio — il rinnovo annuale resta gestito a mano dall'admin,
// coerente con "Activate subscription" gia' esistente). L'unica
// differenza sostanziale: qui il webhook (metadata.type =
// "partner_subscription") aggiorna partner_applications invece di
// custom_payments, e attiva l'abbonamento in automatico al pagamento
// riuscito — vedi src/app/api/webhooks/stripe/route.ts.
//
// L'importo e' quello del piano (PLAN_AMOUNTS) salvo che l'admin ne
// passi uno esplicito nel body (obbligatorio per Signature/Not sure,
// che non hanno un prezzo fisso).
// =========================================================

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

    const body = await req.json().catch(() => ({}));
    const overrideAmount = Number(body.amount);

    const amount = overrideAmount > 0
      ? overrideAmount
      : PLAN_AMOUNTS[partner.plan_interest];

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "This plan has no fixed price — specify an amount" },
        { status: 400 }
      );
    }

    const planLabel = PLAN_LABELS[partner.plan_interest] || "Standard";
    const stripe = getStripe();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://experiences.portovenere.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: partner.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Abbonamento Portovenere Experience — ${planLabel}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/results/booking-confirmed`,
      cancel_url: siteUrl,
      metadata: {
        type: "partner_subscription",
        partnerId: id,
      },
    });

    await getSupabaseAdmin()
      .from("partner_applications")
      .update({
        payment_status: "payment_sent",
        payment_sent_at: new Date().toISOString(),
        payment_amount: amount,
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (session.url) {
      const emailResult = await sendEmail({
        to: partner.email,
        subject: "Payment request — Portovenere Experience",
        html: customPaymentRequestedTemplate(
          { name: partner.contact_name, email: partner.email },
          session.url,
          amount,
          `Abbonamento ${planLabel} — Portovenere Experience`
        ),
      });

      if (!emailResult.success) {
        console.error("create-stripe-payment: email failed to send", emailResult.error);
      }
    }

    return NextResponse.json({ success: true, checkoutUrl: session.url, amount });

  } catch (err) {
    console.error("create-stripe-payment error:", err);
    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}
