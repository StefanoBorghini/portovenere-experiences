-- =========================================================
-- Nuove chiavi per lo stepper "Pets" nello step guests del
-- configuratore (stesso pattern di children).
--
-- src/messages/en.json e' SOLO il seed storico, non letto a runtime:
-- il testo vive in site_copy / site_copy_translations (Supabase).
-- =========================================================

insert into site_copy (key, en_text) values
  ('configurator.guests.petsLabel', 'Pets'),
  ('configurator.guests.noPets', 'No pets'),
  ('configurator.guests.onePet', '1 pet'),
  ('configurator.guests.petsCount', '{count} pets')
on conflict (key) do update set en_text = excluded.en_text;

insert into site_copy_translations (key, locale, text, translation_status, translated_at, updated_at) values
  ('configurator.guests.petsLabel', 'it', 'Animali', 'ok', now(), now()),
  ('configurator.guests.noPets', 'it', 'Nessun animale', 'ok', now(), now()),
  ('configurator.guests.onePet', 'it', '1 animale', 'ok', now(), now()),
  ('configurator.guests.petsCount', 'it', '{count} animali', 'ok', now(), now())
on conflict (key, locale) do update set
  text = excluded.text,
  translation_status = excluded.translation_status,
  translated_at = excluded.translated_at,
  updated_at = excluded.updated_at;
