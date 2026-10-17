-- =========================================================
-- Chiavi MANCANTI da site_copy: "proposal.introParagraphs.0..3".
--
-- Bug scoperto mentre si verificava la traduzione della Social
-- Experience Card: dynamicIntroParagraph (il paragrafo editoriale in
-- cima alla proposal page, riusato anche come descrizione della
-- social card) non passava MAI da t() — a differenza dei suoi due
-- "fratelli" identici dynamicIntroTitle/dynamicClosingParagraph, che
-- gia' peschavano da site_copy per indice
-- (proposal.introTitles.<n>/proposal.closingParagraphs.<n>, gia'
-- presenti e gia' tradotti). Il codice e' stato corretto per seguire
-- lo stesso pattern (vedi generateProposal.ts/
-- results/proposal/[slug]/page.tsx/getSocialCardDataForProposal.ts) —
-- queste chiavi mancavano semplicemente del tutto, EN incluso.
--
-- Tutte le lingue previste dal configuratore (it, fr, de, es, ru, zh,
-- ja) hand-seeded qui direttamente, stesso principio di
-- site_copy_socialcard.sql.
-- =========================================================

insert into site_copy (key, en_text) values
  ('proposal.introParagraphs.0', 'Every experience within your proposal has been carefully selected to balance atmosphere, elegance and emotional coherence across your Riviera journey.'),
  ('proposal.introParagraphs.1', 'From private sea escapes to curated culinary moments, your proposal has been designed to reflect your selected travel energy and desired pace.'),
  ('proposal.introParagraphs.2', 'Each moment has been curated to create a seamless blend of Mediterranean luxury, cinematic atmosphere and authentic local discovery.'),
  ('proposal.introParagraphs.3', 'Designed as a fully private experience, your proposal combines selected Riviera operators, curated atmospheres and exclusive moments tailored around your preferences.')
on conflict (key) do update set en_text = excluded.en_text;

insert into site_copy_translations (key, locale, text, translation_status, translated_at, updated_at) values

  -- Italiano
  ('proposal.introParagraphs.0', 'it', 'Ogni esperienza all''interno della tua proposta e'' stata selezionata con cura per bilanciare atmosfera, eleganza e coerenza emotiva lungo tutto il tuo viaggio in Riviera.', 'ok', now(), now()),
  ('proposal.introParagraphs.1', 'it', 'Dalle fughe private sul mare ai momenti gastronomici curati, la tua proposta e'' stata pensata per riflettere l''energia di viaggio e il ritmo che hai scelto.', 'ok', now(), now()),
  ('proposal.introParagraphs.2', 'it', 'Ogni momento e'' stato curato per creare un equilibrio perfetto tra lusso mediterraneo, atmosfera cinematografica e scoperta autentica del territorio.', 'ok', now(), now()),
  ('proposal.introParagraphs.3', 'it', 'Pensata come un''esperienza interamente privata, la tua proposta unisce operatori selezionati della Riviera, atmosfere curate e momenti esclusivi su misura per te.', 'ok', now(), now()),

  -- Français
  ('proposal.introParagraphs.0', 'fr', 'Chaque expérience de votre proposition a été soigneusement sélectionnée pour équilibrer atmosphère, élégance et cohérence émotionnelle tout au long de votre voyage sur la Riviera.', 'ok', now(), now()),
  ('proposal.introParagraphs.1', 'fr', 'Des escapades privées en mer aux moments culinaires soignés, votre proposition a été conçue pour refléter l''énergie de voyage et le rythme que vous avez choisis.', 'ok', now(), now()),
  ('proposal.introParagraphs.2', 'fr', 'Chaque instant a été pensé pour créer un équilibre parfait entre luxe méditerranéen, atmosphère cinématographique et découverte locale authentique.', 'ok', now(), now()),
  ('proposal.introParagraphs.3', 'fr', 'Conçue comme une expérience entièrement privée, votre proposition associe des opérateurs sélectionnés de la Riviera, des atmosphères soignées et des moments exclusifs adaptés à vos préférences.', 'ok', now(), now()),

  -- Deutsch
  ('proposal.introParagraphs.0', 'de', 'Jedes Erlebnis in Ihrem Angebot wurde sorgfältig ausgewählt, um Atmosphäre, Eleganz und emotionale Stimmigkeit während Ihrer gesamten Riviera-Reise in Einklang zu bringen.', 'ok', now(), now()),
  ('proposal.introParagraphs.1', 'de', 'Von privaten Fluchten ans Meer bis hin zu kuratierten kulinarischen Momenten wurde Ihr Angebot so gestaltet, dass es Ihre gewählte Reiseenergie und Ihr gewünschtes Tempo widerspiegelt.', 'ok', now(), now()),
  ('proposal.introParagraphs.2', 'de', 'Jeder Moment wurde kuratiert, um eine harmonische Verbindung aus mediterranem Luxus, kinoreifer Atmosphäre und authentischer lokaler Entdeckung zu schaffen.', 'ok', now(), now()),
  ('proposal.introParagraphs.3', 'de', 'Als vollständig privates Erlebnis konzipiert, vereint Ihr Angebot ausgewählte Riviera-Partner, kuratierte Atmosphären und exklusive, auf Ihre Vorlieben zugeschnittene Momente.', 'ok', now(), now()),

  -- Español
  ('proposal.introParagraphs.0', 'es', 'Cada experiencia dentro de tu propuesta ha sido cuidadosamente seleccionada para equilibrar atmósfera, elegancia y coherencia emocional a lo largo de tu viaje por la Riviera.', 'ok', now(), now()),
  ('proposal.introParagraphs.1', 'es', 'Desde escapadas privadas al mar hasta momentos gastronómicos cuidados, tu propuesta ha sido diseñada para reflejar la energía de viaje y el ritmo que has elegido.', 'ok', now(), now()),
  ('proposal.introParagraphs.2', 'es', 'Cada momento ha sido curado para crear una combinación perfecta de lujo mediterráneo, atmósfera cinematográfica y descubrimiento local auténtico.', 'ok', now(), now()),
  ('proposal.introParagraphs.3', 'es', 'Diseñada como una experiencia totalmente privada, tu propuesta combina operadores seleccionados de la Riviera, atmósferas cuidadas y momentos exclusivos a tu medida.', 'ok', now(), now()),

  -- Русский
  ('proposal.introParagraphs.0', 'ru', 'Каждый элемент вашего предложения тщательно подобран, чтобы атмосфера, элегантность и эмоциональная целостность сопровождали вас на всём протяжении путешествия по Ривьере.', 'ok', now(), now()),
  ('proposal.introParagraphs.1', 'ru', 'От уединённых морских прогулок до изысканных кулинарных моментов — ваше предложение создано так, чтобы отразить выбранный вами ритм и настроение путешествия.', 'ok', now(), now()),
  ('proposal.introParagraphs.2', 'ru', 'Каждый момент продуман так, чтобы объединить средиземноморскую роскошь, атмосферу кино и подлинное знакомство с местной культурой.', 'ok', now(), now()),
  ('proposal.introParagraphs.3', 'ru', 'Созданное как полностью приватный опыт, ваше предложение объединяет отобранных партнёров Ривьеры, продуманную атмосферу и эксклюзивные моменты, подобранные специально для вас.', 'ok', now(), now()),

  -- 中文（简体）
  ('proposal.introParagraphs.0', 'zh', '您的行程中每一项体验都经过精心挑选，以在整个里维埃拉之旅中兼顾氛围、优雅与情感上的和谐统一。', 'ok', now(), now()),
  ('proposal.introParagraphs.1', 'zh', '从私人海上之旅到精心安排的美食时刻，您的行程旨在呈现您所选择的旅行节奏与氛围。', 'ok', now(), now()),
  ('proposal.introParagraphs.2', 'zh', '每一刻都经过精心打造，完美融合地中海奢华、电影般的氛围与真实的当地探索体验。', 'ok', now(), now()),
  ('proposal.introParagraphs.3', 'zh', '作为一次完全私人定制的体验，您的行程汇集了精选的里维埃拉合作伙伴、精心营造的氛围，以及专属于您的独特时刻。', 'ok', now(), now()),

  -- 日本語
  ('proposal.introParagraphs.0', 'ja', 'ご提案の一つひとつの体験は、リビエラの旅全体を通じて雰囲気、上質さ、そして心地よい一体感を生み出すよう、丁寧に選び抜かれています。', 'ok', now(), now()),
  ('proposal.introParagraphs.1', 'ja', 'プライベートな海辺のひとときから厳選された美食の瞬間まで、ご提案はお客様が選ばれた旅のテンポと雰囲気を反映するようデザインされています。', 'ok', now(), now()),
  ('proposal.introParagraphs.2', 'ja', 'すべての瞬間が、地中海ならではの贅沢さ、映画のような雰囲気、そして本物の地元の発見が融合するよう丁寧に演出されています。', 'ok', now(), now()),
  ('proposal.introParagraphs.3', 'ja', '完全プライベートな体験として、リビエラ地域の厳選されたパートナー、洗練された雰囲気、そしてお客様の好みに合わせた特別なひとときを組み合わせています。', 'ok', now(), now())

on conflict (key, locale) do update set
  text = excluded.text,
  translation_status = excluded.translation_status,
  translated_at = excluded.translated_at,
  updated_at = excluded.updated_at;
