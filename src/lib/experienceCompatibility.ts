export const experienceCompatibility = {

  // =====================================================
  // SEA ESCAPE
  // =====================================================

  "Sea Escape": {

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
          ],
        },

        Cinematic: {

          addons: [

            "mermaiding",
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

  // =====================================================
  // AERIAL ESCAPE
  // =====================================================

  "Aerial Escape": {

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

          addons: [],
        },

        Adventure: {

          addons: [

            "trekking",
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

          addons: [],
        },
      },
    },
  },
};