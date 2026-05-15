export const experiences = [
  // ---------------- PRIVATE / LUXURY ESCAPE
  {
    id: "private-sailing",
    title: "Private / Luxury Escape",
    category: "sea",
    basePrice: 1200,
    moods: ["Romantic", "Relaxed", "Authentic", "Cinematic"],
    familyFriendly: true,
    minBudget: 1000,
    heroImage:
      "https://images.pexels.com/photos/35030771/pexels-photo-35030771.jpeg",
    gallery: {
      Romantic: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200",
        "https://images.unsplash.com/photo-1493558103817-58b2924bce98?q=80&w=1200",
      ],
      Relaxed: [
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200",
      ],
    },
    description:
      "Private sailing or luxury yachting with hidden coves and Mediterranean atmosphere.",
    variants: ["Private Sailing", "Luxury Yachting"], // 2 opzioni
    score: 90,
  },

  // ---------------- AERIAL ESCAPE
  {
    id: "aerial-escape",
    title: "Aerial Escape",
    category: "air",
    basePrice: 1300,
    moods: ["Adventure", "Cinematic"],
    familyFriendly: true,
    minBudget: 800,
    heroImage:
      "https://images.pexels.com/photos/2113566/pexels-photo-2113566.jpeg",
    gallery: {
      Adventure: [
        "https://images.pexels.com/photos/2113566/pexels-photo-2113566.jpeg",
        "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg",
      ],
      Cinematic: [
        "https://images.pexels.com/photos/912110/pexels-photo-912110.jpeg",
        "https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg",
      ],
    },
    description: "Aerial experiences like hot air balloon or small aircraft adventures.",
    variants: ["Balloon Escape", "Plane Escape"], // 2 opzioni
    score: 85,
  },

  // ---------------- GOURMET ESCAPE
  {
    id: "gourmet-escape",
    title: "Gourmet Escape",
    category: "food",
    basePrice: 1100,
    moods: ["Romantic", "Authentic", "Relaxed", "Luxury"],
    familyFriendly: true,
    minBudget: 1000,
    heroImage:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070",
    gallery: {
      Romantic: [
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
      ],
      Authentic: [
        "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1200",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200",
      ],
    },
    description: "Exclusive food and wine experiences inspired by the Italian Riviera lifestyle.",
    variants: ["Wine Tasting", "Chef Experience", "Local Cuisine Tour"], // 3 opzioni
    score: 92,
  },

  // ---------------- WILD ESCAPE
  {
    id: "wild-escape",
    title: "Wild Escape",
    category: "adventure",
    basePrice: 900,
    moods: ["Adventure", "Authentic"],
    familyFriendly: false,
    minBudget: 500,
    heroImage:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=2070",
    gallery: {
      Adventure: [
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1200",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200",
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200",
      ],
      Authentic: [
        "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1200",
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1200",
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200",
      ],
    },
    description: "Outdoor exploration experiences including trekking, wildlife and adventure sports.",
    variants: ["Trekking", "Wild Camp", "Kayak Tour"], // 3 opzioni
    score: 88,
  },
];