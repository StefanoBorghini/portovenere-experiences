// =========================================================
// generateProposal.ts
// COMPLETE UPDATED VERSION
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

import {
  getExperienceContent,
} from "@/lib/getExperienceContent";

interface GenerateProposalProps {

  experiencesSelected: string[];

  moodsSelected: string[];

  budget: string;

  guests: string;

  travelingWithChildren: boolean;

  allExperiences: any[];
}



export function generateProposal({

  experiencesSelected,

  moodsSelected,

  budget,

  guests,

  travelingWithChildren,

  allExperiences,

}: GenerateProposalProps) {
const safeExperiencesSelected =
  experiencesSelected ?? [];

const safeMoodsSelected =
  moodsSelected ?? [];
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
        // GUESTS
        // =====================================================

   const guestCount = Number(guests) || 0;

const matchesGuests =
  guestCount === 2
    ? experience.guest_2
  : guestCount >= 3 && guestCount <= 4
    ? experience.guest_3_4
  : guestCount >= 5 && guestCount <= 7
    ? experience.guest_5_7
  : guestCount >= 8
    ? experience.guest_8_plus
  : true;

const matchesBudget =

  budget === "€500 - €1000"
    ? experience.budget_500_1000

  : budget === "€1000 - €3000"
    ? experience.budget_1000_3000

  : budget === "€3000+"
    ? experience.budget_3000_plus

  : true;



        return (

          matchesCategory &&

          matchesGuests &&

          matchesBudget
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
        // FAMILY
        // =====================================================

        if (

          travelingWithChildren &&

          experience.familyFriendly

        ) {

          score += 20;
        }

        if (

          travelingWithChildren &&

          !experience.familyFriendly

        ) {

          score -= 100;
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

  const guestCount = Number(guests) || 0;

  const matchingCategory = safeAllExperiences.filter(
    (experience) =>
      normalizedSelected.length === 0 ||
      normalizedSelected.includes(experience.category)
  );

  const matchingCategoryAndGuests = matchingCategory.filter((experience) => {
    if (guestCount === 2) return experience.guest_2;
    if (guestCount >= 3 && guestCount <= 4) return experience.guest_3_4;
    if (guestCount >= 5 && guestCount <= 7) return experience.guest_5_7;
    if (guestCount >= 8) return experience.guest_8_plus;
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
      guests,
      budget,
      totalExperiences: safeAllExperiences.length,
      matchingCategoryCount: matchingCategory.length,
      matchingCategoryTitles: matchingCategory.map((e) => e.title),
      matchingCategoryAndGuestsCount: matchingCategoryAndGuests.length,
      matchingCategoryAndBudgetCount: matchingCategoryAndBudget.length,
    },
  };
}
const experienceContent =

  getExperienceContent(
    bestExperience.id
  );


// =========================================================
// SUGGESTED ADD-ONS
// Solo quando è stata selezionata una sola categoria —
// altrimenti "Included Experiences" resterebbe vuota
// =========================================================

let suggestedAddOns: any[] = [];

if (safeExperiencesSelected.length === 1) {

  const guestCount = Number(guests) || 0;

  suggestedAddOns = safeAllExperiences

    .filter((experience) => experience.id !== bestExperience.id)

    .filter((experience) => experience.category !== bestExperience.category)

    .filter((experience) => {

      const matchesGuests =
        guestCount === 2
          ? experience.guest_2
        : guestCount >= 3 && guestCount <= 4
          ? experience.guest_3_4
        : guestCount >= 5 && guestCount <= 7
          ? experience.guest_5_7
        : guestCount >= 8
          ? experience.guest_8_plus
        : true;

      const matchesBudget =
        budget === "€500 - €1000"
          ? experience.budget_500_1000
        : budget === "€1000 - €3000"
          ? experience.budget_1000_3000
        : budget === "€3000+"
          ? experience.budget_3000_plus
        : true;

      return matchesGuests && matchesBudget;
    })

    .map((experience) => {

      let score = (experience.luxuryPriority || 1) * 20;

      safeMoodsSelected.forEach((mood) => {
        if (mood === "Romantic") score += (experience.romantic_score ?? 0) * 10;
        if (mood === "Authentic") score += (experience.authentic_score ?? 0) * 10;
        if (mood === "Adventure") score += (experience.adventure_score ?? 0) * 10;
        if (mood === "Cinematic") score += (experience.cinematic_score ?? 0) * 10;
      });

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
  experienceContent?.heroImage ||
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
    experienceContent?.title ||

    bestExperience.title,

  operator:
    experienceContent?.operator ||

    bestExperience.operator,

  heroImage:

  bestExperience.featured_image ||

  bestExperience.gallery?.[0]?.image_url ||

  experienceContent?.heroImage ||

  "/images/default.webp",
},

    scoredExperiences:
      sortedExperiences,

    includedSections,

    compatibilityData,

    suggestedAddOns,
  };

  
}