// =========================================================
// generateProposal.ts
// COMPLETE UPDATED VERSION — guestCount ora somma adulti +
// bambini per capacità/matching (guest_X, max_participants,
// min_participants), coerente con quello che già facevano i
// tier di prezzo.
//
// AGGIUNTA — Fascia oraria preferita (richiesta LPG Italia):
// priorità di scoring (non filtro escludente) per le esperienze
// compatibili con available_<fascia> === true. Essendo un bonus
// di punteggio e non un filtro, il "rilassamento" richiesto dalla
// spec quando nessuna esperienza soddisfa il requisito è già
// garantito per costruzione — non serve logica separata.
//
// AGGIORNATO — Hero Title ora per-esperienza (experience_hero_titles),
// non piu' una lookup statica per categoria+mood (proposalTitles).
// Ogni esperienza porta i propri titoli hero via
// getActiveHeroTitleStrings() -> experience.hero_titles: string[],
// caricati da getFullExperiences(). Se l'esperienza non ne ha
// ancora nessuno, fallback sul titolo dell'esperienza stessa, poi
// sul default generico — stessa catena di fallback di prima.
// Questo risolve anche il limite del vecchio proposalTitles, che
// copriva solo 4 delle 8 categorie reali.
//
// AGGIUNTA — Min Participants (pavimento esatto): specchia
// max_participants. Un'esperienza con min_participants valorizzato
// viene esclusa se il gruppo richiesto (adulti + bambini) è
// inferiore al minimo — utile per esperienze con costi fissi che
// non hanno senso sotto una certa soglia di partecipanti.
//
// AGGIUNTA — Min Days (durata minima del viaggio): tripDays viene
// calcolato dal chiamante (start_date/end_date del lead) e passato
// come prop opzionale. Un'esperienza con min_days valorizzato viene
// esclusa se il viaggio richiesto dura meno giorni del minimo —
// utile per esperienze che non si possono fare in giornata (es.
// richiedono almeno un weekend). Se tripDays non viene passato dal
// chiamante, il filtro non si applica (comportamento invariato),
// stesso principio giа usato per preferredTime.
// =========================================================


import {

  introTitles,

  introParagraphs,

  closingParagraphs,

} from "@/lib/proposalCopy";

import { isCompatibleWithDateRange } from "@/lib/availability/resolveAvailability";

import {
  experienceCompatibility,
} from "./experienceCompatibility";

import {
  MOODS,
  BUDGET_TIERS,
  ACCESSIBILITY_NEEDS,
} from "@/lib/config/experienceTaxonomy";

import { calculateProposalTotal } from "@/lib/pricing/calculateProposalTotal";

// =========================================================
// BUDGET — il budget del cliente e' la capacita' di spesa
// COMPLESSIVA della proposta (Experience + Enhancement + eventuali
// altre componenti), non il prezzo massimo della singola Experience.
// Niente filtro rigido: un'Experience sotto la fascia lascia
// semplicemente margine per aggiungere altro (mai penalizzata per
// questo), un'Experience sopra la fascia perde punteggio in modo
// continuo — nessuna esclusione automatica, nessuna soglia fissa.
//
// Il prezzo usato e' quello REALE per questo lead (calculateProposalTotal,
// la stessa funzione gia' usata per il prezzo mostrato in proposal —
// tiene conto di pricing_type "per_person"/tier a scaglioni/seasonal
// pricing, non il base_price grezzo), non un nuovo calcolo inventato.
// =========================================================

function findBudgetTier(budget?: string | null) {
  return BUDGET_TIERS.find((tier) => tier.key === budget) || null;
}

