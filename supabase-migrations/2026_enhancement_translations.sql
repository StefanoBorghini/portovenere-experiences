-- =====================================================================
-- enhancement_content_translations
-- =====================================================================
-- Stesso schema/filosofia di experience_content_translations: una riga
-- di traduzione per locale, con translation_status per non mostrare
-- mai una traduzione fallita/vuota (fallback automatico all'inglese).
--
-- Il catalogo enhancement e' piccolo e stabile (poche righe, cambiano
-- raramente) — a differenza delle experience, qui non serve un
-- meccanismo on-demand per-proposal: si traduce una volta con lo
-- script di backfill, e via via che vengono editate in admin.
--
-- Da eseguire UNA VOLTA nel SQL editor di Supabase.
-- =====================================================================

create table if not exists enhancement_content_translations (
  enhancement_id bigint not null references enhancement_content(id) on delete cascade,
  locale text not null,
  title text,
  description text,
  unselected_button_text text,
  selected_button_text text,
  translation_status text not null default 'pending'
    check (translation_status in ('pending', 'ok', 'failed')),
  source_hash text,
  translated_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (enhancement_id, locale)
);

-- Lettura pubblica: e' testo di marketing/interfaccia, non dati
-- riservati — stesso trattamento di experience_content_translations,
-- che il sito gia' legge con la chiave anon pubblica.
alter table enhancement_content_translations enable row level security;

drop policy if exists "public read enhancement_content_translations" on enhancement_content_translations;
create policy "public read enhancement_content_translations"
  on enhancement_content_translations for select
  using (true);

-- Nessuna policy di INSERT/UPDATE/DELETE per anon/authenticated: le
-- uniche scritture arrivano dallo script di backfill e dalla sync
-- lato server con la service role key (bypassa comunque RLS).
