-- =====================================================================
-- partner_applications
-- =====================================================================
-- Candidature ricevute dal wizard step-by-step su /become-a-partner.
-- Ricalca 1:1 le 7 sezioni delle "schede attività" cartacee di
-- Portovenere.com (Accommodation / Experiences & Activities /
-- Restaurant & Food / Services / Shops): dati attività, presentazione,
-- info generali, dettagli specifici per categoria, contatto e
-- prenotazione, foto e materiali, autorizzazione — piu' l'interesse
-- di piano, specifico di questo wizard (non presente nella scheda
-- cartacea, che serve anche per attivita' gia' listate gratuitamente).
--
-- Nessuna scrittura pubblica via RLS: l'unico punto di inserimento e'
-- /api/partner-application, che gira lato server con la service role
-- key (bypassa RLS) dopo aver verificato Turnstile.
--
-- IDEMPOTENTE E SICURA DA RILANCIARE: "create table if not exists" +
-- una serie di "alter table add column if not exists" — funziona sia
-- se la tabella non esiste ancora, sia se esiste gia' con lo schema
-- precedente (piu' semplice, senza profile/booking/materials/consent_*)
-- creato da una versione precedente di questa migration. Nessuna riga
-- esistente viene toccata o persa.
-- =====================================================================

create table if not exists partner_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  category text not null,
  plan_interest text not null default 'not_sure',
  status text not null default 'new'
    check (status in ('new', 'contacted', 'approved', 'rejected'))
);

-- Sezione 1 — Informazioni sull'attivita' (i campi piu' usati restano
-- colonne dirette; phone gia' presente dalle versioni precedenti).
alter table partner_applications add column if not exists phone text;

-- Resto della sezione 1 (ragione sociale, indirizzo, whatsapp, sito,
-- instagram/facebook) + sezione 2 (presentazione) + sezione 3 (info
-- generali: periodo apertura, orari, lingue, accessibilita'). jsonb
-- perche' sono tanti campi eterogenei e tutti facoltativi, senza
-- bisogno di essere filtrabili via SQL finche' non esiste un pannello
-- admin.
alter table partner_applications add column if not exists profile jsonb not null default '{}';

-- Sezione 4 — risposte specifiche per categoria (es. per un hotel:
-- {"roomsCount": "11–30", "checkInOut": "14:00 / 10:00"}).
alter table partner_applications add column if not exists details jsonb not null default '{}';

-- Sezione 5 (dove deve portare il pulsante + contatto) e sezione 6
-- (foto e materiali) — stesso ragionamento di "profile".
alter table partner_applications add column if not exists booking jsonb not null default '{}';
alter table partner_applications add column if not exists materials jsonb not null default '{}';

-- Sezione 7 — Autorizzazione. Colonne vere (non jsonb) perche' e' il
-- gate legale della candidatura: deve poter essere vincolato
-- (not null / check) e verificato facilmente.
alter table partner_applications add column if not exists consent_accepted boolean not null default false;
alter table partner_applications add column if not exists consent_full_name text;

alter table partner_applications add column if not exists website text;
alter table partner_applications add column if not exists instagram text;
alter table partner_applications add column if not exists message text;
alter table partner_applications add column if not exists locale text;

alter table partner_applications enable row level security;

-- Nessuna policy per anon/authenticated: RLS attiva senza eccezioni
-- blocca sia lettura che scrittura dal client pubblico. L'unico
-- accesso e' server-side con la service role key, che bypassa RLS
-- comunque (vedi src/lib/supabase/adminClient.ts).

-- =====================================================================
-- Se la tabella esisteva gia' con la primissima versione di questa
-- migration (categories text[] invece di category text), esegui prima
-- questo (altrimenti ignoralo, non serve):
--
--   alter table partner_applications rename column categories to categories_old;
--   alter table partner_applications add column category text;
--   update partner_applications set category = categories_old[1];
--   alter table partner_applications alter column category set not null;
--   alter table partner_applications drop column categories_old;
-- =====================================================================
