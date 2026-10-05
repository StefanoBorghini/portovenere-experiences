-- =========================================================
-- Nuove chiavi per la sezione Eventi (proposal page + pagina
-- evento auto-generata /events/[id]), stesso pattern di
-- site_copy_pets.sql — IT hand-seeded subito, le altre lingue
-- arrivano via /api/translate-site-copy (vedi istruzioni sotto).
--
-- src/messages/en.json e' SOLO il seed storico, non letto a runtime:
-- il testo vive in site_copy / site_copy_translations (Supabase).
-- =========================================================

insert into site_copy (key, en_text) values
  ('proposal.events.label', 'During your stay'),
  ('proposal.events.title', 'Events happening while you''re here'),
  ('proposal.events.details', 'Details →'),
  ('eventsPage.upcomingDates', 'Upcoming dates'),
  ('eventsPage.noUpcoming', 'No upcoming dates scheduled right now.'),
  ('eventsPage.details', 'Details →')
on conflict (key) do update set en_text = excluded.en_text;

insert into site_copy_translations (key, locale, text, translation_status, translated_at, updated_at) values
  ('proposal.events.label', 'it', 'Durante il tuo soggiorno', 'ok', now(), now()),
  ('proposal.events.title', 'it', 'Eventi durante il tuo soggiorno', 'ok', now(), now()),
  ('proposal.events.details', 'it', 'Dettagli →', 'ok', now(), now()),
  ('eventsPage.upcomingDates', 'it', 'Prossime date', 'ok', now(), now()),
  ('eventsPage.noUpcoming', 'it', 'Al momento non ci sono date in programma.', 'ok', now(), now()),
  ('eventsPage.details', 'it', 'Dettagli →', 'ok', now(), now())
on conflict (key, locale) do update set
  text = excluded.text,
  translation_status = excluded.translation_status,
  translated_at = excluded.translated_at,
  updated_at = excluded.updated_at;

-- Dopo aver eseguito questo file, per avere anche fr/de/es/ru/zh/ja
-- (l'italiano e' gia' a posto sopra), chiama una volta:
--   curl -X POST https://experiences.portovenere.com/api/translate-site-copy \
--     -H "Content-Type: application/json" \
--     -d '{"key": "*"}'
-- Traduce TUTTE le chiavi di site_copy (idempotente per hash — non
-- rifa' lavoro su quelle gia' tradotte e invariate, quindi sicuro
-- da rilanciare anche se il sito ha gia' altre chiavi).
