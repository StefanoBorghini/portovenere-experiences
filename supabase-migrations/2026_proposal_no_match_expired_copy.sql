-- =====================================================================
-- site_copy — "No matching experience found" e "This proposal has
-- expired" (results/proposal/[slug]/page.tsx) erano testo fisso in
-- inglese, mai passato da t(), quindi mai tradotto per gli altri
-- locale. Aggiunge le chiavi mancanti sotto proposal.noMatch/expired.
-- =====================================================================

insert into site_copy (key, en_text) values
  ('proposal.noMatch.title', 'No matching experience found'),
  ('proposal.noMatch.description', 'We couldn''t find an experience matching these preferences yet. Contact us directly to request a new curated proposal.'),
  ('proposal.noMatch.cta', 'Back to configurator'),
  ('proposal.expired.title', 'This proposal has expired'),
  ('proposal.expired.description', 'Your private reservation window is no longer active. Contact us directly to request a new curated proposal.')
on conflict (key) do update set en_text = excluded.en_text, updated_at = now();
