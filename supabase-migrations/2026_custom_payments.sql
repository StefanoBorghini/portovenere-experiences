-- =====================================================================
-- custom_payments
-- =====================================================================
-- Pagamenti Stripe ad-hoc creati a mano dall'admin (sezione "Custom
-- Payment" del pannello), non legati a una Proposal generata dal
-- configuratore. Nessuna colonna aggiunta a "leads"/"Proposal" — tutto
-- il tracking di questi pagamenti vive qui, stessa filosofia gia'
-- usata per concierge_operator_status (tabella dedicata invece di
-- sovraccaricare tabelle esistenti con concetti che non le riguardano).
-- =====================================================================

create table if not exists custom_payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  customer_name text not null,
  customer_email text not null,
  customer_phone text,

  -- Collegamento opzionale a un lead gia' in sistema — solo un
  -- riferimento informativo, MAI usato dal webhook Stripe per la
  -- logica di conferma pagamento (che gira interamente su
  -- stripe_checkout_session_id qui sotto, per costruzione separata dal
  -- flusso Concierge Fee/Proposal esistente).
  linked_lead_id uuid references leads(id) on delete set null,

  description text,

  mode text not null check (mode in ('fixed', 'percentage')),
  reference_price numeric,
  percentage numeric,
  amount numeric not null,

  stripe_checkout_session_id text,
  stripe_payment_intent_id text,

  status text not null default 'pending'
    check (status in ('pending', 'paid', 'expired', 'failed')),
  paid_at timestamptz
);

alter table custom_payments enable row level security;

-- Nessuna policy pubblica: solo accesso server-side con service role
-- key, stesso trattamento di concierge_operator_status.
