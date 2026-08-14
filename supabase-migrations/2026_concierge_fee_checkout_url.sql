-- =====================================================================
-- Proposal — aggiunge checkout_url per la Concierge Fee
-- =====================================================================
-- Stesso motivo di 2026_custom_payments_checkout_url.sql: il link
-- Stripe generato da /api/admin/request-payment (session.url) non
-- veniva salvato da nessuna parte, quindi la pagina admin "Payments"
-- non poteva mostrare "Copy link" per le righe Concierge Fee (solo
-- per i custom payments). Lo persistiamo qui allo stesso modo.
-- =====================================================================

alter table "Proposal" add column if not exists checkout_url text;
