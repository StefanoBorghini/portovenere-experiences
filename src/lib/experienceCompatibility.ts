export const experienceCompatibility = {

  "Sea Escape": {

    compatibleWith: [

      "Wild Escape",

      "Gourmet Escape",
    ],

    incompatibleWith: [

      "Aerial Escape",
    ],

    moods: {

      Romantic: {

        addons: [

          "restaurant",

          "foodwine",

          "mermaiding",
        ],
      },

      Adventure: {

        addons: [

          "snorkeling",

          "trekking",
        ],
      },

      Cinematic: {

        addons: [

          "mermaiding",

          "foodwine",
        ],
      },

      Authentic: {

        addons: [

          "trekking",

          "foodwine",
        ],
      },
    },

    combinations: {

      "Gourmet Escape": {

        Romantic: {

          addons: [

            "mermaiding",
          ],
        },

        Adventure: {

          addons: [

            "snorkeling",

            "trekking",

            "foodwine",
          ],
        },

        Cinematic: {

          addons: [

            "foodwine",

            "restaurant",
          ],
        },

        Authentic: {

          addons: [

            "trekking",
          ],
        },
      },

      "Wild Escape": {

        Romantic: {

          addons: [

            "restaurant",

            "foodwine",
          ],
        },

        Adventure: {

          addons: [

            "foodwine",
          ],
        },

        Cinematic: {

          addons: [

            "restaurant",
          ],
        },

        Authentic: {

          addons: [

            "foodwine",
          ],
        },
      },
    },
  },

  "Aerial Escape": {

  compatibleWith: [

    "Wild Escape",

    "Gourmet Escape",
  ],

  incompatibleWith: [

    "Sea Escape",
  ],

  moods: {

    Romantic: {

      addons: [

        "restaurant",
      ],
    },

    Adventure: {

      addons: [

        "trekking",
      ],
    },

    Cinematic: {

      addons: [

        "restaurant",

        "trekking",
      ],
    },

    Authentic: {

      addons: [

        "trekking",
      ],
    },
  },

  combinations: {

    "Gourmet Escape": {

      Romantic: {

        addons: [

          "restaurant",
        ],
      },

      Adventure: {

        addons: [

          "foodwine",

          "trekking",
        ],
      },

      Cinematic: {

        addons: [

          "restaurant",
        ],
      },

      Authentic: {

        addons: [

          "foodwine",
        ],
      },
    },

    "Wild Escape": {

      Romantic: {

        addons: [

          "restaurant",
        ],
      },

      Adventure: {

        addons: [

          "trekking",
        ],
      },

      Cinematic: {

        addons: [

          "trekking",
        ],
      },

      Authentic: {

        addons: [

          "trekking",
        ],
      },
    },
  },
},

// =====================================================
// GOURMET ESCAPE
// =====================================================

"Gourmet Escape": {

  compatibleWith: [

    "Sea Escape",

    "Wild Escape",

    "Aerial Escape",
  ],

  incompatibleWith: [],

  moods: {

    Romantic: {

      addons: [

        "restaurant",

        "foodwine",
      ],
    },

    Adventure: {

      addons: [

        "foodwine",
      ],
    },

    Cinematic: {

      addons: [

        "restaurant",
      ],
    },

    Authentic: {

      addons: [

        "foodwine",
      ],
    },
  },

  combinations: {},
},

// =====================================================
// WILD ESCAPE
// =====================================================

"Wild Escape": {

  compatibleWith: [

    "Sea Escape",

    "Gourmet Escape",

    "Aerial Escape",
  ],

  incompatibleWith: [],

  moods: {

    Romantic: {

      addons: [

        "mermaiding",
      ],
    },

    Adventure: {

      addons: [

        "snorkeling",

        "trekking",

        "horses",
      ],
    },

    Cinematic: {

      addons: [

        "mermaiding",

        "snorkeling",
      ],
    },

    Authentic: {

      addons: [

        "trekking",

        "horses",
      ],
    },
  },

  combinations: {},
},

// Nuove categorie (Wine/Cultural/Wellness Escape) — entry vuote ma
// sicure (compatibleWith/moods/combinations presenti, nessun lookup
// puo' fallire), pronte per essere arricchite con suggerimenti di
// addon reali quando ci saranno esperienze in queste categorie. Stessa
// logica delle altre: compatibilityData le legge solo se
// selectedMainCategory le raggiunge davvero.
"Wine Escape": {
  compatibleWith: ["Gourmet Escape"],
  incompatibleWith: [],
  moods: {},
  combinations: {},
},

"Cultural Escape": {
  compatibleWith: [],
  incompatibleWith: [],
  moods: {},
  combinations: {},
},

"Wellness Escape": {
  compatibleWith: [],
  incompatibleWith: [],
  moods: {},
  combinations: {},
},
};