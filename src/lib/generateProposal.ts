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

  // =========================================================
  // FILTER EXPERIENCES
  // =========================================================

  const filteredExperiences =

  allExperiences.filter(
      (experience) => {

        // =====================================================
        // MACRO CATEGORY
        // =====================================================

        const matchesCategory =

          experiencesSelected.length === 0 ||

          experiencesSelected.includes(
            experience.macroCategory
          );

        // =====================================================
        // GUESTS
        // =====================================================

        const matchesGuests =

          experience.guests.includes(
            guests
          );

        // =====================================================
        // BUDGET
        // =====================================================

        const matchesBudget =

          experience.budgets.includes(
            budget
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

        moodsSelected.forEach(
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

      experiencesSelected.includes(
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

  moodsSelected?.[0];

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

    experiencesSelected.length === 1 &&

    moodsSelected.length === 1

  ) {

    const key =

      `${experiencesSelected[0]}-${moodsSelected[0]}`;

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

    experiencesSelected.length === 1 &&

    moodsSelected.length === 2

  ) {

    const sortedMood =

      [...moodsSelected].sort();

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

    experiencesSelected.length === 2 &&

    moodsSelected.length === 1

  ) {

    const orderedCategories =
  experiencesSelected;

  const key =

  `${orderedCategories[0]}-${orderedCategories[1]}-${moodsSelected[0]}`;

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

    experiencesSelected.length === 2 &&

    moodsSelected.length === 2

  ) {

  const orderedCategories =
  experiencesSelected;

    const sortedMood =

      [...moodsSelected].sort();

   const key =

  `${orderedCategories[0]}-${orderedCategories[1]}-${moodsSelected[0]}`;

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

    experiencesSelected.length >= 2

  ) {

const orderedCategories =
  experiencesSelected;

    const compatibilityKey =

     `${orderedCategories[0]}-${orderedCategories[1]}-${moodsSelected[0]}`;

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