// Bonus pieno se il prezzo reale dell'esperienza (per QUESTO lead) sta
// entro il tetto della fascia richiesta — mai penalizzata per essere
// sotto: e' esattamente lo spazio che resta per Enhancement/altre
// componenti. Sopra il tetto, la penalita' cresce con continuita' in
// proporzione a quanto lo si supera RISPETTO ALL'AMPIEZZA della fascia
// stessa (non un valore assoluto fisso) — cosi' la stessa formula si
// auto-calibra sia per una fascia stretta (200-500) che per una larga
// (1000-3000), senza soglie arbitrarie diverse per ciascuna.
//
// Calibrazione (fascia 500-1000, ampiezza 500): totale 950 (nel tetto)
// -> +60; 1050 (+10% dell'ampiezza sopra il tetto) -> +57; 1400 (+80%)
// -> +17; 2500 (+300%) -> pavimento a -90. Stessi pesi di ordine di
// grandezza delle altre penalita' dello scoring (idealGuests -100,
// accessibilita' -70).
const BUDGET_IN_RANGE_BONUS = 60;
const BUDGET_OVER_PENALTY_RATE = 30;
const BUDGET_SCORE_FLOOR = -90;

function computeBudgetRelevanceScore(
  budget: string | undefined,
  experience: any,
  guests: string,
  children: number | string | undefined,
  checkInDate: string | null | undefined
): number {

  const tier = findBudgetTier(budget);

  if (!tier) return 0;

  const estimatedPrice = calculateProposalTotal({
    experiences: [experience],
    guests,
    children,
    checkInDate,
  });

  if (!estimatedPrice) return 0;

  if (estimatedPrice <= tier.max) return BUDGET_IN_RANGE_BONUS;

  const tierWidth = tier.max - tier.min;

  const overFraction = (estimatedPrice - tier.max) / tierWidth;

  const penalty =
    BUDGET_OVER_PENALTY_RATE * (overFraction + overFraction * overFraction);

  return Math.max(
    BUDGET_SCORE_FLOOR,
    BUDGET_IN_RANGE_BONUS - penalty
  );
}

// =========================================================
// ACCESSIBILITA' — solo scoring, mai esclusione (vedi richiesta
// esplicita: un'esperienza che non dichiara compatibilita' con
// un'esigenza richiesta non deve sparire, deve solo perdere terreno
// rispetto a una che la dichiara compatibile). Un campo esperienza
// mai valorizzato (null/undefined = "nessuna informazione
// dichiarata") resta neutro: ne' bonus ne' penalita', cosi' le
// esperienze esistenti non vengono mai penalizzate solo perche' il
// campo non c'era prima di oggi.
// =========================================================

function computeAccessibilityScore(
  accessibility: { needs?: string[] } | null | undefined,
  experience: any
): number {

  const needs = accessibility?.needs ?? [];

  let score = 0;

  needs.forEach((needKey) => {

    const needDef = ACCESSIBILITY_NEEDS.find((n) => n.key === needKey);

    if (!needDef) return;

    const value = experience[needDef.dbField];

    if (value === true) score += 70;
    else if (value === false) score -= 70;
  });

  return score;
}

interface GenerateProposalProps {

  experiencesSelected: string[];

  moodsSelected: string[];

  budget: string;

  guests: string;

  // NUOVO — prima c'era solo travelingWithChildren (booleano),
  // che non basta per sapere QUANTI bambini sommare al conteggio
  // ospiti. children resta opzionale: se non passato, si comporta
  // come prima (0 bambini sommati).
  children?: number | string;

  travelingWithChildren: boolean;

  // NUOVO — esigenze di accessibilita' dichiarate dal cliente nello
  // step "guests" (vedi ACCESSIBILITY_NEEDS in experienceTaxonomy.ts).
  // Opzionale: se non passato o needs vuoto, nessun bonus/penalita' di
  // scoring viene applicato — comportamento identico a prima
  // dell'introduzione del parametro.
  accessibility?: {
    needs?: string[];
    otherDetails?: string;
  } | null;

  // NUOVO — "morning" | "afternoon" | "sunset" | "full_day".
  // Opzionale: se non passato (utente non l'ha selezionata nel
  // wizard), nessun bonus di scoring viene applicato — comportamento
  // identico a prima dell'introduzione del parametro.
  preferredTime?: string;

  // NUOVO — numero di giorni del viaggio richiesto dal cliente,
  // calcolato dal chiamante da start_date/end_date (inclusivo:
  // stesso giorno = 1, giorno dopo = 2, ecc.). Opzionale: se non
  // passato, il filtro min_days non si applica a nessuna esperienza
  // (comportamento identico a prima dell'introduzione del parametro).
  tripDays?: number;

