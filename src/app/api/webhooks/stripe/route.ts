import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { getStripe } from "@/lib/stripe/stripeClient";
import { computeLeadPricingSnapshot } from "@/lib/pricing/computeLeadPricingSnapshot";
import { sendEmail } from "@/lib/email/sendEmail";
import { conciergeFeePaidClientTemplate, ownerConciergeFeePaidTemplate } from "@/lib/email/templates";

// =========================================================
// POST /api/webhooks/stripe
//
// Il loop di Transfer sotto (Fase 2, marketplace/split) resta nel
// codice cosi' com'e' ma non fa piu' nulla nel flusso Concierge Fee
// attivo: legge Proposal.deposit_split, che /api/admin/request-payment
// (Fase 1) non scrive mai — resta vuoto, il loop non itera. Va
// riattivato solo se/quando la Fase 2 tornera' a scrivere deposit_split.
//
// Verifica firma OBBLIGATORIA (constructEvent): senza, chiunque
// potrebbe chiamare questa route con un payload finto e far scattare
// pagamenti/aggiornamenti falsi.
// =========================================================

export async function POST(req: NextRequest) {

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("stripe webhook: signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {

    switch (event.type) {

      case "checkout.session.completed": {

        const session = event.data.object as Stripe.Checkout.Session;

        // Pagamento personalizzato (sezione admin "Custom Payment") —
        // MAI legato a una Proposal, gestito qui interamente e mai
        // fatto proseguire nella logica leadId/Proposal sotto (che
        // altrimenti, se fosse stato collegato un lead esistente,
        // segnerebbe erroneamente la SUA Proposal come pagata).
        if (session.metadata?.type === "custom_payment") {

          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id;

          await supabaseAdmin
            .from("custom_payments")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id: paymentIntentId || null,
            })
            .eq("stripe_checkout_session_id", session.id);

          break;
        }

        // Abbonamento partner (sezione admin "Affiliates", bottone
        // "Send Stripe payment" — vedi /api/admin/partners/[id]/
        // create-stripe-payment). Al pagamento riuscito attiva
        // l'abbonamento in automatico con lo stesso calcolo (oggi ->
        // +1 anno) del bottone manuale "Activate subscription", cosi'
        // l'admin non deve fare nulla dopo aver mandato il link.
        if (session.metadata?.type === "partner_subscription") {

          const partnerId = session.metadata?.partnerId;

          if (!partnerId) {
            console.error("stripe webhook: partner_subscription missing partnerId metadata");
            break;
          }

          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id;

          const start = new Date();
          const end = new Date(start);
          end.setFullYear(end.getFullYear() + 1);

          await supabaseAdmin
            .from("partner_applications")
            .update({
              payment_status: "paid",
              subscription_start_date: start.toISOString().slice(0, 10),
              subscription_end_date: end.toISOString().slice(0, 10),
              stripe_payment_intent_id: paymentIntentId || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", partnerId)
            .eq("stripe_checkout_session_id", session.id);

          break;
        }

        const leadId = session.metadata?.leadId;

        if (!leadId) {
          console.error("stripe webhook: checkout.session.completed missing leadId metadata");
          break;
        }

        const { data: proposal, error: fetchError } = await supabaseAdmin
          .from("Proposal")
          .select("*")
          .eq("lead_id", leadId)
          .single();

        if (fetchError || !proposal) {
          console.error("stripe webhook: proposal not found for leadId", leadId);
          break;
        }

        // Idempotenza — Stripe puo' rimandare lo stesso evento piu'
        // volte: se il deposito e' gia' segnato pagato, non ricreare
        // i Transfer una seconda volta.
        if (proposal.payment_status === "deposit_paid") {
          break;
        }

        const depositSplit: { operatorId: string; stripeAccountId: string; amount: number }[] =
          proposal.deposit_split || [];

        // source_transaction lega il Transfer al pagamento originale,
        // garantendo che i fondi siano davvero disponibili — serve
        // l'id del charge, non della session. Calcolato sempre (serve
        // anche sotto per stripe_payment_intent_id), indipendentemente
        // da deposit_split.
        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

        const splitResults: { operatorName: string; amount: number; transferStatus: "ok" | "failed" }[] = [];

        // Tutto cio' che segue (retrieve del charge, query sulla
        // tabella operators, Transfer) e' Fase 2/marketplace puro —
        // saltato interamente quando deposit_split e' vuoto (sempre
        // vero nel flusso Concierge Fee attivo), cosi' questa route
        // non dipende dall'esistenza della tabella operators/dalla
        // migration Stripe Connect quando non serve davvero.
        if (depositSplit.length > 0) {

          let chargeId: string | undefined;

          if (paymentIntentId) {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            chargeId =
              typeof paymentIntent.latest_charge === "string"
                ? paymentIntent.latest_charge
                : paymentIntent.latest_charge?.id;
          }

          const { data: operators } = await supabaseAdmin
            .from("operators")
            .select("id, name")
            .in("id", depositSplit.map((row) => row.operatorId));

          const operatorNameById = new Map((operators || []).map((op) => [op.id, op.name]));

          for (const row of depositSplit) {

            if (row.amount <= 0) continue;

            try {
              await stripe.transfers.create({
                amount: row.amount,
                currency: "eur",
                destination: row.stripeAccountId,
                source_transaction: chargeId,
                transfer_group: session.id,
              });

              splitResults.push({
                operatorName: operatorNameById.get(row.operatorId) || row.operatorId,
                amount: row.amount / 100,
                transferStatus: "ok",
              });
            } catch (transferErr) {
              // Un transfer fallito non deve bloccare gli altri, ne'
              // impedire di segnare il deposito come pagato (il cliente
              // ha comunque pagato) — ma DEVE arrivare all'owner, non
              // sparire in silenzio.
              console.error(`stripe webhook: transfer to ${row.stripeAccountId} failed`, transferErr);

              splitResults.push({
                operatorName: operatorNameById.get(row.operatorId) || row.operatorId,
                amount: row.amount / 100,
                transferStatus: "failed",
              });
            }
          }
        }

        await supabaseAdmin
          .from("Proposal")
          .update({
            payment_status: "deposit_paid",
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: paymentIntentId || null,
          })
          .eq("lead_id", leadId);

        const leadData = proposal.proposal_data || {};
        const feeAmount = Number(proposal.concierge_fee_amount || 0);
        const feePercentage = Number(proposal.concierge_fee_percentage || 0);

        // ---------------------------------------------------------
        // Semina concierge_operator_status — una riga per ogni item
        // confermato, con titolo/operatore(testo libero)/prezzo pronti
        // per il coordinamento manuale (i 7 step). Idempotente: se il
        // webhook arriva due volte, o l'admin ha gia' iniziato a
        // modificare lo stato di una riga, l'insert la ignora invece
        // di sovrascriverla (ignoreDuplicates sull'unique lead_id +
        // item_type + item_id).
        // ---------------------------------------------------------

        const confirmedExperienceIds: string[] = proposal.confirmed_selection?.experienceIds || [];
        const confirmedEnhancementIds: string[] = proposal.confirmed_selection?.enhancementIds || [];

        const { lineItems: confirmedLineItems } = await computeLeadPricingSnapshot({
          experienceIds: confirmedExperienceIds,
          enhancementIds: confirmedEnhancementIds,
          guests: leadData.guests,
          children: leadData.children,
          checkInDate: leadData.start_date,
        });

        const operatorStatusRows = confirmedLineItems.map((item) => ({
          lead_id: leadId,
          item_type: item.type,
          item_id: item.id,
          item_title: item.title,
          item_operator_name: item.operator || null,
          price: item.price,
        }));

        if (operatorStatusRows.length > 0) {
          const { error: seedError } = await supabaseAdmin
            .from("concierge_operator_status")
            .upsert(operatorStatusRows, {
              onConflict: "lead_id,item_type,item_id",
              ignoreDuplicates: true,
            });

          if (seedError) {
            console.error("stripe webhook: could not seed concierge_operator_status", seedError);
          }
        }

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

        const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL || "info@portovenere.com";

        await Promise.allSettled([
          leadData.email
            ? sendEmail({
                to: leadData.email,
                subject: "Your concierge is now active — Portovenere Experiences",
                html: conciergeFeePaidClientTemplate(summaryData, feeAmount),
              })
            : Promise.resolve(),

          sendEmail({
            to: ownerEmail,
            subject: `Concierge Fee paid — ${leadData.name || "Client"}`,
            html: ownerConciergeFeePaidTemplate(
              summaryData,
              feeAmount,
              feePercentage,
              operatorStatusRows.map((row) => ({
                itemTitle: row.item_title || row.item_id,
                operatorName: row.item_operator_name || "—",
                price: row.price,
              }))
            ),
          }),
        ]);

        break;
      }

      case "checkout.session.expired": {

        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.type === "custom_payment") {
          await supabaseAdmin
            .from("custom_payments")
            .update({ status: "expired" })
            .eq("stripe_checkout_session_id", session.id)
            .eq("status", "pending");

          break;
        }

        if (session.metadata?.type === "partner_subscription") {
          await supabaseAdmin
            .from("partner_applications")
            .update({ payment_status: "expired" })
            .eq("stripe_checkout_session_id", session.id)
            .eq("payment_status", "payment_sent");

          break;
        }

        const leadId = session.metadata?.leadId;

        if (leadId) {
          await supabaseAdmin
            .from("Proposal")
            .update({ payment_status: "failed" })
            .eq("lead_id", leadId)
            .eq("payment_status", "payment_requested");
        }

        break;
      }

      case "account.updated": {

        const account = event.data.object as Stripe.Account;

        const status =
          account.charges_enabled && account.payouts_enabled ? "active" : "pending";

        await supabaseAdmin
          .from("operators")
          .update({ stripe_onboarding_status: status })
          .eq("stripe_account_id", account.id);

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });

  } catch (err) {

    console.error("stripe webhook: unexpected error", err);

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
