-- =====================================================================
-- event_translations
-- =====================================================================
-- Stesso schema/filosofia di enhancement_content_translations: una riga
-- di traduzione per locale, con translation_status per non mostrare mai
-- una traduzione fallita/vuota (fallback automatico all'inglese).
--
-- Solo title/description sono traducibili — gli eventi non hanno campi
-- testuali aggiuntivi (niente prezzo/ospiti/bottoni come gli
-- enhancement). La sincronizzazione parte dal bottone "Translate now"
-- nella scheda evento in admin (vedi /api/admin/translate-event),
-- stesso meccanismo degli enhancement — non automatica a ogni salvataggio
-- per non rallentare il bottone "Save" principale con le chiamate Lara.
--
-- Da eseguire UNA VOLTA nel SQL editor di Supabase.
-- =====================================================================

create table if not exists event_translations (
  event_id uuid not null references events(id) on delete cascade,
  locale text not null,
  title text,
  description text,
  translation_status text not null default 'pending'
    check (translation_status in ('pending', 'ok', 'failed')),
  source_hash text,
  translated_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (event_id, locale)
);

-- Lettura pubblica: e' testo di marketing/interfaccia (titolo/
-- descrizione evento), non dati riservati — stesso trattamento di
-- enhancement_content_translations. Le scritture restano solo lato
-- server con la service role key (bypassa comunque RLS).
alter table event_translations enable row level security;

drop policy if exists "public read event_translations" on event_translations;
create policy "public read event_translations"
  on event_translations for select
  using (true);
