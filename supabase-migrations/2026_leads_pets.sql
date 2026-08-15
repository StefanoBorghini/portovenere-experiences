-- =========================================================
-- leads — aggiunge il numero di animali del gruppo (step "guests"
-- del configuratore), stesso trattamento del campo "children" gia'
-- esistente: nessuna colonna analoga a traveling_with_children,
-- 0 significa semplicemente "nessun animale".
-- =========================================================

alter table leads add column if not exists pets integer default 0;
