-- =====================================================================
-- partner_applications — pagamento Stripe
-- =====================================================================
-- Riferimenti al Checkout Session/Payment Intent creati da
-- /api/admin/partners/[id]/create-stripe-payment. Stesso principio di
-- custom_payments (2026_custom_payments.sql): il webhook Stripe
-- (src/app/api/webhooks/stripe/route.ts, branch "partner_subscription")
-- aggiorna payment_status/subscription_start_date/subscription_end_date
-- in automatico quando il pagamento va a buon fine — nessuna azione
-- manuale dell'admin necessaria dopo aver mandato il link.
--
-- IDEMPOTENTE: solo "alter table add column if not exists".
-- =====================================================================

alter table partner_applications add column if not exists stripe_checkout_session_id text;
alter table partner_applications add column if not exists stripe_payment_intent_id text;
