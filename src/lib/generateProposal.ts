import { experiences } from "./experiences";

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

        // FAMILY

        const matchesFamily =

          travelingWithChildren
            ? experience.familyFriendly
            : true;

        return (

          matchesCategory &&

          matchesGuests &&

          matchesBudget &&

          matchesFamily
        );
      }
    );

  // SCORE ENGINE

  const scoredExperiences =
    filteredExperiences.map(
      (experience) => {

        let score = 0;

        // MOOD SCORING

        moodsSelected.forEach(
          (mood) => {

            const moodScore =

              experience
                .moodScores[
                  mood as keyof typeof experience.moodScores
                ] || 0;

            score += moodScore;
          }
        );

        // EXPERIENCE BONUS

        if (

          experiencesSelected.includes(
            experience.macroCategory
          )

        ) {

          score += 20;
        }

        // FAMILY BONUS

        if (

          travelingWithChildren &&

          experience.familyFriendly

        ) {

          score += 10;
        }

        // CINEMATIC BOOST

        if (

          moodsSelected.includes(
            "Cinematic"
          ) &&

          experience.moodScores
            .Cinematic >= 3

        ) {

          score += 10;
        }

        // ROMANTIC BOOST

        if (

          moodsSelected.includes(
            "Romantic"
          ) &&

          experience.moodScores
            .Romantic >= 3

        ) {

          score += 10;
        }

        // ADVENTURE BOOST

        if (

          moodsSelected.includes(
            "Adventure"
          ) &&

          experience.moodScores
            .Adventure >= 3

        ) {

          score += 10;
        }

        // AUTHENTIC BOOST

        if (

          moodsSelected.includes(
            "Authentic"
          ) &&

          experience.moodScores
            .Authentic >= 3

        ) {

          score += 10;
        }

        return {

          ...experience,

          finalScore: score,
        };
      }
    );

  // SORT DESC

  const sortedExperiences =

    scoredExperiences.sort(
      (a, b) =>

        b.finalScore -
        a.finalScore
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

      featuredExperience: {

        title:
          "Mediterranean Escape",

        description:
          "A curated Riviera experience designed around your selected atmosphere.",
      },

      scoredExperiences: [],

      includedSections: [],
    };
  }

  // HERO TITLE

  let heroTitle =
    "Mediterranean Escape";

  // SEA

  if (

    experiencesSelected.includes(
      "Sea Escape"
    )

  ) {

    heroTitle =
      "Private Riviera Escape";
  }

  // AIR

  if (

    experiencesSelected.includes(
      "Aerial Escape"
    )

  ) {

    heroTitle =
      "Riviera Air Escape";
  }

  // GOURMET

  if (

    experiencesSelected.includes(
      "Gourmet Escape"
    )

  ) {

    heroTitle =
      "Mediterranean Gourmet Escape";
  }

  // WILD

  if (

    experiencesSelected.includes(
      "Wild Escape"
    )

  ) {

    heroTitle =
      "Wild Mediterranean Escape";
  }

  // ROMANTIC OVERRIDE

  if (

    moodsSelected.includes(
      "Romantic"
    )

  ) {

    heroTitle =
      "Romantic Riviera Escape";
  }

  // CINEMATIC OVERRIDE

  if (

    moodsSelected.includes(
      "Cinematic"
    )

  ) {

    heroTitle =
      "Cinematic Mediterranean Escape";
  }

  // FEATURED EXPERIENCE

  const featuredExperience = {

    title:
      bestExperience.title,

    description:
      bestExperience.description,
  };

  // INCLUDED SECTIONS

  const includedSections =

    bestExperience.included || [];

  return {

    heroTitle,

    heroImage:
      bestExperience.heroImage,

    featuredExperience,

    scoredExperiences:
      sortedExperiences,

    includedSections,
  };
}