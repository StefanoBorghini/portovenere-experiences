-- =====================================================================
-- custom_payments — aggiunge checkout_url
-- =====================================================================
-- Il link Stripe generato alla creazione (session.url) non veniva
-- salvato da nessuna parte — solo mostrato/inviato una volta, poi
-- perso. Lo persistiamo qui per poterlo rivedere in seguito nella
-- pagina admin "Payments", per i soli pagamenti custom (i Concierge
-- Fee non lo richiedono, restano invariati).
-- =====================================================================

alter table custom_payments add column if not exists checkout_url text;
