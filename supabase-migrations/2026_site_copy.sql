-- =====================================================================
-- site_copy / site_copy_translations
-- =====================================================================
-- Sostituisce i file next-intl (src/messages/en.json / it.json) come
-- fonte di verita' per TUTTO il testo statico del sito (landing,
-- configuratore, proposal, stringhe comuni) — stesso identico schema e
-- filosofia gia' usati per experience_content_translations: una riga
-- inglese + una riga di traduzione per locale, con translation_status
-- per non mostrare mai una traduzione fallita/vuota.
--
-- Da eseguire UNA VOLTA nel SQL editor di Supabase. Dopo questo, il
-- sito legge questi testi da qui invece che da un file JSON committato.
-- =====================================================================

create table if not exists site_copy (
  key text primary key,
  en_text text not null,
  updated_at timestamptz not null default now()
);

create table if not exists site_copy_translations (
  key text not null references site_copy(key) on delete cascade,
  locale text not null,
  text text,
  translation_status text not null default 'pending'
    check (translation_status in ('pending', 'ok', 'failed')),
  source_hash text,
  translated_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (key, locale)
);

-- Lettura pubblica: e' testo di marketing/interfaccia, non dati
-- riservati — stesso trattamento di experience_content_translations,
-- che il sito gia' legge con la chiave anon pubblica.
alter table site_copy enable row level security;
alter table site_copy_translations enable row level security;

drop policy if exists "public read site_copy" on site_copy;
create policy "public read site_copy"
  on site_copy for select
  using (true);

drop policy if exists "public read site_copy_translations" on site_copy_translations;
create policy "public read site_copy_translations"
  on site_copy_translations for select
  using (true);

-- Nessuna policy di INSERT/UPDATE/DELETE per il ruolo anon/authenticated:
-- le uniche scritture arrivano dallo script di seed e dalla route
-- /api/translate-site-copy, entrambi lato server con la service role
-- key (che bypassa comunque RLS, come per experience_content_translations).
