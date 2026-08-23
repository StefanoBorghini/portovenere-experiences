-- =====================================================================
-- partner_applications — pagamento e abbonamento
-- =====================================================================
-- Estende partner_applications (2026_partner_applications.sql) con i
-- campi gestiti dall'admin in /admin/affiliates/[id]: nessuna
-- automazione Stripe per ora, il pagamento viene inviato/gestito
-- manualmente dall'admin fuori dal sistema.
--
-- IDEMPOTENTE: solo "alter table add column if not exists".
-- =====================================================================

alter table partner_applications add column if not exists payment_status text not null default 'pending'
  check (payment_status in ('pending', 'payment_sent', 'paid', 'expired', 'cancelled'));

alter table partner_applications add column if not exists payment_sent_at timestamptz;
alter table partner_applications add column if not exists payment_amount numeric;

alter table partner_applications add column if not exists subscription_start_date date;
alter table partner_applications add column if not exists subscription_end_date date;

-- Contratto — solo la data di invio (il documento stesso e' un PDF
-- statico allegato via email, non salvato riga per riga qui — vedi
-- public/documents/partner-contract.pdf).
alter table partner_applications add column if not exists contract_sent_at timestamptz;

-- Note interne, stesso pattern di leads.internal_notes — mai mostrate
-- all'operatore, solo per il team.
alter table partner_applications add column if not exists internal_notes text;

alter table partner_applications add column if not exists updated_at timestamptz;
