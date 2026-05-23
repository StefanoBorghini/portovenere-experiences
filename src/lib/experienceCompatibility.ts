export const experienceCompatibility = {

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
      },

      "Wild Escape": {

        Romantic: {

          addons: [

            "restaurant",

            "foodwine",
          ],
        },

        Adventure: {

          addons: [],
        },
      },
    },
  },
};