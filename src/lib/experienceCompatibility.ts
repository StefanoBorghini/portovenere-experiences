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
};