-- =========================================================
-- Chiavi per i 4 preset di Call to Action della Social Experience
-- Card (dropdown "Call to action" nel modale admin — il testo scelto
-- finisce dentro l'immagine scaricata/inviata al lead, deve quindi
-- essere nella SUA lingua, non in quella dell'admin). Stesso pattern
-- di site_copy_socialcard.sql, tutte le lingue previste dal
-- configuratore (it, fr, de, es, ru, zh, ja) hand-seeded qui
-- direttamente.
--
-- Gli ID (buildYourOwn/discoverExperience/createEscape/
-- startExperience) sono stabili e non cambiano mai — vedi
-- SOCIAL_CARD_CTA_PRESET_IDS in src/types/socialCard.ts.
-- =========================================================

insert into site_copy (key, en_text) values
  ('socialCard.cta.buildYourOwn', 'BUILD YOUR OWN EXPERIENCE →'),
  ('socialCard.cta.discoverExperience', 'DISCOVER THIS EXPERIENCE →'),
  ('socialCard.cta.createEscape', 'CREATE YOUR ITALIAN ESCAPE →'),
  ('socialCard.cta.startExperience', 'START YOUR EXPERIENCE →')
on conflict (key) do update set en_text = excluded.en_text;

insert into site_copy_translations (key, locale, text, translation_status, translated_at, updated_at) values

  -- Italiano
  ('socialCard.cta.buildYourOwn', 'it', 'CREA LA TUA ESPERIENZA →', 'ok', now(), now()),
  ('socialCard.cta.discoverExperience', 'it', 'SCOPRI QUESTA ESPERIENZA →', 'ok', now(), now()),
  ('socialCard.cta.createEscape', 'it', 'CREA LA TUA FUGA ITALIANA →', 'ok', now(), now()),
  ('socialCard.cta.startExperience', 'it', 'INIZIA LA TUA ESPERIENZA →', 'ok', now(), now()),

  -- Français
  ('socialCard.cta.buildYourOwn', 'fr', 'CRÉEZ VOTRE EXPÉRIENCE →', 'ok', now(), now()),
  ('socialCard.cta.discoverExperience', 'fr', 'DÉCOUVREZ CETTE EXPÉRIENCE →', 'ok', now(), now()),
  ('socialCard.cta.createEscape', 'fr', 'CRÉEZ VOTRE ÉVASION ITALIENNE →', 'ok', now(), now()),
  ('socialCard.cta.startExperience', 'fr', 'COMMENCEZ VOTRE EXPÉRIENCE →', 'ok', now(), now()),

  -- Deutsch
  ('socialCard.cta.buildYourOwn', 'de', 'GESTALTEN SIE IHR ERLEBNIS →', 'ok', now(), now()),
  ('socialCard.cta.discoverExperience', 'de', 'ENTDECKEN SIE DIESES ERLEBNIS →', 'ok', now(), now()),
  ('socialCard.cta.createEscape', 'de', 'GESTALTEN SIE IHRE ITALIENISCHE AUSZEIT →', 'ok', now(), now()),
  ('socialCard.cta.startExperience', 'de', 'STARTEN SIE IHR ERLEBNIS →', 'ok', now(), now()),

  -- Español
  ('socialCard.cta.buildYourOwn', 'es', 'CREA TU PROPIA EXPERIENCIA →', 'ok', now(), now()),
  ('socialCard.cta.discoverExperience', 'es', 'DESCUBRE ESTA EXPERIENCIA →', 'ok', now(), now()),
  ('socialCard.cta.createEscape', 'es', 'CREA TU ESCAPADA ITALIANA →', 'ok', now(), now()),
  ('socialCard.cta.startExperience', 'es', 'COMIENZA TU EXPERIENCIA →', 'ok', now(), now()),

  -- Русский
  ('socialCard.cta.buildYourOwn', 'ru', 'СОЗДАЙТЕ СВОЙ ОПЫТ →', 'ok', now(), now()),
  ('socialCard.cta.discoverExperience', 'ru', 'УЗНАТЬ ОБ ЭТОМ ОПЫТЕ →', 'ok', now(), now()),
  ('socialCard.cta.createEscape', 'ru', 'СОЗДАЙТЕ СВОЙ ИТАЛЬЯНСКИЙ ОТДЫХ →', 'ok', now(), now()),
  ('socialCard.cta.startExperience', 'ru', 'НАЧНИТЕ СВОЙ ОПЫТ →', 'ok', now(), now()),

  -- 中文（简体）
  ('socialCard.cta.buildYourOwn', 'zh', '打造专属体验 →', 'ok', now(), now()),
  ('socialCard.cta.discoverExperience', 'zh', '探索此体验 →', 'ok', now(), now()),
  ('socialCard.cta.createEscape', 'zh', '打造你的意大利之旅 →', 'ok', now(), now()),
  ('socialCard.cta.startExperience', 'zh', '开启你的体验 →', 'ok', now(), now()),

  -- 日本語
  ('socialCard.cta.buildYourOwn', 'ja', 'あなただけの体験を作る →', 'ok', now(), now()),
  ('socialCard.cta.discoverExperience', 'ja', 'この体験を見る →', 'ok', now(), now()),
  ('socialCard.cta.createEscape', 'ja', 'イタリアの休日を作る →', 'ok', now(), now()),
  ('socialCard.cta.startExperience', 'ja', '体験を始める →', 'ok', now(), now())

on conflict (key, locale) do update set
  text = excluded.text,
  translation_status = excluded.translation_status,
  translated_at = excluded.translated_at,
  updated_at = excluded.updated_at;
