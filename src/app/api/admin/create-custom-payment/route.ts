import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { getStripe } from "@/lib/stripe/stripeClient";
import { sendEmail } from "@/lib/email/sendEmail";
import { customPaymentRequestedTemplate } from "@/lib/email/templates";

// =========================================================
// POST /api/admin/create-custom-payment
// Sezione admin "Custom Payment" — pagamento Stripe ad-hoc, non
// legato a una Proposal generata dal configuratore: cliente inserito
// a mano (nome/email/telefono facoltativo), importo o fisso o
// calcolato da prezzo totale + percentuale scelta qui dall'admin (a
// differenza della Concierge Fee, che usa una tabella a scaglioni
// automatica — getConciergeFeeTier — qui la percentuale la decide
// l'admin volta per volta). Collegamento opzionale a un lead
// esistente: SOLO informativo (linked_lead_id), mai usato dal webhook
// Stripe per la logica di conferma — vedi il metadata "type" qui
// sotto e il branch dedicato in src/app/api/webhooks/stripe/route.ts.
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

    const {
      customerName,
      customerEmail,
      customerPhone,
      linkedLeadId,
      description,
      mode,
      amount: fixedAmount,
      referencePrice,
      percentage,
    } = await req.json();

    if (!customerName || !customerEmail) {
      return NextResponse.json({ success: false, error: "Missing customer name or email" }, { status: 400 });
    }

    if (mode !== "fixed" && mode !== "percentage") {
      return NextResponse.json({ success: false, error: "Invalid mode" }, { status: 400 });
    }

    // L'importo finale e' sempre ricalcolato qui, mai fidandosi di un
    // totale gia' calcolato lato client.
    const amount =
      mode === "fixed"
        ? Number(fixedAmount)
        : Math.round((Number(referencePrice) * Number(percentage)) / 100 * 100) / 100;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
    }

    const stripe = getStripe();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://experiences.portovenere.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: description || "Portovenere — Custom Payment",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/results/booking-confirmed`,
      cancel_url: siteUrl,
      metadata: {
        type: "custom_payment",
        linkedLeadId: linkedLeadId ? String(linkedLeadId) : "",
      },
    });

    const supabaseAdmin = getSupabaseAdmin();

    const { error: insertError } = await supabaseAdmin.from("custom_payments").insert([
      {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        linked_lead_id: linkedLeadId || null,
        description: description || null,
        mode,
        reference_price: mode === "percentage" ? Number(referencePrice) : null,
        percentage: mode === "percentage" ? Number(percentage) : null,
        amount,
        stripe_checkout_session_id: session.id,
      },
    ]);

    if (insertError) {
      console.error("create-custom-payment: insert error", insertError);
      return NextResponse.json({ success: false, error: "Could not save payment" }, { status: 500 });
    }

    if (session.url) {
      const emailResult = await sendEmail({
        to: customerEmail,
        subject: "Payment request — Portovenere Experiences",
        html: customPaymentRequestedTemplate(
          { name: customerName, email: customerEmail },
          session.url,
          amount,
          description
        ),
      });

      if (!emailResult.success) {
        console.error("create-custom-payment: email failed to send", emailResult.error);
      }
    }

    return NextResponse.json({ success: true, checkoutUrl: session.url, amount });

  } catch (err) {

    console.error("admin/create-custom-payment error:", err);

    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}
