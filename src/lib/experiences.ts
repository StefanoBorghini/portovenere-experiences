// ============================================================
// experiences.ts
// ============================================================

export interface Experience {

  id: string;

  title: string;

  operator: string;

  macroCategory: string;

  moods?: string[];

  guests: string[];

  budgets: string[];

  idealGuests?: string[];

  familyFriendly?: boolean;

  luxuryPriority?: number;

  narrativePriority?: number;

  energyScores: Record<string, number>;

  visualStyleScores: Record<string, number>;

  moodScores: Record<string, number>;

  heroImage?: string;

  heroVariants?: {

    moods: string[];

    categories: string[];

    image: string;

    weight?: number;

  }[];

  gallery?: Record<string, string[]>;
}

// ============================================================
// EXPERIENCES
// ============================================================

export const experiences: Experience[] = [

  // ==========================================================
  // DINO
  // ==========================================================

  {

    id: "dino",

    title: "Private Riviera Boat Escape",

    operator: "Dino",

    macroCategory: "Sea Escape",

    moods: [

      "Romantic",

      "Authentic",

      "Adventure",

      "Cinematic",
    ],

    guests: [

      "couple",

      "family",
    ],

    budgets: [

      "medium",

      "high",
    ],

    idealGuests: [

      "couple",
    ],

    familyFriendly: true,

    luxuryPriority: 10,

    narrativePriority: 95,

    energyScores: {

      calm: 9,

      exploration: 8,

      elegance: 7,
    },

    visualStyleScores: {

      cinematic: 10,

      mediterranean: 10,

      authentic: 9,
    },

    moodScores: {

      Romantic: 9,

      Cinematic: 10,

      Adventure: 8,

      Authentic: 10,
    },

    heroImage:
      "/images/dino/hero.webp",

    heroVariants: [

      {

        moods: [
          "Romantic",
        ],

        categories: [
          "Sea Escape",
        ],

        image:
          "/images/dino/romantic.webp",
      },

      {

        moods: [
          "Adventure",
        ],

        categories: [
          "Sea Escape",
        ],

        image:
          "/images/dino/adventure.webp",
      },
    ],
  },

  // ==========================================================
  // APHRODITE
  // ==========================================================

  {

    id: "aphrodite",

    title: "Luxury Riviera Yacht",

    operator: "Aphrodite",

    macroCategory: "Sea Escape",

    moods: [

      "Luxury",

      "Romantic",

      "Cinematic",

      "Authentic",
    ],

    guests: [

      "couple",

      "luxury",
    ],

    budgets: [

      "high",

      "ultra",
    ],

    idealGuests: [

      "luxury",

      "couple",
    ],

    familyFriendly: false,

    luxuryPriority: 15,

    narrativePriority: 100,

    energyScores: {

      calm: 10,

      elegance: 10,

      atmosphere: 9,
    },

    visualStyleScores: {

      cinematic: 10,

      luxury: 10,

      mediterranean: 9,
    },

    moodScores: {

      Romantic: 10,

      Cinematic: 10,

      Luxury: 10,

      Authentic: 7,
    },

    heroImage:
      "/images/aphrodite/hero.webp",
  },

  // ==========================================================
  // VELAMICA
  // ==========================================================

  {

    id: "velamica",

    title: "Authentic Sailing Journey",

    operator: "Velamica",

    macroCategory: "Sea Escape",

    moods: [

      "Adventure",

      "Authentic",

      "Cinematic",
    ],

    guests: [

      "couple",

      "friends",
    ],

    budgets: [

      "medium",
    ],

    idealGuests: [

      "friends",

      "couple",
    ],

    familyFriendly: true,

    luxuryPriority: 6,

    narrativePriority: 80,

    energyScores: {

      exploration: 10,

      freedom: 9,

      atmosphere: 8,
    },

    visualStyleScores: {

      cinematic: 8,

      authentic: 10,

      mediterranean: 9,
    },

    moodScores: {

      Adventure: 10,

      Cinematic: 8,

      Authentic: 10,
    },

    heroImage:
      "/images/velamica/hero.webp",
  },

  // ==========================================================
  // AIRPLANE
  // ==========================================================

  {

    id: "airplane",

    title: "Aerial Riviera Experience",

    operator: "Sky Riviera",

    macroCategory: "Aerial Escape",

    moods: [

      "Cinematic",

      "Adventure",

      "Authentic",
    ],

    guests: [

      "couple",

      "friends",
    ],

    budgets: [

      "high",
    ],

    idealGuests: [

      "couple",
    ],

    familyFriendly: false,

    luxuryPriority: 12,

    narrativePriority: 90,

    energyScores: {

      adrenaline: 9,

      exploration: 10,

      atmosphere: 8,
    },

    visualStyleScores: {

      cinematic: 10,

      panoramic: 10,

      luxury: 8,
    },

    moodScores: {

      Adventure: 10,

      Cinematic: 10,

      Authentic: 7,
    },

    heroImage:
      "/images/airplane/hero.webp",
  },

  // ==========================================================
  // RESTAURANT
  // ==========================================================

  {

    id: "restaurant",

    title: "Riviera Fine Dining",

    operator: "Portovenere Dining",

    macroCategory: "Gourmet Escape",

    moods: [

      "Romantic",

      "Authentic",

      "Luxury",
    ],

    guests: [

      "couple",

      "family",
    ],

    budgets: [

      "medium",

      "high",
    ],

    idealGuests: [

      "couple",
    ],

    familyFriendly: true,

    luxuryPriority: 9,

    narrativePriority: 85,

    energyScores: {

      calm: 8,

      atmosphere: 10,

      elegance: 9,
    },

    visualStyleScores: {

      cinematic: 8,

      luxury: 9,

      authentic: 8,
    },

    moodScores: {

      Romantic: 10,

      Luxury: 8,

      Authentic: 8,
    },

    heroImage:
      "/images/restaurant/hero.webp",
  },

  // ==========================================================
  // FOOD & WINE
  // ==========================================================

  {

    id: "foodwine",

    title: "Food & Wine Experience",

    operator: "Cinque Terre Wine",

    macroCategory: "Gourmet Escape",

    moods: [

      "Authentic",

      "Luxury",

      "Cinematic",
    ],

    guests: [

      "couple",

      "friends",
    ],

    budgets: [

      "medium",

      "high",
    ],

    idealGuests: [

      "friends",

      "couple",
    ],

    familyFriendly: true,

    luxuryPriority: 8,

    narrativePriority: 82,

    energyScores: {

      atmosphere: 9,

      calm: 8,

      elegance: 8,
    },

    visualStyleScores: {

      cinematic: 8,

      authentic: 10,

      mediterranean: 9,
    },

    moodScores: {

      Authentic: 10,

      Luxury: 7,

      Cinematic: 8,
    },

    heroImage:
      "/images/foodwine/hero.webp",
  },
];