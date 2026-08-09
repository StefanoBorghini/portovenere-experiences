-- =====================================================================
-- experience_hero_titles_translations
-- =====================================================================
-- Stesso schema/filosofia di experience_content_translations. Le hero
-- titles sono le tagline scelte a caso per esperienza (es. "Luxury
-- Under Sail") mostrate in cima alla pagina proposal — mai state
-- collegate a nessuna pipeline di traduzione.
--
-- Da eseguire UNA VOLTA nel SQL editor di Supabase.
-- =====================================================================

create table if not exists experience_hero_titles_translations (
  hero_title_id uuid not null references experience_hero_titles(id) on delete cascade,
  locale text not null,
  title text,
  translation_status text not null default 'pending'
    check (translation_status in ('pending', 'ok', 'failed')),
  source_hash text,
  translated_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (hero_title_id, locale)
);

alter table experience_hero_titles_translations enable row level security;

drop policy if exists "public read experience_hero_titles_translations" on experience_hero_titles_translations;
create policy "public read experience_hero_titles_translations"
  on experience_hero_titles_translations for select
  using (true);

-- Nessuna policy di INSERT/UPDATE/DELETE per anon/authenticated: le
-- uniche scritture arrivano dalla sync lato server (service role key,
-- bypassa comunque RLS), chiamata da syncFullExperienceTranslations
-- ogni volta che una proposal seleziona quell'esperienza.
