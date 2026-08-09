-- =====================================================================
-- Stripe Connect — operatori, collegamento a experience/enhancement,
-- stato pagamento sulla Proposal.
-- =====================================================================
-- Split multi-operatore: quando una proposal include esperienze/enhancement
-- di operatori diversi, l'acconto pagato dal cliente va addebitato
-- sull'account Stripe di Portovenere (unico modo che Stripe offre per un
-- singolo pagamento che deve poi dividersi su piu' account Connect diversi
-- — pattern "separate charges and transfers"), poi Transfer separati
-- spostano automaticamente la quota di ciascun operatore sul suo account
-- Express subito dopo il pagamento (vedi src/app/api/webhooks/stripe/route.ts).
-- Quel che resta sul conto Portovenere e' gia' la percentuale trattenuta,
-- senza bisogno di application_fee_amount.
--
-- Un operatore senza Stripe Connect attivo non deve MAI comparire come
-- prenotabile via configuratore (nessun fallback) — vedi il filtro in
-- generateProposal.ts / buildRendererData.ts che richiede
-- stripe_onboarding_status = 'active'.
-- =====================================================================

create table if not exists operators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  stripe_account_id text,
  stripe_onboarding_status text not null default 'not_started'
    check (stripe_onboarding_status in ('not_started', 'pending', 'active', 'disabled')),
  created_at timestamptz not null default now()
);

alter table operators enable row level security;

-- Nessuna policy pubblica: solo accesso server-side con la service role
-- key (bypassa RLS comunque), stesso trattamento di partner_applications.

-- ---------------------------------------------------------------------
-- Collegamento strutturato a experience_content/enhancement_content —
-- il campo "operator" (testo libero, gia' esistente) resta invariato per
-- retrocompatibilita' di visualizzazione; operator_id e' il nuovo
-- collegamento vero, nullable finche' non assegnato dall'admin.
-- ---------------------------------------------------------------------

alter table experience_content add column if not exists operator_id uuid references operators(id);
alter table enhancement_content add column if not exists operator_id uuid references operators(id);

-- ---------------------------------------------------------------------
-- Stato pagamento sulla Proposal — payment_status parte da 'none' (come
-- oggi, nessun pagamento richiesto) e avanza SOLO tramite l'azione admin
-- "Request Payment" (mai in automatico su "Prenota Ora", per decisione
-- di prodotto: il team rivede la disponibilita' prima di chiedere il
-- pagamento).
-- ---------------------------------------------------------------------

alter table "Proposal" add column if not exists payment_status text not null default 'none'
  check (payment_status in ('none', 'payment_requested', 'deposit_paid', 'failed'));

alter table "Proposal" add column if not exists deposit_amount numeric;
alter table "Proposal" add column if not exists stripe_checkout_session_id text;
alter table "Proposal" add column if not exists stripe_payment_intent_id text;
alter table "Proposal" add column if not exists paid_at timestamptz;

-- Piano di split per operatore, calcolato e bloccato al momento in cui
-- l'admin chiede il pagamento (route /api/admin/request-payment) — es.
-- [{"operatorId": "...", "stripeAccountId": "acct_...", "amount": 12000}]
-- (amount in centesimi). Il webhook Stripe lo esegue cosi' com'e' dopo il
-- pagamento riuscito (Transfer per riga), senza ricalcolare nulla: lo
-- split deve corrispondere esattamente a quanto e' stato davvero
-- addebitato, non a un ricalcolo fatto in un momento diverso (un
-- operatore potrebbe nel frattempo disconnettersi, i prezzi potrebbero
-- cambiare, ecc.).
alter table "Proposal" add column if not exists deposit_split jsonb;

-- ---------------------------------------------------------------------
-- Vista pubblica MINIMA per il gating del configuratore — il configuratore
-- (pagina proposal, generata lato server con la chiave anon) deve poter
-- sapere quali operator_id sono "active" per escludere le esperienze/
-- enhancement dei non connessi, ma NON deve mai poter leggere email o
-- stripe_account_id (dati sensibili) dalla tabella operators, che resta
-- interamente bloccata da RLS.
--
-- Una vista di proprieta' del ruolo che la crea (qui: chi esegue questa
-- migration nell'SQL editor, tipicamente postgres/service owner) gira con
-- i SUOI permessi di default (security_invoker=false), quindi bypassa
-- l'RLS della tabella sottostante per il solo sottoinsieme di colonne
-- esposte qui — stesso pattern raccomandato da Supabase per "vista
-- pubblica sicura sopra una tabella protetta".
-- ---------------------------------------------------------------------

create or replace view public_operator_status as
  select id, stripe_onboarding_status from operators;

grant select on public_operator_status to anon, authenticated;
