import { experiences } from "./experiences";

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

  // FILTER EXPERIENCES

  const filteredExperiences =
    experiences.filter(
      (experience) => {

        // MACRO CATEGORY

        const matchesCategory =

          experiencesSelected.length === 0 ||

          experiencesSelected.includes(
            experience.macroCategory
          );

        // GUESTS

        const matchesGuests =

          experience.guests.includes(
            guests
          );

        // BUDGET

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

  // SCORE EXPERIENCES

  const scoredExperiences =
    filteredExperiences.map(
      (experience) => {

        let score = 0;

        // MOOD MATCHING

        moodsSelected.forEach(
          (mood) => {

            const moodScore =

              experience.moodScores[
                mood as keyof typeof experience.moodScores
              ] || 0;

            score += moodScore * 10;
          }
        );

        // FAMILY BONUS

        if (
          travelingWithChildren &&
          experience.familyFriendly
        ) {

          score += 20;
        }

        return {

          ...experience,

          finalScore: score,
        };
      }
    );

  // SORT

  const sortedExperiences =
    scoredExperiences.sort(
      (a, b) =>
        b.finalScore - a.finalScore
    );

  // BEST MATCH

  const bestExperience =
    sortedExperiences[0];

  // FALLBACK

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

  // HERO TITLE

  let heroTitle =
    "Mediterranean Escape";

  // ROMANTIC

  if (
    moodsSelected.includes(
      "Romantic"
    )
  ) {

    heroTitle =
      "Romantic Riviera Escape";
  }

  // ADVENTURE

  if (
    moodsSelected.includes(
      "Adventure"
    )
  ) {

    heroTitle =
      "Mediterranean Adventure";
  }

  // AUTHENTIC

  if (
    moodsSelected.includes(
      "Authentic"
    )
  ) {

    heroTitle =
      "Authentic Riviera Escape";
  }

  // CINEMATIC

  if (
    moodsSelected.includes(
      "Cinematic"
    )
  ) {

    heroTitle =
      "Cinematic Mediterranean Escape";
  }

  // INCLUDED SECTIONS

  const includedSections =
    bestExperience.included || [];

  return {

    heroTitle,

    heroImage:
      bestExperience.heroImage,

    featuredExperience:
      bestExperience,

    scoredExperiences:
      sortedExperiences,

    includedSections,
  };
}