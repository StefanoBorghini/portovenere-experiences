-- =========================================================
-- Nuove chiavi per la Social Experience Card (sezione admin
-- "Generate Social Card" — il file immagine scaricato/inviato al
-- lead, non la UI del modale admin). Stesso pattern di
-- site_copy_events.sql: IT hand-seeded subito, le altre lingue
-- arrivano via /api/translate-site-copy.
--
-- src/messages/en.json e' SOLO il seed storico, non letto a runtime:
-- il testo vive in site_copy / site_copy_translations (Supabase).
--
-- NOTA: il mood (es. "Authentic") e la destinazione non sono qui —
-- il mood riusa configurator.moodNames.* (gia' esistente), la
-- destinazione e' la nuova chiave socialCard.destination sotto.
-- =========================================================

insert into site_copy (key, en_text) values
  ('socialCard.oneDay', 'One Day'),
  ('socialCard.days', '{count} Days'),
  ('socialCard.multiDayEscape', 'Multi-Day Escape'),
  ('socialCard.onePerson', '{count} Person'),
  ('socialCard.people', '{count} People'),
  ('socialCard.destination', 'Portovenere, Italian Riviera'),
  ('socialCard.privateExperience', 'Private Experience'),
  ('socialCard.from', 'From')
on conflict (key) do update set en_text = excluded.en_text;

insert into site_copy_translations (key, locale, text, translation_status, translated_at, updated_at) values
  ('socialCard.oneDay', 'it', 'Un Giorno', 'ok', now(), now()),
  ('socialCard.days', 'it', '{count} Giorni', 'ok', now(), now()),
  ('socialCard.multiDayEscape', 'it', 'Fuga di Piu'' Giorni', 'ok', now(), now()),
  ('socialCard.onePerson', 'it', '{count} Persona', 'ok', now(), now()),
  ('socialCard.people', 'it', '{count} Persone', 'ok', now(), now()),
  ('socialCard.destination', 'it', 'Portovenere, Riviera Italiana', 'ok', now(), now()),
  ('socialCard.privateExperience', 'it', 'Esperienza Privata', 'ok', now(), now()),
  ('socialCard.from', 'it', 'Da', 'ok', now(), now())
on conflict (key, locale) do update set
  text = excluded.text,
  translation_status = excluded.translation_status,
  translated_at = excluded.translated_at,
  updated_at = excluded.updated_at;

-- Dopo aver eseguito questo file, per avere anche fr/de/es/ru/zh/ja
-- (l'italiano e' gia' a posto sopra), chiama una volta:
--   curl -X POST https://experiences.portovenere.com/api/translate-site-copy \
--     -H "Content-Type: application/json" \
--     -d "{\"key\": \"*\"}"
-- Traduce TUTTE le chiavi di site_copy (idempotente per hash — non
-- rifa' lavoro su quelle gia' tradotte e invariate, quindi sicuro
-- da rilanciare anche se il sito ha gia' altre chiavi).
