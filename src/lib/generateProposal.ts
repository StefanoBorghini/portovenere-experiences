// =========================================================
// generateProposal.ts
// =========================================================

import { experiences } from "./experiences";
import { experienceCompatibility }
from "./experienceCompatibility";
interface GenerateProposalProps {
  experiencesSelected: string[];
  moodsSelected: string[];
  budget: string;
  guests: string;
  travelingWithChildren: boolean;
}

export function generateProposal({
  experiencesSelected,
  moodsSelected,
  budget,
  guests,
  travelingWithChildren,
}: GenerateProposalProps) {

  // =========================================================
  // FILTER
  // =========================================================

  const filteredExperiences =
    experiences.filter(
      (experience) => {

        const matchesCategory =

          experiencesSelected.length === 0 ||

          experiencesSelected.includes(
            experience.macroCategory
          );

        const matchesGuests =

          experience.guests.includes(
            guests
          );

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
  // SCORE
  // =========================================================

  const scoredExperiences =
    filteredExperiences.map(
      (experience) => {

        let score = 0;

        // MOODS

        moodsSelected.forEach(
          (mood) => {

            const moodScore =

              experience.moodScores[
                mood as keyof typeof experience.moodScores
              ] || 0;

            score += moodScore * 10;
          }
        );

        // FAMILY

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

          score -= 30;
        }

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

  // =========================================================
  // BEST EXPERIENCE
  // =========================================================

  const bestExperience =
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

      featuredExperience: null,

      scoredExperiences: [],

      includedSections: [],
    };
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


return {compatibilityData,}  }
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

  // 1 CATEGORY + 1 MOOD

  if (
    experiencesSelected.length === 1 &&
    moodsSelected.length === 1
  ) {

    const key =

      `${experiencesSelected[0]}-${moodsSelected[0]}`;

    const combinationHero =

      (bestExperience as any)
        .heroCombinations?.[
          key as string
        ];

    if (combinationHero) {

      heroImage =
        combinationHero;
    }
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
  };
}