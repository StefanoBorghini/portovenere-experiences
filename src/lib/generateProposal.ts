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

console.log(
  "CATEGORY CHECK",
  experience.id,
  experience.category
);

console.log(
  "NORMALIZED",
  normalizedSelected
);
        // =====================================================
        // GUESTS
        // =====================================================

        const matchesGuests =
  experience.guests?.includes(
    guests
  ) ?? false;

const matchesBudget =
  experience.budgets?.includes(
    budget
  ) ?? false;

  console.log(
  "SELECTED",
  safeExperiencesSelected
);
console.log(
  experience.id,
  {
    matchesCategory,
    matchesGuests,
    matchesBudget,
    guests,
    budget,
  }
);

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

        safeMoodsSelected.forEach(
          (mood) => {

            const moodScore =

              experience.moodScores[
                mood as keyof typeof experience.moodScores
              ] || 0;

            score += moodScore * 10;
          }
        );

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

    


    console.log(
  "EXPERIENCES SELECTED",
  experiencesSelected
);

console.log(
  "MOODS SELECTED",
  moodsSelected
);

console.log(
  "ALL EXPERIENCES",
  allExperiences.map(e => ({
    id: e.id,
    title: e.title
  }))
);

console.log(
  "FILTERED",
  filteredExperiences.map(e => ({
    id: e.id,
    title: e.title
  }))
);

console.log(
  "RANKING",
  sortedExperiences.map(e => ({
    id: e.id,
    score: e.score
  }))
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

  narrativePriority.find(
    (category) =>

      safeExperiencesSelected.includes(
        category
      )
  );

// prende il miglior operator
// SOLO della categoria principale

const bestExperience =

  sortedExperiences.find(
    (experience) =>

      experience.macroCategory ===
      selectedMainCategory
  ) ||

  sortedExperiences[0];

  // =========================================================
  // FALLBACK
  // =========================================================

  if (!bestExperience) {

    return {

      heroTitle:
        "Mediterranean Escape",

      heroImage:
        "/images/default-hero.webp",

      featuredExperience:
        null,

      scoredExperiences: [],

      includedSections: [],

      compatibilityData:
        null,
    };
  }
const experienceContent =

  getExperienceContent(
    bestExperience.id
  );
 // =========================================================
// HERO TITLE
// =========================================================

const primaryMood =

 safeMoodsSelected[0];

const availableTitles =

  proposalTitles[
    bestExperience
      ?.macroCategory as keyof typeof proposalTitles
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

    bestExperience.heroImage;

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
    experienceContent?.heroImage ||

    bestExperience.heroImage,
},

    scoredExperiences:
      sortedExperiences,

    includedSections,

    compatibilityData,
  };

  
}