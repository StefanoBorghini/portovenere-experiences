// =========================================================
// generateProposal.ts
// COMPLETE UPDATED VERSION — guestCount ora somma adulti +
// bambini per capacità/matching (guest_X, max_participants),
// coerente con quello che già facevano i tier di prezzo.
//
// AGGIUNTA — Fascia oraria preferita (richiesta LPG Italia):
// priorità di scoring (non filtro escludente) per le esperienze
// compatibili con available_<fascia> === true. Essendo un bonus
// di punteggio e non un filtro, il "rilassamento" richiesto dalla
// spec quando nessuna esperienza soddisfa il requisito è già
// garantito per costruzione — non serve logica separata.
// =========================================================


import {

  proposalTitles,

  introTitles,

  introParagraphs,

  closingParagraphs,

} from "@/lib/proposalCopy";

import {
  experienceCompatibility,
} from "./experienceCompatibility";

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

  // NUOVO — "morning" | "afternoon" | "sunset" | "full_day".
  // Opzionale: se non passato (utente non l'ha selezionata nel
  // wizard), nessun bonus di scoring viene applicato — comportamento
  // identico a prima dell'introduzione del parametro.
  preferredTime?: string;

  allExperiences: any[];
}



export function generateProposal({

  experiencesSelected,

  moodsSelected,

  budget,

  guests,

  children,

  travelingWithChildren,

  preferredTime,

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

  normalizedSelected.includes(
    experience.category
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

const matchesBudget =

  budget === "€500 - €1000"
    ? experience.budget_500_1000

  : budget === "€1000 - €3000"
    ? experience.budget_1000_3000

  : budget === "€3000+"
    ? experience.budget_3000_plus

  : true;

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

        return (

          matchesCategory &&

          matchesGuests &&

          matchesBudget &&

          matchesChildren &&

          matchesActive &&

          matchesMaxParticipants
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
        // MOOD REFINEMENT
        // =====================================================

 safeMoodsSelected.forEach((mood) => {

  if (mood === "Romantic") {
    score += (experience.romantic_score ?? 0) * 10;
  }

  if (mood === "Authentic") {
    score += (experience.authentic_score ?? 0) * 10;
  }

  if (mood === "Adventure") {
    score += (experience.adventure_score ?? 0) * 10;
  }

  if (mood === "Cinematic") {
    score += (experience.cinematic_score ?? 0) * 10;
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

 const narrativePriority = [

  "Sea Escape",

  "Aerial Escape",

  "Gourmet Escape",

  "Wild Escape",
];

// trova la categoria principale
// in base alla priorità narrativa
const selectedMainCategory =

  safeExperiencesSelected[0]
    ?.toLowerCase()
    .replaceAll(" ", "_");

const bestExperience =

  sortedExperiences.find(
    experience =>

      experience.category ===
      selectedMainCategory
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
      normalizedSelected.includes(experience.category)
  );

  const matchingCategoryAndGuests = matchingCategory.filter((experience) => {
    if (totalGuestCount === 2) return experience.guest_2;
    if (totalGuestCount >= 3 && totalGuestCount <= 4) return experience.guest_3_4;
    if (totalGuestCount >= 5 && totalGuestCount <= 7) return experience.guest_5_7;
    if (totalGuestCount >= 8) return experience.guest_8_plus;
    return true;
  });

  const matchingCategoryAndBudget = matchingCategory.filter((experience) => {
    if (budget === "€500 - €1000") return experience.budget_500_1000;
    if (budget === "€1000 - €3000") return experience.budget_1000_3000;
    if (budget === "€3000+") return experience.budget_3000_plus;
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
      matchingCategoryAndBudgetCount: matchingCategoryAndBudget.length,
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

    .filter((experience) => experience.category !== bestExperience.category)

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

      const matchesBudget =
        budget === "€500 - €1000"
          ? experience.budget_500_1000
        : budget === "€1000 - €3000"
          ? experience.budget_1000_3000
        : budget === "€3000+"
          ? experience.budget_3000_plus
        : true;

      // Stesso filtro children applicato anche ai suggerimenti,
      // per coerenza con la lista principale.
      const matchesChildren =
        !travelingWithChildren ||
        experience.children_allowed === true;

      return matchesGuests && matchesBudget && matchesChildren;
    })

    .map((experience) => {

      let score = (experience.luxuryPriority || 1) * 20;

      safeMoodsSelected.forEach((mood) => {
        if (mood === "Romantic") score += (experience.romantic_score ?? 0) * 10;
        if (mood === "Authentic") score += (experience.authentic_score ?? 0) * 10;
        if (mood === "Adventure") score += (experience.adventure_score ?? 0) * 10;
        if (mood === "Cinematic") score += (experience.cinematic_score ?? 0) * 10;
      });

      // Stesso bonus fascia oraria applicato anche ai suggerimenti,
      // per coerenza con la lista principale.
      if (
        preferredTimeField &&
        experience[preferredTimeField] === true
      ) {
        score += 50;
      }

      return { ...experience, finalScore: score };
    })

    .sort((a, b) => b.finalScore - a.finalScore);

   
}
 // =========================================================
// HERO TITLE
// =========================================================

const primaryMood =

 safeMoodsSelected[0];

const categoryMap = {
  sea_escape: "Sea Escape",
  aerial_escape: "Aerial Escape",
  gourmet_escape: "Gourmet Escape",
  wild_escape: "Wild Escape",
};

const proposalCategory =
  categoryMap[
    bestExperience.category as keyof typeof categoryMap
  ];

const availableTitles =
  proposalTitles[
    proposalCategory as keyof typeof proposalTitles
  ]?.[
    primaryMood as keyof typeof proposalTitles["Sea Escape"]
  ] || [];

const heroTitle =

  availableTitles[
    Math.floor(
      Math.random() *
      availableTitles.length
    )
  ] ||

  bestExperience?.title ||

  "Private Riviera Experience";

// =========================================================
// HERO IMAGE
// =========================================================
// =========================================================
// DYNAMIC INTRO COPY
// =========================================================



const dynamicIntroTitle =

  introTitles[
    Math.floor(
      Math.random() *
      introTitles.length
    )
  ];

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

const dynamicClosingParagraph =

  closingParagraphs[
    Math.floor(
      Math.random() *
      closingParagraphs.length
    )
  ];
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

    dynamicIntroParagraph,

    dynamicClosingParagraph,

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