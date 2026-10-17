-- =========================================================
-- Nuove chiavi per la Social Experience Card (sezione admin
-- "Generate Social Card" — il file immagine scaricato/inviato al
-- lead, non la UI del modale admin). Tutte le lingue previste dal
-- configuratore (SUPPORTED_TARGET_LOCALES: it, fr, de, es, ru, zh, ja)
-- hand-seeded qui direttamente, nessuna chiamata a
-- /api/translate-site-copy necessaria per queste chiavi.
--
-- src/messages/en.json e' SOLO il seed storico, non letto a runtime:
-- il testo vive in site_copy / site_copy_translations (Supabase).
--
-- NOTA: il mood (es. "Authentic") non e' qui — riusa
-- configurator.moodNames.* (gia' esistente in tutte le lingue).
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

  -- Italiano
  ('socialCard.oneDay', 'it', 'Un Giorno', 'ok', now(), now()),
  ('socialCard.days', 'it', '{count} Giorni', 'ok', now(), now()),
  ('socialCard.multiDayEscape', 'it', 'Fuga di Piu'' Giorni', 'ok', now(), now()),
  ('socialCard.onePerson', 'it', '{count} Persona', 'ok', now(), now()),
  ('socialCard.people', 'it', '{count} Persone', 'ok', now(), now()),
  ('socialCard.destination', 'it', 'Portovenere, Riviera Italiana', 'ok', now(), now()),
  ('socialCard.privateExperience', 'it', 'Esperienza Privata', 'ok', now(), now()),
  ('socialCard.from', 'it', 'Da', 'ok', now(), now()),

  -- Français
  ('socialCard.oneDay', 'fr', 'Une Journée', 'ok', now(), now()),
  ('socialCard.days', 'fr', '{count} Jours', 'ok', now(), now()),
  ('socialCard.multiDayEscape', 'fr', 'Évasion de Plusieurs Jours', 'ok', now(), now()),
  ('socialCard.onePerson', 'fr', '{count} Personne', 'ok', now(), now()),
  ('socialCard.people', 'fr', '{count} Personnes', 'ok', now(), now()),
  ('socialCard.destination', 'fr', 'Portovenere, Riviera Italienne', 'ok', now(), now()),
  ('socialCard.privateExperience', 'fr', 'Expérience Privée', 'ok', now(), now()),
  ('socialCard.from', 'fr', 'Dès', 'ok', now(), now()),

  -- Deutsch
  ('socialCard.oneDay', 'de', 'Ein Tag', 'ok', now(), now()),
  ('socialCard.days', 'de', '{count} Tage', 'ok', now(), now()),
  ('socialCard.multiDayEscape', 'de', 'Mehrtägige Auszeit', 'ok', now(), now()),
  ('socialCard.onePerson', 'de', '{count} Person', 'ok', now(), now()),
  ('socialCard.people', 'de', '{count} Personen', 'ok', now(), now()),
  ('socialCard.destination', 'de', 'Portovenere, Italienische Riviera', 'ok', now(), now()),
  ('socialCard.privateExperience', 'de', 'Private Erfahrung', 'ok', now(), now()),
  ('socialCard.from', 'de', 'Ab', 'ok', now(), now()),

  -- Español
  ('socialCard.oneDay', 'es', 'Un Día', 'ok', now(), now()),
  ('socialCard.days', 'es', '{count} Días', 'ok', now(), now()),
  ('socialCard.multiDayEscape', 'es', 'Escapada de Varios Días', 'ok', now(), now()),
  ('socialCard.onePerson', 'es', '{count} Persona', 'ok', now(), now()),
  ('socialCard.people', 'es', '{count} Personas', 'ok', now(), now()),
  ('socialCard.destination', 'es', 'Portovenere, Riviera Italiana', 'ok', now(), now()),
  ('socialCard.privateExperience', 'es', 'Experiencia Privada', 'ok', now(), now()),
  ('socialCard.from', 'es', 'Desde', 'ok', now(), now()),

  -- Русский
  ('socialCard.oneDay', 'ru', 'Один День', 'ok', now(), now()),
  ('socialCard.days', 'ru', '{count} Дней', 'ok', now(), now()),
  ('socialCard.multiDayEscape', 'ru', 'Многодневный Отдых', 'ok', now(), now()),
  ('socialCard.onePerson', 'ru', '{count} Человек', 'ok', now(), now()),
  ('socialCard.people', 'ru', '{count} Человек', 'ok', now(), now()),
  ('socialCard.destination', 'ru', 'Портовенере, Итальянская Ривьера', 'ok', now(), now()),
  ('socialCard.privateExperience', 'ru', 'Частный Опыт', 'ok', now(), now()),
  ('socialCard.from', 'ru', 'От', 'ok', now(), now()),

  -- 中文（简体）
  ('socialCard.oneDay', 'zh', '一天', 'ok', now(), now()),
  ('socialCard.days', 'zh', '{count} 天', 'ok', now(), now()),
  ('socialCard.multiDayEscape', 'zh', '多日之旅', 'ok', now(), now()),
  ('socialCard.onePerson', 'zh', '{count} 人', 'ok', now(), now()),
  ('socialCard.people', 'zh', '{count} 人', 'ok', now(), now()),
  ('socialCard.destination', 'zh', '波托韦内雷，意大利里维埃拉', 'ok', now(), now()),
  ('socialCard.privateExperience', 'zh', '私人体验', 'ok', now(), now()),
  ('socialCard.from', 'zh', '起', 'ok', now(), now()),

  -- 日本語
  ('socialCard.oneDay', 'ja', '1日', 'ok', now(), now()),
  ('socialCard.days', 'ja', '{count}日間', 'ok', now(), now()),
  ('socialCard.multiDayEscape', 'ja', '複数日の休暇', 'ok', now(), now()),
  ('socialCard.onePerson', 'ja', '{count}名', 'ok', now(), now()),
  ('socialCard.people', 'ja', '{count}名', 'ok', now(), now()),
  ('socialCard.destination', 'ja', 'ポルトヴェーネレ、イタリアンリビエラ', 'ok', now(), now()),
  ('socialCard.privateExperience', 'ja', 'プライベート体験', 'ok', now(), now()),
  ('socialCard.from', 'ja', 'から', 'ok', now(), now())

on conflict (key, locale) do update set
  text = excluded.text,
  translation_status = excluded.translation_status,
  translated_at = excluded.translated_at,
  updated_at = excluded.updated_at;
