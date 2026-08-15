-- =========================================================
-- experience_content — "Animals Allowed" (si/no), stesso trattamento
-- di children_allowed: default true, editabile dalla scheda
-- esperienza in admin (sezione Filters).
-- =========================================================

alter table experience_content add column if not exists animals_allowed boolean default true;
