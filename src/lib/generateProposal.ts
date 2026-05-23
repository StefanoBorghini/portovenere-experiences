import { experiences } from "./experiences";

interface GenerateProposalProps {
  experiencesSelected: string[];
  moodsSelected: string[];
  budget: string;
  travelingWithChildren: boolean;
}

export function generateProposal({
  experiencesSelected,
  moodsSelected,
  budget,
  travelingWithChildren,
}: GenerateProposalProps) {

  // CONVERT BUDGET

  let numericBudget = 0;

  if (budget === "€500 - €1000") {
    numericBudget = 500;
  }

  if (budget === "€1000 - €3000") {
    numericBudget = 1000;
  }

  if (budget === "€3000+") {
    numericBudget = 3000;
  }

  // SCORE EXPERIENCES

  const scoredExperiences =
    experiences.map((experience) => {

      let score = experience.score;

      // USER SELECTED EXPERIENCE

      if (
        experiencesSelected.includes(
          experience.title
        )
      ) {
        score += 50;
      }

      // MOOD MATCHING

      moodsSelected.forEach((mood) => {

        if (
          experience.moods.includes(
            mood
          )
        ) {
          score += 25;
        }

      });

      // FAMILY FILTER

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
        score -= 40;
      }

      // BUDGET FILTER

      if (
        numericBudget >=
        experience.minBudget
      ) {
        score += 15;
      } else {
        score -= 30;
      }

      return {
        ...experience,
        finalScore: score,
      };
    });

  // SORT

  const sortedExperiences =
    scoredExperiences.sort(
      (a, b) =>
        b.finalScore - a.finalScore
    );

  // BEST MATCH

  const bestExperience =
    sortedExperiences[0];

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

  // RELAXED

  if (
    moodsSelected.includes(
      "Relaxed"
    )
  ) {
    heroTitle =
      "Relaxed Coastal Escape";
  }

  // LUXURY

  if (
    bestExperience.category ===
    "luxury"
  ) {
    heroTitle =
      "Luxury Riviera Experience";
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