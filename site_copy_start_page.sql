-- =========================================================
-- /start (micro-landing per il traffico social) non era mai stata
-- collegata al sistema di traduzione: tutto il testo era hardcoded
-- in inglese direttamente nel componente. Ora usa useTranslations
-- come il resto del sito — queste sono le chiavi corrispondenti.
--
-- src/messages/en.json e' SOLO il seed storico, non letto a runtime:
-- il testo vive in site_copy / site_copy_translations (Supabase).
--
-- Dopo aver eseguito questo SQL, richiama (come sempre) per tradurre
-- anche in tutte le lingue attive:
--   curl -X POST https://experiences.portovenere.com/api/translate-site-copy \
--     -H "Content-Type: application/json" -d "{\"key\": \"*\"}"
-- =========================================================

insert into site_copy (key, en_text) values
  ('start.hero.eyebrow', 'Portovenere, Italy'),
  ('start.hero.title', 'Experience Portovenere, your way.'),
  ('start.hero.subtitle', 'Curated places, experiences and local stories. Build your journey around the way you want to travel.'),
  ('start.hero.cta', 'Create Your Experience'),
  ('start.hero.ctaSubtext', 'Tell us what you love. We''ll turn it into your Portovenere.'),
  ('start.links.explore.eyebrow', 'Explore Portovenere'),
  ('start.links.explore.description', 'Places, stories and inspiration for discovering the destination.'),
  ('start.links.curated.eyebrow', 'Curated Experiences'),
  ('start.links.curated.description', 'Selected ways to experience Portovenere and the Gulf of Poets.'),
  ('start.links.concierge.eyebrow', 'Speak with a Concierge'),
  ('start.links.concierge.description', 'Handpicked accommodation, restaurants, shops and local services.'),
  ('start.manifesto', 'The destination doesn''t change. The way you experience it does.'),
  ('start.workWithUs.label', 'Work With Us'),
  ('start.workWithUs.description', 'Hotels, restaurants, experience providers and travel professionals.'),
  ('start.footer.tagline', 'Travel Better.'),
  ('start.footer.privacy', 'Privacy'),
  ('start.footer.cookies', 'Cookies'),
  ('start.footer.contact', 'Contact')
on conflict (key) do update set en_text = excluded.en_text;
