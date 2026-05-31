
// =========================================================
// proposalContent.ts
// CLEAN STRUCTURED VERSION
// =========================================================

export interface ProposalNarrative {

  id: string;

  categories: string[];

  moods: string[];

  heroTitle: string;

  heroSubtitle: string;

  intro: string;

  priority?: number;
}

// =========================================================
// PROPOSAL CONTENT
// =========================================================

export const proposalContent:
  ProposalNarrative[] = [

  // =======================================================
  // SEA + ROMANTIC
  // =======================================================

  {

    id:
      "sea-romantic",

    categories: [
      "Sea Escape",
    ],

    moods: [
      "Romantic",
    ],

    heroTitle:
      "Romantic Riviera Escape",

    heroSubtitle:
      "Private sailing, Mediterranean atmosphere and cinematic Riviera moments crafted around intimacy and beauty.",

    intro:
      "An immersive Riviera escape suspended between sea, silence and golden Mediterranean light.",

    priority: 100,
  },

  // =======================================================
  // SEA + GOURMET + ROMANTIC
  // =======================================================

  {

    id:
      "sea-gourmet-romantic",

    categories: [

      "Sea Escape",

      "Gourmet Escape",
    ],

    moods: [
      "Romantic",
    ],

    heroTitle:
      "Mediterranean Taste & Sea Escape",

    heroSubtitle:
      "Private sailing, Riviera cuisine and cinematic sunset atmosphere combined into a curated Mediterranean journey.",

    intro:
      "A refined Riviera experience blending authentic Italian cuisine, sea exploration and romantic Mediterranean storytelling.",

    priority: 95,
  },

  // =======================================================
  // WILD + CINEMATIC
  // =======================================================

  {

    id:
      "wild-cinematic",

    categories: [
      "Wild Escape",
    ],

    moods: [
      "Cinematic",
    ],

    heroTitle:
      "Wild Mediterranean Escape",

    heroSubtitle:
      "Nature, atmosphere and cinematic Riviera landscapes designed around immersive exploration.",

    intro:
      "An authentic Riviera journey crafted around movement, freedom and Mediterranean wilderness.",

    priority: 90,
  },

  // =======================================================
  // SEA + WILD + ADVENTURE
  // =======================================================

  {

    id:
      "sea-wild-adventure",

    categories: [

      "Sea Escape",

      "Wild Escape",
    ],

    moods: [
      "Adventure",
    ],

    heroTitle:
      "Mediterranean Adventure Journey",

    heroSubtitle:
      "Sea exploration and Riviera wilderness combined into an immersive cinematic experience.",

    intro:
      "A dynamic Riviera itinerary blending sailing, Mediterranean nature and authentic exploration.",

    priority: 88,
  },

  // =======================================================
  // SEA + AERIAL + CINEMATIC
  // =======================================================

  {

    id:
      "sea-aerial-cinematic",

    categories: [

      "Sea Escape",

      "Aerial Escape",
    ],

    moods: [
      "Cinematic",
    ],

    heroTitle:
      "Cinematic Riviera Journey",

    heroSubtitle:
      "Mediterranean aerial perspectives and private sailing experiences suspended between atmosphere and storytelling.",

    intro:
      "A cinematic Riviera escape designed across sea landscapes, aerial exploration and immersive Mediterranean atmosphere.",

    priority: 92,
  },
];

// =========================================================
// MATCHING FUNCTION
// =========================================================

interface FindNarrativeProps {

  selectedCategories:
    string[];

  selectedMoods:
    string[];
}

export function findBestProposalNarrative({

  selectedCategories,

  selectedMoods,

}: FindNarrativeProps) {

  const matchingNarratives =

    proposalContent.filter(
      (narrative) => {

        // ===================================================
        // CATEGORY MATCH
        // ===================================================

        const categoryMatch =

          narrative.categories.every(
            (category) =>

              selectedCategories.includes(
                category
              )
          );

        // ===================================================
        // MOOD MATCH
        // ===================================================

        const moodMatch =

          narrative.moods.every(
            (mood) =>

              selectedMoods.includes(
                mood
              )
          );

        return (
          categoryMatch &&
          moodMatch
        );
      }
    );

  // =======================================================
  // SORT BY PRIORITY
  // =======================================================

  matchingNarratives.sort(
    (a, b) =>

      (b.priority || 0) -
      (a.priority || 0)
  );

  // =======================================================
  // RETURN BEST MATCH
  // =======================================================

  return (
    matchingNarratives[0] ||
    null
  );
}

