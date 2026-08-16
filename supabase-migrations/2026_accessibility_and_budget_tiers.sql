-- =====================================================================
-- Accessibilita' (lead + experience) e 4ª fascia budget (€200-€500).
-- Nessuna colonna esistente viene rimossa o rinominata — solo aggiunte,
-- coerente con gli altri migration file di questo progetto.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. LEAD — esigenze di accessibilita' dichiarate nello step "guests"
-- del wizard. Stessa convenzione di lead.experiences/lead.moods: un
-- array di chiavi (vedi ACCESSIBILITY_NEEDS in experienceTaxonomy.ts),
-- non colonne booleane separate — piu' semplice da estendere.
-- Nessun default: una lead vecchia senza questo campo viene letta come
-- "nessuna esigenza dichiarata" dal codice applicativo (?.needs || []),
-- non serve backfill.
-- ---------------------------------------------------------------------

alter table leads add column if not exists accessibility jsonb;

-- ---------------------------------------------------------------------
-- 2. EXPERIENCE — compatibilita' di accessibilita' dichiarata
-- dall'operatore in admin. Booleani VOLUTAMENTE nullable, senza
-- default: null/non impostato significa "nessuna informazione
-- dichiarata", diverso da false ("non accessibile"). Un'esperienza
-- esistente che non ha mai toccato questi campi resta neutra nello
-- scoring (ne' bonus ne' penalita'), non viene mai classificata come
-- inaccessibile solo perche' il campo non esisteva prima di oggi.
-- ---------------------------------------------------------------------

alter table experience_content add column if not exists accessibility_mobility_reduced boolean;
alter table experience_content add column if not exists accessibility_visual_impairment boolean;
alter table experience_content add column if not exists accessibility_hearing_impairment boolean;
alter table experience_content add column if not exists accessibility_cognitive_sensory boolean;
alter table experience_content add column if not exists accessibility_other boolean;
alter table experience_content add column if not exists accessibility_notes text;

-- ---------------------------------------------------------------------
-- 3. BUDGET — 4ª fascia €200-€500, stesso trattamento booleano opt-in
-- delle 3 gia' esistenti (budget_500_1000/1000_3000/3000_plus).
-- Backfill "sensato" (richiesto esplicitamente, vedi punto 7 della
-- spec): le esperienze GIA' esistenti il cui base_price reale ricade
-- nella nuova fascia partono spuntate, cosi' la fascia non e' vuota
-- il giorno del deploy — le 3 fasce preesistenti, gia' curate a mano
-- dall'admin, non vengono toccate.
-- ---------------------------------------------------------------------

alter table experience_filters add column if not exists budget_200_500 boolean default false;

update experience_filters ef
  set budget_200_500 = true
  from experience_content ec
  where ef.experience_id = ec.id
    and ec.base_price >= 200
    and ec.base_price < 500
    and ef.budget_200_500 is distinct from true;

-- ---------------------------------------------------------------------
-- 4. SITE COPY — rimuove le etichette qualitative del budget
-- (Essential/Signature/Luxury, mai piu' usate dal wizard dopo questa
-- modifica) e aggiunge le nuove chiavi per la sezione accessibilita'.
-- Le traduzioni per gli altri locale restano "pending" finche' non si
-- richiama POST /api/translate-site-copy con {"key":"*"} (stesso
-- processo manuale gia' in uso per ogni nuova chiave di site_copy) —
-- nel frattempo il fallback e' l'inglese, mai testo vuoto.
-- ---------------------------------------------------------------------

delete from site_copy where key in (
  'configurator.budget.essential',
  'configurator.budget.signature',
  'configurator.budget.luxury'
);

insert into site_copy (key, en_text) values
  ('configurator.guests.accessibilityQuestion', 'Does anyone in your group have specific accessibility needs?'),
  ('configurator.guests.accessibilityNo', 'No'),
  ('configurator.guests.accessibilityYes', 'Yes'),
  ('configurator.guests.accessibilityNeeds.mobilityReduced', 'Reduced mobility'),
  ('configurator.guests.accessibilityNeeds.visualImpairment', 'Visual impairment'),
  ('configurator.guests.accessibilityNeeds.hearingImpairment', 'Hearing impairment'),
  ('configurator.guests.accessibilityNeeds.cognitiveSensory', 'Cognitive/sensory needs'),
  ('configurator.guests.accessibilityNeeds.other', 'Other needs'),
  ('configurator.guests.accessibilityOtherPlaceholder', 'Tell us more (optional)')
on conflict (key) do update set en_text = excluded.en_text, updated_at = now();
