export interface ExperienceContent {

  id: string;

  title: string;

  operator: string;

  heroImage: string;

  basePrice: number;

  description: string;
}

export const experienceContent: ExperienceContent[] = [

  {
    id: "dino",

    title:
      "Private Riviera Boat Escape",

    operator:
      "Dino",

    heroImage:
      "/images/dino/hero.webp",

    basePrice: 1200,

    description:
      "A private Riviera boat experience designed around hidden coves, authentic coastal scenery and Mediterranean atmosphere.",
  },

  {
    id: "aphrodite",

    title:
      "Luxury Riviera Yacht",

    operator:
      "Aphrodite",

    heroImage:
      "/images/aphrodite/hero.webp",

    basePrice: 3500,

    description:
      "A luxury yacht experience crafted around exclusivity, elegance and cinematic Mediterranean moments.",
  },

  {
    id: "velamica",

    title:
      "Authentic Sailing Journey",

    operator:
      "Velamica",

    heroImage:
      "/images/velamica/hero.webp",

    basePrice: 900,

    description:
      "A sailing experience focused on freedom, exploration and authentic Riviera navigation.",
  },

  {
    id: "airplane",

    title:
      "Aerial Riviera Experience",

    operator:
      "Sky Riviera",

    heroImage:
      "/images/airplane/hero.webp",

    basePrice: 1800,

    description:
      "A private aerial journey showcasing the Riviera coastline from an entirely new perspective.",
  },

  {
    id: "restaurant",

    title:
      "Riviera Fine Dining",

    operator:
      "Portovenere Dining",

    heroImage:
      "/images/restaurant/hero.webp",

    basePrice: 250,

    description:
      "An elevated dining experience inspired by local ingredients and Mediterranean hospitality.",
  },

  {
    id: "foodwine",

    title:
      "Food & Wine Experience",

    operator:
      "Cinque Terre Wine",

    heroImage:
      "/images/foodwine/hero.webp",

    basePrice: 350,

    description:
      "A curated food and wine journey celebrating the authentic flavors of the Italian Riviera.",
  },
];