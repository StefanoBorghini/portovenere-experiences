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
      "/images/sailing/dino/cinematic.webp",

    heroCombinations: {

      // SINGLE

      "Sea Escape-Romantic":
        "/images/sailing/dino/romantic.webp",

      "Sea Escape-Authentic":
        "/images/sailing/dino/authentic.webp",

      "Sea Escape-Adventure":
        "/images/sailing/dino/adventure.webp",

      "Sea Escape-Cinematic":
        "/images/sailing/dino/cinematic.webp",

      // DOUBLE MOOD
      "Sea Escape-Romantic-Cinematic":
        "/images/sailing/dino/cinematic.webp",

      "Sea Escape-Adventure-Authentic":
        "/images/sailing/dino/adventure-authentic.webp",

      // CATEGORY CROSSOVER
      "Sea Escape-Gourmet Escape-Romantic":
        "/images/sailing/dino/gourmet-romantic.webp",

      "Sea Escape-Wild Escape-Adventure":
         "/images/sailing/dino/adventure.webp",
    },

    gallery: {

      sailing: [

        "/images/sailing/dino/1.webp",

        "/images/sailing/dino/2.webp",

        "/images/sailing/dino/3.webp",
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
      "/images/yachts/aphrodite/hero-web.webp",

    heroCombinations: {


      "Sea Escape-Romantic":
        "/images/sea/aphrodite/hero-web.webp",

      "Sea Escape-Cinematic":
        "/images/sea/aphrodite/cinematic.jpg",

      "Sea Escape-Authentic":
        "/images/sea/aphrodite/authentic.jpg",

      "Sea Escape-Romantic-Cinematic":
        "/images/sea/aphrodite/cinematic.jpg",

      "Sea Escape-Gourmet Escape-Romantic":
        "/images/sea/aphrodite/degustazione.jpg",

      "Sea Escape-Aerial Escape-Cinematic":
         "/images/sea/aphrodite/cinematic.jpg",
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
      "/images/sailing/velamica/cinematic.jpg",

    heroCombinations: {


      "Sea Escape-Adventure":
        "/images/sailing/velamica/adventure.jpg",

      "Sea Escape-Cinematic":
        "/images/sailing/velamica/cinematic.jpg",

      "Sea Escape-Adventure-Cinematic":
        "/images/sailing/velamica/adventure-cinematic.jpg",

      "Sea Escape-Wild Escape-Adventure":
        "/images/sailing/velamica/wild-adventure.jpg",
    },

    gallery: {

      sailing: [

        "/images/sailing/velamica/1.webp",

        "/images/sailing/velamica/2.webp",

        "/images/sailing/velamica/3.webp",
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
      "/images/sailing/velagiovane/default.webp",

    heroCombinations: {


      "Sea Escape-Cinematic":
        "/images/sailing/velagiovane/cinematic.jpg",

      "Sea Escape-Adventure":
        "/images/sailing/velagiovane/adventure.jpg",

      "Sea Escape-Romantic-Cinematic":
     "/images/sailing/velagiovane/cinematic.jpg",
    },

    gallery: {

      sunset: [

        "/images/sailing/velagiovane/1.webp",

        "/images/sailing/velagiovane/2.webp",

        "/images/sailing/velagiovane/3.webp",
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
      "/images/flying/aereo/img-1.jpg",

    heroCombinations: {

      "Aerial Escape":
         "/images/flying/aereo/img-1.jpg",

      "Aerial Escape-Cinematic":
        "/images/flying/aereo/img-1.jpg",

      "Aerial Escape-Adventure":
       "/images/flying/aereo/img-1.jpg",

      "Sea Escape-Aerial Escape-Cinematic":
         "/images/flying/aereo/img-1.jpg",
    },

    gallery: {

      aerial: [

        "/images/flying/aereo/1.webp",

        "/images/flying/aereo/2.webp",

        "/images/flying/aereo/3.webp",
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
      "/images/flying/mongolfiera/mongolfiera.jpg",

    heroCombinations: {

      "Aerial Escape":
       "/images/flying/mongolfiera/mongolfiera.jpg",

      "Aerial Escape-Adventure":
        "/images/flying/mongolfiera/mongolfiera.jpg",

      "Aerial Escape-Cinematic":
       "/images/flying/mongolfiera/mongolfiera.jpg",
    },

    gallery: {

      balloon: [

        "/images/flying/mongolfiera/1.webp",

        "/images/flying/mongolfiera/2.webp",

        "/images/flying/mongolfiera/3.webp",
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
      "/images/dining/ristorante/default.webp",

    heroCombinations: {

      "Gourmet Escape-Romantic":
        "/images/dining/ristorante/romantic-two.jpg",

      "Gourmet Escape-Authentic":
        "/images/dining/ristorante/authentic.webp",

      "Sea Escape-Gourmet Escape-Romantic":
       "/images/dining/ristorante/romantic.jpg",
    },

    gallery: {

      gourmet: [

        "/images/dining/ristorante/1.webp",

        "/images/dining/ristorante/2.webp",

        "/images/dining/ristorante/3.webp",
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
      "/images/dining/onboard/default.webp",

    heroCombinations: {

      "Gourmet Escape":
        "/images/dining/onboard/default.webp",

      "Gourmet Escape-Adventure":
        "/images/yachts/aphrodite/degustazione.jpg",

      "Gourmet Escape-Authentic":
        "/images/dining/onboard/authentic.jpg",
    },

    gallery: {

      wine: [

        "/images/dining/onboard/1.webp",

        "/images/dining/onboard/2.webp",

        "/images/dining/onboard/3.webp",
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
      "/images/wild/trekking/adventure.webp",

    heroCombinations: {

      "Wild Escape":
        "/images/wild/trekking/adventure.webp",

      "Wild Escape-Authentic":
        "/images/wild/trekking/authentic.jpg",

      "Wild Escape-Adventure":
        "/images/wild/trekking/adventure.jpg",
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
      "/images/wild/underwater/snorkeling/default.jpg",

    heroCombinations: {

      "Wild Escape":
         "/images/wild/underwater/snorkeling/default.jpg",

      "Wild Escape-Adventure":
         "/images/wild/underwater/snorkeling/default.jpg",

      "Wild Escape-Cinematic":
         "/images/wild/underwater/snorkeling/default.jpg",
    },

    gallery: {

      snorkeling: [

         "/images/wild/underwater/snorkeling/default.jpg",

         "/images/wild/underwater/snorkeling/default.jpg",

         "/images/wild/underwater/snorkeling/default.jpg",
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
      "/images/wild/mermaiding/cinematic.jpg",

    heroCombinations: {

      "Wild Escape":
        "/images/wild/mermaiding/cinematic.jpg",

      "Wild Escape-Romantic":
        "/images/wild/mermaiding/romantic.jpg",

      "Wild Escape-Cinematic":
        "/images/wild/mermaiding/cinematic.jpg",

      "Wild Escape-Romantic-Cinematic":
        "/images/wild/mermaiding/cinematic.jpg",
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
      "/images/wild/horses/default.jpg",

    heroCombinations: {

      "Wild Escape":
        "/images/wild/horses/default.jpg",

      "Wild Escape-Adventure":
        "/images/wild/horses/default.jpg",

      "Wild Escape-Authentic":
        "/images/wild/horses/default.jpg",
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