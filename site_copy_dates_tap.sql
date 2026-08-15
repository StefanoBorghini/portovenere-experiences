-- =========================================================
-- Selezione date del configuratore: da drag-to-select a tap-only.
-- Rimuove la vecchia chiave "configurator.dates.dragHint" (un solo
-- testo statico) e la sostituisce con 3 chiavi, una per stato del
-- ciclo di selezione (nessuna data / una data / intervallo completo).
--
-- src/messages/en.json e' SOLO il seed storico, non letto a runtime:
-- il testo vive in site_copy / site_copy_translations (Supabase).
--
-- Dopo aver eseguito questo SQL, richiama (una volta per chiave, cosi'
-- Lara traduce anche gli altri locale oltre a it):
--   POST /api/translate-site-copy   body: {"key":"configurator.dates.hintEmpty"}
--   POST /api/translate-site-copy   body: {"key":"configurator.dates.hintOneSelected"}
--   POST /api/translate-site-copy   body: {"key":"configurator.dates.hintRangeSelected"}
-- Le righe it sotto sono gia' inserite a mano in site_copy_translations
-- cosi' il sito mostra il testo giusto in italiano da subito, senza
-- aspettare la chiamata a Lara.
-- =========================================================

delete from site_copy where key = 'configurator.dates.dragHint';
delete from site_copy_translations where key = 'configurator.dates.dragHint';

insert into site_copy (key, en_text) values
  ('configurator.dates.hintEmpty', 'Select a date'),
  ('configurator.dates.hintOneSelected', 'Tap another date to select a range'),
  ('configurator.dates.hintRangeSelected', 'Tap a date to start a new selection')
on conflict (key) do update set en_text = excluded.en_text;

insert into site_copy_translations (key, locale, text, translation_status, translated_at, updated_at) values
  ('configurator.dates.hintEmpty', 'it', 'Seleziona una data', 'ok', now(), now()),
  ('configurator.dates.hintOneSelected', 'it', 'Tocca un''altra data per selezionare un intervallo', 'ok', now(), now()),
  ('configurator.dates.hintRangeSelected', 'it', 'Tocca una data per iniziare una nuova selezione', 'ok', now(), now())
on conflict (key, locale) do update set
  text = excluded.text,
  translation_status = excluded.translation_status,
  translated_at = excluded.translated_at,
  updated_at = excluded.updated_at;
