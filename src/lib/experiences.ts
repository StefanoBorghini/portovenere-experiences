// =========================================================
// experiences.ts
// FINAL COMPLETE VERSION
// =========================================================

export interface Experience {

  id: string;

  title: string;

  operator: string;

  macroCategory: string;

  guests: string[];

  idealGuests: string[];

  luxuryPriority: number;

  budgets: string[];

  moodScores: {

    Romantic: number;

    Authentic: number;

    Adventure: number;

    Cinematic: number;
  };

  familyFriendly: boolean;

  basePrice: number;

  heroImage: string;

  heroCombinations?: {
    [key: string]: string;
  };

  gallery?: {
    [key: string]: string[];
  };

  included?: {
    title: string;
    description: string;
  }[];
}

// =========================================================
// EXPERIENCES
// =========================================================

export const experiences: Experience[] = [

  // =========================================================
  // SEA ESCAPE
  // =========================================================

  {
    id: "dino",

    title: "Dino",

    operator: "Dino",

    macroCategory: "Sea Escape",

    guests: [
      "2",
      "3-4",
      "5-7",
    ],

    idealGuests: [
      "2",
      "3-4",
    ],

    luxuryPriority: 2,

    budgets: [
      "€500 - €1000",
      "€1000 - €3000",
    ],

    moodScores: {

      Romantic: 4,

      Authentic: 3,

      Adventure: 2,

      Cinematic: 1,
    },

    familyFriendly: true,

    basePrice: 1200,

    heroImage:
      "/images/sea/dino/default.webp",

    heroCombinations: {

      // SINGLE
      "Sea Escape":
        "/images/sea/dino/default.webp",

      "Sea Escape-Romantic":
        "/images/sea/dino/romantic.webp",

      "Sea Escape-Authentic":
        "/images/sea/dino/authentic.webp",

      "Sea Escape-Adventure":
        "/images/sea/dino/adventure.webp",

      "Sea Escape-Cinematic":
        "/images/sea/dino/cinematic.webp",

      // DOUBLE MOOD
      "Sea Escape-Romantic-Cinematic":
        "/images/sea/dino/romantic-cinematic.webp",

      "Sea Escape-Adventure-Authentic":
        "/images/sea/dino/adventure-authentic.webp",

      // CATEGORY CROSSOVER
      "Sea Escape-Gourmet Escape-Romantic":
        "/images/sea/dino/gourmet-romantic.webp",

      "Sea Escape-Wild Escape-Adventure":
        "/images/sea/dino/wild-adventure.webp",
    },

    gallery: {

      sailing: [

        "/images/sea/dino/1.webp",

        "/images/sea/dino/2.webp",

        "/images/sea/dino/3.webp",
      ],
    },

    included: [],
  },

  {
    id: "aphrodite",

    title: "Aphrodite",

    operator: "Aphrodite",

    macroCategory: "Sea Escape",

    guests: [
      "2",
      "3-4",
      "5-7",
      "8+",
    ],

    idealGuests: [
      "2",
      "3-4",
      "5-7",
    ],

    luxuryPriority: 5,

    budgets: [
      "€1000 - €3000",
      "€3000+",
    ],

    moodScores: {

      Authentic: 4,

      Romantic: 3,

      Adventure: 3,

      Cinematic: 2,
    },

    familyFriendly: true,

    basePrice: 2200,

    heroImage:
      "/images/sea/aphrodite/default.webp",

    heroCombinations: {

      "Sea Escape":
        "/images/sea/aphrodite/default.webp",

      "Sea Escape-Romantic":
        "/images/sea/aphrodite/romantic.webp",

      "Sea Escape-Cinematic":
        "/images/sea/aphrodite/cinematic.webp",

      "Sea Escape-Authentic":
        "/images/sea/aphrodite/authentic.webp",

      "Sea Escape-Romantic-Cinematic":
        "/images/sea/aphrodite/romantic-cinematic.webp",

      "Sea Escape-Gourmet Escape-Romantic":
        "/images/sea/aphrodite/gourmet-romantic.webp",

      "Sea Escape-Aerial Escape-Cinematic":
        "/images/sea/aphrodite/aerial-cinematic.webp",
    },

    gallery: {

      yacht: [

        "/images/sea/aphrodite/1.webp",

        "/images/sea/aphrodite/2.webp",

        "/images/sea/aphrodite/3.webp",
      ],
    },

    included: [],
  },

  {
    id: "velamica",

    title: "Velamica",

    operator: "Velamica",

    macroCategory: "Sea Escape",

    guests: [
      "8+",
    ],

    idealGuests: [
      "8+",
    ],

    luxuryPriority: 4,

    budgets: [
      "€1000 - €3000",
      "€3000+",
    ],

    moodScores: {

      Adventure: 4,

      Cinematic: 3,

      Authentic: 2,

      Romantic: 1,
    },

    familyFriendly: true,

    basePrice: 2800,

    heroImage:
      "/images/sea/velamica/default.webp",

    heroCombinations: {

      "Sea Escape":
        "/images/sea/velamica/default.webp",

      "Sea Escape-Adventure":
        "/images/sea/velamica/adventure.webp",

      "Sea Escape-Cinematic":
        "/images/sea/velamica/cinematic.webp",

      "Sea Escape-Adventure-Cinematic":
        "/images/sea/velamica/adventure-cinematic.webp",

      "Sea Escape-Wild Escape-Adventure":
        "/images/sea/velamica/wild-adventure.webp",
    },

    gallery: {

      sailing: [

        "/images/sea/velamica/1.webp",

        "/images/sea/velamica/2.webp",

        "/images/sea/velamica/3.webp",
      ],
    },

    included: [],
  },

  {
    id: "velagiovane",

    title: "Velagiovane",

    operator: "Velagiovane",

    macroCategory: "Sea Escape",

    guests: [
      "8+",
    ],

    idealGuests: [
      "8+",
    ],

    luxuryPriority: 4,

    budgets: [
      "€1000 - €3000",
      "€3000+",
    ],

    moodScores: {

      Adventure: 4,

      Authentic: 3,

      Cinematic: 2,

      Romantic: 1,
    },

    familyFriendly: false,

    basePrice: 3200,

    heroImage:
      "/images/sea/velagiovane/default.webp",

    heroCombinations: {

      "Sea Escape":
        "/images/sea/velagiovane/default.webp",

      "Sea Escape-Cinematic":
        "/images/sea/velagiovane/cinematic.webp",

      "Sea Escape-Adventure":
        "/images/sea/velagiovane/adventure.webp",

      "Sea Escape-Romantic-Cinematic":
        "/images/sea/velagiovane/romantic-cinematic.webp",
    },

    gallery: {

      sunset: [

        "/images/sea/velagiovane/1.webp",

        "/images/sea/velagiovane/2.webp",

        "/images/sea/velagiovane/3.webp",
      ],
    },

    included: [],
  },

  // =========================================================
  // AERIAL ESCAPE
  // =========================================================

  {
    id: "airplane",

    title: "Airplane",

    operator: "Airplane",

    macroCategory: "Aerial Escape",

    guests: [
      "2",
      "3-4",
      "5-7",
    ],

    idealGuests: [
      "2",
      "3-4",
    ],

    luxuryPriority: 4,

    budgets: [
      "€500 - €1000",
      "€1000 - €3000",
    ],

    moodScores: {

      Cinematic: 4,

      Authentic: 3,

      Adventure: 2,

      Romantic: 1,
    },

    familyFriendly: false,

    basePrice: 1800,

    heroImage:
      "/images/aerial/airplane/default.webp",

    heroCombinations: {

      "Aerial Escape":
        "/images/aerial/airplane/default.webp",

      "Aerial Escape-Cinematic":
        "/images/aerial/airplane/cinematic.webp",

      "Aerial Escape-Adventure":
        "/images/aerial/airplane/adventure.webp",

      "Sea Escape-Aerial Escape-Cinematic":
        "/images/aerial/airplane/sea-cinematic.webp",
    },

    gallery: {

      aerial: [

        "/images/aerial/airplane/1.webp",

        "/images/aerial/airplane/2.webp",

        "/images/aerial/airplane/3.webp",
      ],
    },

    included: [],
  },

  {
    id: "mongolfiera",

    title: "Mongolfiera",

    operator: "Mongolfiera",

    macroCategory: "Aerial Escape",

    guests: [
      "2",
      "3-4",
      "5-7",
      "8+",
    ],

    idealGuests: [
      "2",
      "3-4",
      "5-7",
    ],

    luxuryPriority: 3,

    budgets: [
      "€500 - €1000",
      "€1000 - €3000",
    ],

    moodScores: {

      Adventure: 4,

      Cinematic: 3,

      Authentic: 2,

      Romantic: 1,
    },

    familyFriendly: true,

    basePrice: 2000,

    heroImage:
      "/images/aerial/mongolfiera/default.webp",

    heroCombinations: {

      "Aerial Escape":
        "/images/aerial/mongolfiera/default.webp",

      "Aerial Escape-Adventure":
        "/images/aerial/mongolfiera/adventure.webp",

      "Aerial Escape-Cinematic":
        "/images/aerial/mongolfiera/cinematic.webp",
    },

    gallery: {

      balloon: [

        "/images/aerial/mongolfiera/1.webp",

        "/images/aerial/mongolfiera/2.webp",

        "/images/aerial/mongolfiera/3.webp",
      ],
    },

    included: [],
  },

  // =========================================================
  // GOURMET ESCAPE
  // =========================================================

  {
    id: "restaurant",

    title: "Prenotazione Ristorante",

    operator: "Restaurant",

    macroCategory: "Gourmet Escape",

    guests: [
      "2",
      "3-4",
      "5-7",
      "8+",
    ],

    idealGuests: [
      "2",
      "3-4",
    ],

    luxuryPriority: 5,

    budgets: [
      "€500 - €1000",
      "€1000 - €3000",
    ],

    moodScores: {

      Romantic: 4,

      Authentic: 3,

      Cinematic: 2,

      Adventure: 1,
    },

    familyFriendly: true,

    basePrice: 700,

    heroImage:
      "/images/gourmet/restaurant/default.webp",

    heroCombinations: {

      "Gourmet Escape":
        "/images/gourmet/restaurant/default.webp",

      "Gourmet Escape-Romantic":
        "/images/gourmet/restaurant/romantic.webp",

      "Gourmet Escape-Authentic":
        "/images/gourmet/restaurant/authentic.webp",

      "Sea Escape-Gourmet Escape-Romantic":
        "/images/gourmet/restaurant/sea-romantic.webp",
    },

    gallery: {

      gourmet: [

        "/images/gourmet/restaurant/1.webp",

        "/images/gourmet/restaurant/2.webp",

        "/images/gourmet/restaurant/3.webp",
      ],
    },

    included: [],
  },

  {
    id: "foodwine",

    title:
      "On Board Food & Wine Experiences",

    operator: "Food & Wine",

    macroCategory: "Gourmet Escape",

    guests: [
      "2",
      "3-4",
      "5-7",
      "8+",
    ],

    idealGuests: [
      "2",
      "3-4",
      "5-7",
    ],

    luxuryPriority: 4,

    budgets: [
      "€500 - €1000",
      "€1000 - €3000",
    ],

    moodScores: {

      Adventure: 4,

      Authentic: 3,

      Romantic: 2,

      Cinematic: 1,
    },

    familyFriendly: true,

    basePrice: 1500,

    heroImage:
      "/images/gourmet/wine/default.webp",

    heroCombinations: {

      "Gourmet Escape":
        "/images/gourmet/wine/default.webp",

      "Gourmet Escape-Adventure":
        "/images/gourmet/wine/adventure.webp",

      "Gourmet Escape-Authentic":
        "/images/gourmet/wine/authentic.webp",
    },

    gallery: {

      wine: [

        "/images/gourmet/wine/1.webp",

        "/images/gourmet/wine/2.webp",

        "/images/gourmet/wine/3.webp",
      ],
    },

    included: [],
  },

  // =========================================================
  // WILD ESCAPE
  // =========================================================

  {
    id: "trekking",

    title: "Trekking",

    operator: "Trekking",

    macroCategory: "Wild Escape",

    guests: [
      "2",
      "3-4",
      "5-7",
      "8+",
    ],

    idealGuests: [
      "2",
      "3-4",
      "5-7",
    ],

    luxuryPriority: 2,

    budgets: [
      "€500 - €1000",
      "€1000 - €3000",
      "€3000+",
    ],

    moodScores: {

      Authentic: 4,

      Adventure: 3,

      Cinematic: 2,

      Romantic: 1,
    },

    familyFriendly: true,

    basePrice: 600,

    heroImage:
      "/images/wild/trekking/default.webp",

    heroCombinations: {

      "Wild Escape":
        "/images/wild/trekking/default.webp",

      "Wild Escape-Authentic":
        "/images/wild/trekking/authentic.webp",

      "Wild Escape-Adventure":
        "/images/wild/trekking/adventure.webp",
    },

    gallery: {

      trekking: [

        "/images/wild/trekking/1.webp",

        "/images/wild/trekking/2.webp",

        "/images/wild/trekking/3.webp",
      ],
    },

    included: [],
  },

  {
    id: "snorkeling",

    title: "Snorkeling",

    operator: "Snorkeling",

    macroCategory: "Wild Escape",

    guests: [
      "2",
      "3-4",
      "5-7",
      "8+",
    ],

    idealGuests: [
      "2",
      "3-4",
      "5-7",
    ],

    luxuryPriority: 3,

    budgets: [
      "€500 - €1000",
      "€1000 - €3000",
      "€3000+",
    ],

    moodScores: {

      Adventure: 4,

      Cinematic: 3,

      Authentic: 2,

      Romantic: 1,
    },

    familyFriendly: true,

    basePrice: 900,

    heroImage:
      "/images/wild/snorkeling/default.webp",

    heroCombinations: {

      "Wild Escape":
        "/images/wild/snorkeling/default.webp",

      "Wild Escape-Adventure":
        "/images/wild/snorkeling/adventure.webp",

      "Wild Escape-Cinematic":
        "/images/wild/snorkeling/cinematic.webp",
    },

    gallery: {

      snorkeling: [

        "/images/wild/snorkeling/1.webp",

        "/images/wild/snorkeling/2.webp",

        "/images/wild/snorkeling/3.webp",
      ],
    },

    included: [],
  },

  {
    id: "mermaiding",

    title: "Mermaiding",

    operator: "Mermaiding",

    macroCategory: "Wild Escape",

    guests: [
      "2",
      "3-4",
      "5-7",
      "8+",
    ],

    idealGuests: [
      "2",
    ],

    luxuryPriority: 4,

    budgets: [
      "€500 - €1000",
      "€1000 - €3000",
      "€3000+",
    ],

    moodScores: {

      Romantic: 4,

      Adventure: 3,

      Cinematic: 2,

      Authentic: 1,
    },

    familyFriendly: false,

    basePrice: 1100,

    heroImage:
      "/images/wild/mermaiding/default.webp",

    heroCombinations: {

      "Wild Escape":
        "/images/wild/mermaiding/default.webp",

      "Wild Escape-Romantic":
        "/images/wild/mermaiding/romantic.webp",

      "Wild Escape-Cinematic":
        "/images/wild/mermaiding/cinematic.webp",

      "Wild Escape-Romantic-Cinematic":
        "/images/wild/mermaiding/romantic-cinematic.webp",
    },

    gallery: {

      underwater: [

        "/images/wild/mermaiding/1.webp",

        "/images/wild/mermaiding/2.webp",

        "/images/wild/mermaiding/3.webp",
      ],
    },

    included: [],
  },

  {
    id: "horses",

    title: "Horses",

    operator: "Horses",

    macroCategory: "Wild Escape",

    guests: [
      "2",
      "3-4",
      "5-7",
      "8+",
    ],

    idealGuests: [
      "2",
      "3-4",
      "5-7",
    ],

    luxuryPriority: 3,

    budgets: [
      "€500 - €1000",
      "€1000 - €3000",
      "€3000+",
    ],

    moodScores: {

      Adventure: 4,

      Authentic: 3,

      Cinematic: 2,

      Romantic: 1,
    },

    familyFriendly: true,

    basePrice: 1300,

    heroImage:
      "/images/wild/horses/default.webp",

    heroCombinations: {

      "Wild Escape":
        "/images/wild/horses/default.webp",

      "Wild Escape-Adventure":
        "/images/wild/horses/adventure.webp",

      "Wild Escape-Authentic":
        "/images/wild/horses/authentic.webp",
    },

    gallery: {

      horses: [

        "/images/wild/horses/1.webp",

        "/images/wild/horses/2.webp",

        "/images/wild/horses/3.webp",
      ],
    },

    included: [],
  },

];