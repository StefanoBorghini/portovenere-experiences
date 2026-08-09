-- =====================================================================
-- Concierge Fee (Fase 1) — sostituisce il modello marketplace/split come
-- flusso di pagamento ATTIVO. Il codice/schema Stripe Connect
-- (operators, deposit_amount, deposit_split, ecc. — vedi
-- 2026_stripe_connect.sql) NON viene toccato: resta disponibile per
-- un'eventuale Fase 2, semplicemente il nuovo flusso non lo scrive.
--
-- Modello: il cliente paga a Portovenere SOLO una percentuale a
-- scaglioni calcolata sul valore totale delle esperienze scelte (mai il
-- valore delle esperienze stesso, che il cliente paga direttamente a
-- ciascun operatore, fuori da questo sistema). Payment_status riusa lo
-- stesso enum già esistente su Proposal (none/payment_requested/
-- deposit_paid/failed) — 'deposit_paid' qui significa "Concierge Fee
-- pagata / Concierge Active", non più "acconto ricevuto".
--
-- QUESTA MIGRATION NON DIPENDE da 2026_stripe_connect.sql: non tocca
-- la tabella operators e non richiede che sia stata eseguita. Si lavora
-- per esperienza/enhancement, non per operatore separato — l'operatore
-- coinvolto e' un campo testo libero (vedi item_operator_name sotto),
-- come il campo "operator" gia' esistente su experience_content da
-- prima di Stripe Connect. Puoi eseguire questa migration da sola.
-- =====================================================================

alter table "Proposal" add column if not exists concierge_fee_percentage numeric;
alter table "Proposal" add column if not exists concierge_fee_amount numeric;

-- ---------------------------------------------------------------------
-- Tracciamento manuale per riga (esperienza O enhancement) coinvolta in
-- una proposal con Concierge Fee pagata — coordinamento operatore lato
-- concierge (i 7 step manuali), mai automatico. Seminata dal webhook
-- Stripe subito dopo il pagamento della fee (una riga per ogni item
-- prezzato di quella proposal).
--
-- item_id è TEXT (non FK): experience_content.id è testo generato
-- client-side (es. "new-experience-<timestamp>"), e il tipo esatto di
-- enhancement_content.id non è confermabile dal codice — stessa scelta
-- già fatta in 2026_availability.sql, per lo stesso motivo.
--
-- item_operator_name è testo libero (niente FK a operators/Stripe
-- Connect) — per le esperienze viene precompilato dal campo "operator"
-- già esistente sulla scheda esperienza; per gli enhancement parte
-- vuoto e lo si scrive direttamente qui. Modificabile in ogni momento
-- dalla sezione "Operator coordination" della scheda lead.
-- ---------------------------------------------------------------------

create table if not exists concierge_operator_status (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  item_type text not null check (item_type in ('experience', 'enhancement')),
  item_id text not null,
  item_title text,
  item_operator_name text,
  price numeric,
  status text not null default 'da_contattare' check (status in (
    'da_contattare',
    'contattato_in_attesa',
    'disponibilita_confermata',
    'non_disponibile_da_riproporre',
    'in_attesa_pagamento_cliente',
    'pagamento_cliente_confermato',
    'esperienza_confermata',
    'modifiche_richieste',
    'in_attesa_dettagli_operativi',
    'completata',
    'annullata'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id, item_type, item_id)
);

alter table concierge_operator_status enable row level security;

-- Nessuna policy pubblica — stesso trattamento di operators: solo
-- accesso server-side con la service role key, tramite le route admin
-- autenticate (mai dal client anon direttamente).
