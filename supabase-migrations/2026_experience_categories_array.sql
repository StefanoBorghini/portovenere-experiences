-- =====================================================================
-- experience_content — ogni esperienza puo' ora appartenere a PIU' di
-- una delle 6 macrocategorie (Sea/Gourmet/Wine/Wild/Wellness/Cultural
-- Escape), non solo una. Aggiunge "categories" (array) accanto alla
-- vecchia colonna singola "category", che resta cosi' com'e' (nessuna
-- migrazione distruttiva, nessuna colonna rimossa) ma non viene piu'
-- letta dal codice applicativo dopo questa modifica — solo scritta,
-- per compatibilita' storica.
--
-- Backfill: ogni riga esistente parte con categories = [category],
-- cosi' nessuna esperienza sparisce dal matching del configuratore
-- finche' qualcuno non ne aggiunge/toglie manualmente dall'admin.
-- =====================================================================

alter table experience_content add column if not exists categories text[];

update experience_content
  set categories = array[category]
  where categories is null and category is not null;
