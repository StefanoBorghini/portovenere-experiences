-- =====================================================================
-- Nuove categorie Experience (Wine Escape, Cultural Escape, Wellness
-- Escape, rimozione pubblica di Aerial Escape) + nuovi Mood (Relax,
-- Indulgent).
--
-- CATEGORIE: experience_content.category e' gia' una colonna text
-- libera, senza CHECK/enum — nessuna modifica di schema necessaria per
-- le nuove categorie. Le esperienze gia' taggate "aerial_escape" NON
-- vengono toccate da questa migration (nessun UPDATE/DELETE): restano
-- nel database cosi' come sono, semplicemente non piu' selezionabili
-- ne' visibili pubblicamente una volta applicato il codice aggiornato
-- (vedi src/lib/config/experienceTaxonomy.ts) — l'admin puo'
-- riassegnarle a una categoria valida dal normale editor esperienza.
--
-- MOOD: experience_scoring gia' ha romantic_score/authentic_score/
-- adventure_score/cinematic_score (tabella pre-esistente, nessuna sua
-- definizione CREATE TABLE tracciata in questo folder migrations) —
-- aggiungo qui le 2 nuove colonne con lo stesso trattamento "colonna
-- numerica libera" delle altre 4, senza assumere vincoli/default che
-- non posso verificare sullo schema live.
-- =====================================================================

alter table experience_scoring add column if not exists relax_score numeric;
alter table experience_scoring add column if not exists indulgent_score numeric;
