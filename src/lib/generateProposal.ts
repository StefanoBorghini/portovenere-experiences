// =========================================================
// generateProposal.ts
// COMPLETE UPDATED VERSION
// =========================================================

import { experiences }
from "./experiences";

import {
  experienceCompatibility,
} from "./experienceCompatibility";

interface GenerateProposalProps {

  experiencesSelected:
    string[];

  moodsSelected:
    string[];

  budget:
    string;

  guests:
    string;

  travelingWithChildren:
    boolean;
}

export function generateProposal({

  experiencesSelected,

  moodsSelected,

  budget,

  guests,

  travelingWithChildren,

}: GenerateProposalProps) {

  // =========================================================
  // FILTER EXPERIENCES
  // =========================================================

  const filteredExperiences =

    experiences.filter(
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

  // =========================================================
  // HERO TITLE
  // =========================================================

  let heroTitle =

    "Mediterranean Escape";

  if (

    moodsSelected.includes(
      "Romantic"
    )

  ) {

    heroTitle =
      "Romantic Riviera Escape";
  }

  if (

    moodsSelected.includes(
      "Adventure"
    )

  ) {

    heroTitle =
      "Mediterranean Adventure";
  }

  if (

    moodsSelected.includes(
      "Authentic"
    )

  ) {

    heroTitle =
      "Authentic Riviera Escape";
  }

  if (

    moodsSelected.includes(
      "Cinematic"
    )

  ) {

    heroTitle =
      "Cinematic Mediterranean Escape";
  }

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

      bestExperience.heroCombinations?.[
        key as keyof typeof bestExperience.heroCombinations
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

      bestExperience.heroCombinations?.[
        key as keyof typeof bestExperience.heroCombinations
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

    const sortedCategories =

      [...experiencesSelected].sort();

    const key =

      `${sortedCategories[0]}-${sortedCategories[1]}-${moodsSelected[0]}`;

    const combinationHero =

      bestExperience.heroCombinations?.[
        key as keyof typeof bestExperience.heroCombinations
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

    const sortedCategories =

      [...experiencesSelected].sort();

    const sortedMood =

      [...moodsSelected].sort();

    const key =

      `${sortedCategories[0]}-${sortedCategories[1]}-${sortedMood[0]}-${sortedMood[1]}`;

    const combinationHero =

      bestExperience.heroCombinations?.[
        key as keyof typeof bestExperience.heroCombinations
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

    const sortedCategories =

      [...experiencesSelected].sort();

    const compatibilityKey =

      `${sortedCategories[0]}-${sortedCategories[1]}`;

    compatibilityData =

      experienceCompatibility[
        compatibilityKey as keyof typeof experienceCompatibility
      ] || null;
  }

  // =========================================================
  // INCLUDED
  // =========================================================

  const includedSections =

    bestExperience.included || [];

  // =========================================================
  // RETURN
  // =========================================================

  return {

    heroTitle,

    heroImage,

    featuredExperience:
      bestExperience,

    scoredExperiences:
      sortedExperiences,

    includedSections,

    compatibilityData,
  };
}