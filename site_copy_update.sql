-- =========================================================
-- Aggiorna il copy live (Supabase site_copy) per il nuovo limite
-- di 4 mood selezionabili (prima 3) e aggiunge le nuove chiavi
-- per le 3 nuove categorie + i 2 nuovi mood.
--
-- src/messages/en.json e' SOLO il seed storico per
-- src/scripts/seed-site-copy.mjs: NON viene letto a runtime.
-- Il testo che gli utenti vedono davvero vive in site_copy /
-- site_copy_translations su Supabase (schema:
-- supabase-migrations/2026_site_copy.sql — key text primary key,
-- en_text text), quindi va aggiornato qui direttamente.
--
-- Dopo aver eseguito questo SQL, richiama:
--   POST /api/translate-site-copy   body: {"key":"*"}
-- per rigenerare le traduzioni italiane di tutte le chiavi
-- (comprese quelle nuove/modificate qui sotto). In alternativa,
-- per rigenerare solo le chiavi toccate da questo update, chiama
-- la stessa route una volta per ciascuna chiave elencata sotto
-- con {"key":"<chiave>"}.
-- =========================================================

-- --- 1) Chiavi ESISTENTI da aggiornare (limite mood 3 -> 4) ---

update site_copy set en_text = 'Select up to 4 Atmospheres'
where key = 'configurator.steps.moods.label';

update site_copy set en_text = '{count}/4 selected'
where key = 'configurator.selection.moodsSelected';

update site_copy set en_text = 'Maximum 4 atmospheres selections allowed'
where key = 'configurator.selection.warningMaxMoods';

-- --- 2) Nuove chiavi: 3 nuove categorie ---

insert into site_copy (key, en_text) values
  ('configurator.experienceNames.wineEscape', 'Wine Escape'),
  ('configurator.experienceNames.culturalEscape', 'Cultural Escape'),
  ('configurator.experienceNames.wellnessEscape', 'Wellness Escape')
on conflict (key) do update set en_text = excluded.en_text;

-- --- 3) Nuove chiavi: 2 nuovi mood ---

insert into site_copy (key, en_text) values
  ('configurator.moodNames.relax', 'Relax'),
  ('configurator.moodNames.indulgent', 'Indulgent')
on conflict (key) do update set en_text = excluded.en_text;

-- NOTA: la vecchia chiave "configurator.experienceNames.aerialEscape"
-- (categoria Aerial Escape) viene lasciata intatta di proposito: non
-- e' piu' referenziata da nessun componente live, ma non e' un dato
-- da cancellare (nessuna richiesta di eliminazione distruttiva).