  // NUOVO — date grezze scelte dal cliente (stesso start_date/end_date
  // da cui tripDays e' gia' calcolato dal chiamante), per lo screening
  // di disponibilita' stagionale/settimanale/eccezioni (vedi
  // src/lib/availability/resolveAvailability.ts). Opzionali: se non
  // passate, matchesAvailability e' sempre true — nessuna esperienza
  // esclusa per disponibilita' (comportamento identico a prima
  // dell'introduzione del parametro).
  startDate?: string | null;

  endDate?: string | null;

  allExperiences: any[];
}



export function generateProposal({

  experiencesSelected,

  moodsSelected,

  budget,

  guests,

  children,

  travelingWithChildren,

  accessibility,

  preferredTime,

  tripDays,

  startDate,

  endDate,

  allExperiences,

}: GenerateProposalProps) {
const safeExperiencesSelected =
  experiencesSelected ?? [];

const safeMoodsSelected =
  moodsSelected ?? [];

  // =========================================================
  // GUEST COUNT — somma adulti + bambini, per capire se
  // un'esperienza ha davvero posto per TUTTI (barca, tavolo,
  // ecc. contano le teste, non solo gli adulti). Stessa logica
  // già usata da calculatePrice() per i tier a scaglioni.
  // =========================================================

  const adultsCount = Number(guests) || 0;
  const childrenCount = Number(children) || 0;
  const totalGuestCount = adultsCount + childrenCount;

  // =========================================================
  // FASCIA ORARIA — nome del campo booleano su experience_filters
  // corrispondente al valore scelto nel wizard, es. "morning" ->
  // "available_morning". undefined se preferredTime non e' stato
  // passato, cosi' il controllo piu' sotto (experience[...]) risulta
  // sempre false/undefined senza bisogno di un if separato.
  // =========================================================

  const preferredTimeField =
    preferredTime ? `available_${preferredTime}` : null;

  // =========================================================
  // FILTER EXPERIENCES
  // =========================================================

  const safeAllExperiences =
  allExperiences ?? [];

const filteredExperiences =
  safeAllExperiences.filter(
      (experience) => {

        // =====================================================
        // MACRO CATEGORY
        // =====================================================

    const normalizedSelected =
  safeExperiencesSelected.map(
    (category) =>
      category
        .toLowerCase()
        .replaceAll(" ", "_")
  );

const matchesCategory =

  normalizedSelected.length === 0 ||

  (experience.categories ?? []).some((category: string) =>
    normalizedSelected.includes(category)
  );


        // =====================================================
        // GUESTS — usa totalGuestCount (adulti + bambini), non
        // solo adulti: un bambino occupa comunque un posto barca/
        // tavolo/ecc.
        // =====================================================

const matchesGuests =
  totalGuestCount === 2
    ? experience.guest_2
  : totalGuestCount >= 3 && totalGuestCount <= 4
    ? experience.guest_3_4
  : totalGuestCount >= 5 && totalGuestCount <= 7
    ? experience.guest_5_7
  : totalGuestCount >= 8 && totalGuestCount <= 12
    ? experience.guest_8_12
  : totalGuestCount >= 13 && totalGuestCount <= 20
    ? experience.guest_13_20
  : totalGuestCount > 20
    ? experience.guest_20_plus
  : true;

        // Budget: niente filtro rigido qui — il cliente indica una
        // capacita' di spesa complessiva per l'intera proposta
        // (Experience + Enhancement), non un tetto per la singola
        // Experience. Il segnale budget agisce solo come bonus/
        // penalita' nello scoring, vedi computeBudgetRelevanceScore
        // piu' sotto.

        // =====================================================
        // CHILDREN
        // Se si viaggia con bambini, esclude del tutto le
        // esperienze non adatte (non solo penalizza) — campo
        // reale su experience_content: children_allowed.
        // Se non si viaggia con bambini, nessun filtro.
        // =====================================================

        const matchesChildren =

          !travelingWithChildren ||

          experience.children_allowed === true;

        // =====================================================
        // ACTIVE
        // Un'esperienza disattivata da /admin/experiences non
        // deve MAI comparire in una proposal, a prescindere da
        // quanto bene fa match sugli altri criteri. Usiamo
        // "!== false" (non "=== true") cosi' un record senza il
        // campo valorizzato resta visibile di default, e sparisce
        // solo quando qualcuno lo disattiva esplicitamente.
        // =====================================================

        const matchesActive =
          experience.active !== false;

        // =====================================================
        // MAX PARTICIPANTS
        // Tetto ESATTO, indipendente dalle checkbox guest_X sopra.
        // Usa anch'esso totalGuestCount (adulti + bambini), stesso
        // motivo di matchesGuests: un bambino occupa comunque un
        // posto reale.
        // =====================================================

        const matchesMaxParticipants =
          experience.max_participants == null ||
          totalGuestCount <= experience.max_participants;

        // =====================================================
        // MIN PARTICIPANTS
        // Pavimento ESATTO, stesso principio del tetto massimo
        // ma nella direzione opposta: esclude l'esperienza se il
        // gruppo richiesto è più piccolo del minimo dichiarato.
        // =====================================================

        const matchesMinParticipants =
          experience.min_participants == null ||
          totalGuestCount >= experience.min_participants;

        // =====================================================
        // MIN DAYS
        // Esclude l'esperienza se il viaggio richiesto dura meno
        // giorni del minimo dichiarato (es. non fattibile in
        // giornata, serve almeno un weekend). Se tripDays non e'
        // stato passato dal chiamante, il filtro non si applica —
        // stesso principio di preferredTime/preferredTimeField.
        // =====================================================

        const matchesMinDays =
          experience.min_days == null ||
          tripDays == null ||
          tripDays >= experience.min_days;

        // =====================================================
        // AVAILABILITY — screening di compatibilita' con le date
        // scelte dal cliente (non prenotazione, vedi
        // resolveAvailability.ts). Se startDate non e' stato passato
        // dal chiamante, il filtro non si applica — stesso principio
        // di preferredTime/tripDays.
        // =====================================================

        const matchesAvailability = isCompatibleWithDateRange(
          {
            seasons: experience.availability_seasons,
            weekdays: experience.availability_weekdays,
            dates: experience.availability_dates,
          },
          startDate,
          endDate,
          experience.requires_specific_date === true
        );

        return (

          matchesCategory &&

          matchesGuests &&

          matchesChildren &&

          matchesActive &&

          matchesMaxParticipants &&

          matchesMinParticipants &&

          matchesMinDays &&

          matchesAvailability
        );
      }
    );

  // =========================================================
  // SCORE EXPERIENCES
  // =========================================================

  const scoredExperiences =

    filteredExperiences.map(
      (experience) => {

        // =====================================================
        // BASE SCORE
        // =====================================================

        let score = 0;

        // =====================================================
        // IDEAL GUESTS
        // =====================================================

        if (

          experience.idealGuests?.includes(
            guests
          )

        ) {

          score += 80;

        } else {

          score -= 100;
        }

        // =====================================================
        // LUXURY PRIORITY
        // =====================================================

        score +=

          (
            experience.luxuryPriority || 1
          ) * 20;

        // =====================================================
        // MOOD REFINEMENT — stessa formula di sempre (peso ×10 per
        // mood selezionato, additivo, nessuna normalizzazione), ora
        // guidata da MOODS invece di una catena di if hardcoded: si
        // estende automaticamente a nuovi mood senza toccare questo
        // file, vedi src/lib/config/experienceTaxonomy.ts.
        // =====================================================

        MOODS.forEach((mood) => {
          if (safeMoodsSelected.includes(mood.label)) {
            score += (experience[mood.scoreField] ?? 0) * 10;
          }
        });

        // =====================================================
        // FASCIA ORARIA PREFERITA — bonus di priorità, non filtro.
        // +50 se l'esperienza e' disponibile nella fascia scelta
        // dal cliente (peso intermedio tra "ideal guests" ±80/100
        // e un singolo punto mood ±10, coerente con l'importanza
        // relativa che la spec le assegna: "priorità", non
        // requisito assoluto).
        // =====================================================

        if (

          preferredTimeField &&

          experience[preferredTimeField] === true

        ) {

          score += 50;
        }

        // =====================================================
        // BUDGET RELEVANCE — bonus/penalita' basato sul base_price
        // reale, non solo sul checkbox budget_* (che resta un filtro
        // rigido separato, vedi matchesBudget sopra). Vedi
        // computeBudgetRelevanceScore in cima al file.
        // =====================================================

        score += computeBudgetRelevanceScore(budget, experience, guests, children, startDate);

        // =====================================================
        // ACCESSIBILITA' — bonus se l'esperienza dichiara
        // compatibilita' con un'esigenza richiesta, penalita' (non
        // esclusione) se la dichiara esplicitamente incompatibile,
        // neutro se non dichiarata. Vedi computeAccessibilityScore.
        // =====================================================

        score += computeAccessibilityScore(accessibility, experience);

        // =====================================================
        // RETURN
        // =====================================================

        return {

          ...experience,

          finalScore: score,
        };
      }
    );

  // =========================================================
  // SORT
  // =========================================================

  const sortedExperiences =

    scoredExperiences.sort(
      (a, b) =>

        b.finalScore - a.finalScore
    );






    // =====================================================
// MAIN CATEGORY PRIORITY
// =====================================================





  // =========================================================
  // BEST EXPERIENCE
  // =========================================================

// trova la categoria principale
// (la prima selezionata dal cliente)
const selectedMainCategory =

  safeExperiencesSelected[0]
    ?.toLowerCase()
    .replaceAll(" ", "_");

const bestExperience =

  sortedExperiences.find(
    experience =>

      (experience.categories ?? []).includes(
        selectedMainCategory
      )
  ) ||

  sortedExperiences[0];

  // =========================================================
// FALLBACK + DIAGNOSTIC
// =========================================================

if (!bestExperience) {

  const normalizedSelected =
    safeExperiencesSelected.map((category) =>
      category.toLowerCase().replaceAll(" ", "_")
    );

  const matchingCategory = safeAllExperiences.filter(
    (experience) =>
      normalizedSelected.length === 0 ||
      (experience.categories ?? []).some((category: string) =>
        normalizedSelected.includes(category)
      )
  );

  const matchingCategoryAndGuests = matchingCategory.filter((experience) => {
    if (totalGuestCount === 2) return experience.guest_2;
    if (totalGuestCount >= 3 && totalGuestCount <= 4) return experience.guest_3_4;
    if (totalGuestCount >= 5 && totalGuestCount <= 7) return experience.guest_5_7;
    if (totalGuestCount >= 8) return experience.guest_8_plus;
    return true;
  });

  return {

    heroTitle: "Mediterranean Escape",
    heroImage: "/images/default-hero.webp",
    featuredExperience: null,
    scoredExperiences: [],
    includedSections: [],
    compatibilityData: null,

    noMatchDebug: {
      categorySelected: safeExperiencesSelected,
      guests: totalGuestCount,
      budget,
      totalExperiences: safeAllExperiences.length,
      matchingCategoryCount: matchingCategory.length,
      matchingCategoryTitles: matchingCategory.map((e) => e.title),
      matchingCategoryAndGuestsCount: matchingCategoryAndGuests.length,
    },
  };
}
// bestExperience arriva gia' completo da Supabase (getFullExperiences) —
// nessuna sovrascrittura da fonti statiche esterne, per evitare
// esattamente il tipo di bug per cui una vecchia entry hardcoded
// (rimossa) vinceva sul dato reale del CMS per una sola esperienza.


// =========================================================
// SUGGESTED ADD-ONS
// Solo quando è stata selezionata una sola categoria —
// altrimenti "Included Experiences" resterebbe vuota
// =========================================================

let suggestedAddOns: any[] = [];

if (safeExperiencesSelected.length === 1) {

  suggestedAddOns = safeAllExperiences

    .filter((experience) => experience.id !== bestExperience.id)

    .filter(
      (experience) =>
        !(experience.categories ?? []).some((category: string) =>
          (bestExperience.categories ?? []).includes(category)
        )
    )

    // Stesso fix: un'esperienza disattivata non deve comparire
    // nemmeno tra i suggerimenti (prima non c'era nessun controllo
    // qui, esattamente come nel filtro principale).
    .filter((experience) => experience.active !== false)

    // Stesso tetto massimo esatto anche per i suggerimenti,
    // stesso totalGuestCount (adulti + bambini).
    .filter(
      (experience) =>
        experience.max_participants == null ||
        totalGuestCount <= experience.max_participants
    )

    // Stesso pavimento minimo esatto anche per i suggerimenti.
    .filter(
      (experience) =>
        experience.min_participants == null ||
        totalGuestCount >= experience.min_participants
    )

    // Stesso vincolo di durata minima anche per i suggerimenti.
    .filter(
      (experience) =>
        experience.min_days == null ||
        tripDays == null ||
        tripDays >= experience.min_days
    )

    .filter((experience) => {

      const matchesGuests =
        totalGuestCount === 2
          ? experience.guest_2
        : totalGuestCount >= 3 && totalGuestCount <= 4
          ? experience.guest_3_4
        : totalGuestCount >= 5 && totalGuestCount <= 7
          ? experience.guest_5_7
        : totalGuestCount >= 8 && totalGuestCount <= 12
          ? experience.guest_8_12
        : totalGuestCount >= 13 && totalGuestCount <= 20
          ? experience.guest_13_20
        : totalGuestCount > 20
          ? experience.guest_20_plus
        : true;

      // Budget: nessun filtro rigido anche qui, stesso principio del
      // blocco principale — solo bonus/penalita' nello scoring.

      // Stesso filtro children applicato anche ai suggerimenti,
      // per coerenza con la lista principale.
      const matchesChildren =
        !travelingWithChildren ||
        experience.children_allowed === true;

      return matchesGuests && matchesChildren;
    })

    .map((experience) => {

      let score = (experience.luxuryPriority || 1) * 20;

      MOODS.forEach((mood) => {
        if (safeMoodsSelected.includes(mood.label)) {
          score += (experience[mood.scoreField] ?? 0) * 10;
        }
      });

      // Stesso bonus fascia oraria applicato anche ai suggerimenti,
      // per coerenza con la lista principale.
      if (
        preferredTimeField &&
        experience[preferredTimeField] === true
      ) {
        score += 50;
      }

      // Stessi bonus/penalita' budget + accessibilita' applicati
      // anche ai suggerimenti, per coerenza con la lista principale.
      score += computeBudgetRelevanceScore(budget, experience, guests, children, startDate);
      score += computeAccessibilityScore(accessibility, experience);

      return { ...experience, finalScore: score };
    })

    .sort((a, b) => b.finalScore - a.finalScore);


}
 // =========================================================
// HERO TITLE — per-esperienza (experience_hero_titles), non piu'
// una lookup statica per categoria+mood. bestExperience.hero_titles
// arriva da getFullExperiences() come array di righe complete
// ({id, title, active, display_order}), stesso pattern di facts/
// sections — filtriamo le attive e prendiamo solo il titolo. Se
// vuoto, fallback sul titolo dell'esperienza, poi sul default
// generico.
// =========================================================

const availableHeroTitles: string[] =

  (bestExperience?.hero_titles || [])
    .filter((heroTitle: any) => heroTitle.active !== false)
    .map((heroTitle: any) => heroTitle.title);

const heroTitle =

  availableHeroTitles.length > 0

    ? availableHeroTitles[
        Math.floor(
          Math.random() *
          availableHeroTitles.length
        )
      ]

    : bestExperience?.title ||

      "Private Riviera Experience";

// =========================================================
// HERO IMAGE
// =========================================================
// =========================================================
// DYNAMIC INTRO COPY
// =========================================================



// Indice, non solo la stringa risolta: il chiamante server-side
// (results/proposal/[slug]/page.tsx) lo usa per pescare la versione
// tradotta da site_copy (proposal.introTitles.<indice>) invece del
// testo inglese fisso qui sotto, che resta solo come fallback per chi
// non passa dal next-intl (es. contenuto delle email di notifica).

const dynamicIntroTitleIndex =
  Math.floor(Math.random() * introTitles.length);

const dynamicIntroTitle =
  introTitles[dynamicIntroTitleIndex];

const dynamicIntroParagraph =

  introParagraphs[
    Math.floor(
      Math.random() *
      introParagraphs.length
    )
  ];

// =========================================================
// DYNAMIC CLOSING COPY
// =========================================================

const dynamicClosingParagraphIndex =
  Math.floor(Math.random() * closingParagraphs.length);

const dynamicClosingParagraph =
  closingParagraphs[dynamicClosingParagraphIndex];
  // =========================================================
  // HERO IMAGE
  // =========================================================

 let heroImage =
  bestExperience.hero_image ||
  bestExperience.featured_image ||
  bestExperience.gallery?.[0]?.image_url ||
  "/images/default.webp";
  // =========================================================
  // SINGLE CATEGORY + SINGLE MOOD
  // =========================================================

  if (
  safeExperiencesSelected.length === 1 &&
  safeMoodsSelected.length === 2
){

    const key =

    `${safeExperiencesSelected[0]}-${safeMoodsSelected[0]}`;

    const combinationHero =

  (bestExperience as any)
    ?.heroCombinations?.[
      key
    ];

    if (combinationHero) {

      heroImage =
        combinationHero;
    }
  }

  // =========================================================
  // SINGLE CATEGORY + DOUBLE MOOD
  // =========================================================

  if (
  safeExperiencesSelected.length === 1 &&
  safeMoodsSelected.length === 1
) {

    const sortedMood =

      [...safeMoodsSelected].sort();

    const key =

      `${experiencesSelected[0]}-${sortedMood[0]}-${sortedMood[1]}`;

    const combinationHero =

  (bestExperience as any)
    ?.heroCombinations?.[
      key
    ];

    if (combinationHero) {

      heroImage =
        combinationHero;
    }
  }

  // =========================================================
  // DOUBLE CATEGORY + SINGLE MOOD
  // =========================================================

   if (
  safeExperiencesSelected.length === 2 &&
  safeMoodsSelected.length === 1
) {
const orderedCategories =
  safeExperiencesSelected;

  const key =

  `${orderedCategories[0]}-${orderedCategories[1]}-${safeMoodsSelected[0]}`;

    const combinationHero =

  (bestExperience as any)
    ?.heroCombinations?.[
      key
    ];

    if (combinationHero) {

      heroImage =
        combinationHero;
    }
  }

  // =========================================================
  // DOUBLE CATEGORY + DOUBLE MOOD
  // =========================================================

    if (
  safeExperiencesSelected.length === 2 &&
  safeMoodsSelected.length === 2
){

  const orderedCategories =
  safeExperiencesSelected;

    const sortedMood =

      [...safeMoodsSelected].sort();

   const key =

  `${orderedCategories[0]}-${orderedCategories[1]}-${safeMoodsSelected[0]}`;

    const combinationHero =

  (bestExperience as any)
    ?.heroCombinations?.[
      key
    ];

    if (combinationHero) {

      heroImage =
        combinationHero;
    }
  }

  // =========================================================
  // COMPATIBILITY
  // =========================================================

  let compatibilityData = null;

  if (

   safeExperiencesSelected.length >= 2

  ) {

const orderedCategories =
  safeExperiencesSelected;

    const compatibilityKey =

     `${orderedCategories[0]}-${orderedCategories[1]}-${safeMoodsSelected[0]}`;

    compatibilityData =

      experienceCompatibility[
        compatibilityKey as keyof typeof experienceCompatibility
      ] || null;
  }

  // =========================================================
  // INCLUDED
  // =========================================================

  const includedSections =

  (bestExperience as any)
    ?.included || [];

  // =========================================================
  // RETURN
  // =========================================================

  return {

    heroTitle,

    heroImage,

    dynamicIntroTitle,

    dynamicIntroTitleIndex,

    dynamicIntroParagraph,

    dynamicClosingParagraph,

    dynamicClosingParagraphIndex,

  featuredExperience: {

  ...bestExperience,

  title:
    bestExperience.title,

  operator:
    bestExperience.operator,

  heroImage:

  bestExperience.featured_image ||

  bestExperience.gallery?.[0]?.image_url ||

  "/images/default.webp",
},

    scoredExperiences:
      sortedExperiences,

    includedSections,

    compatibilityData,

    suggestedAddOns,
  };


}