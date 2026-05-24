import { experiences }
from "@/lib/experiences";

import {
  experienceCompatibility,
} from "@/lib/experienceCompatibility";

import {
  experienceConflicts,
} from "@/lib/experienceConflicts";
interface BuildGalleryProps {

  experiencesSelected:
    string[];

  moodsSelected:
    string[];

  heroExperienceId:
    string;
}

export function buildProposalGallery({

  experiencesSelected,

  moodsSelected,

  heroExperienceId,

}: BuildGalleryProps) {

  // =====================================================
  // HERO EXPERIENCE
  // =====================================================

  const heroExperience =

    experiences.find(
      (exp) =>
        exp.id === heroExperienceId
    );

  if (!heroExperience) {
    return [];
  }

  // =====================================================
  // MAIN CATEGORY
  // =====================================================

  const mainCategory =
    heroExperience.macroCategory;

  const compatibility =

    experienceCompatibility[
      mainCategory as keyof typeof experienceCompatibility
    ];

  // =====================================================
  // NARRATIVE SLOTS
  // =====================================================

  let selectedActivity:
    string | null = null;

  let selectedGourmet:
    string | null = null;

  let selectedAtmosphere:
    string | null = null;

  // =====================================================
  // ADDON TYPES
  // =====================================================

  const addonTypes: Record<
    string,
    "activity" |
    "gourmet" |
    "atmosphere"
  > = {

    snorkeling: "activity",

    trekking: "activity",

    mermaiding: "activity",

    restaurant: "gourmet",

    foodwine: "gourmet",

    sunset: "atmosphere",

    aperitivo: "atmosphere",
  };

  // =====================================================
  // PRIORITY PICKER
  // =====================================================

  function assignNarrativeSlot(
    addonId: string
  ) {

    const type =
      addonTypes[addonId];

    if (!type) {
      return;
    }

    // ===============================================
    // ACTIVITY
    // ===============================================

    if (
      type === "activity" &&
      !selectedActivity
    ) {

      selectedActivity =
        addonId;
    }

    // ===============================================
    // GOURMET
    // ===============================================

    if (
      type === "gourmet" &&
      !selectedGourmet
    ) {

      selectedGourmet =
        addonId;
    }

    // ===============================================
    // ATMOSPHERE
    // ===============================================

    if (
      type === "atmosphere" &&
      !selectedAtmosphere
    ) {

      selectedAtmosphere =
        addonId;
    }
  }

  // =====================================================
  // SINGLE CATEGORY
  // =====================================================

  if (
    experiencesSelected.length === 1
  ) {

    moodsSelected.forEach(
      (mood) => {

        const normalizedMood =

          mood.charAt(0).toUpperCase() +
          mood.slice(1);

        const moodAddons =

          compatibility?.moods?.[
            normalizedMood as keyof typeof compatibility.moods
          ]?.addons || [];

        moodAddons.forEach(
          (addonId: string) => {

            assignNarrativeSlot(
              addonId
            );
          }
        );
      }
    );
  }

  // =====================================================
  // CATEGORY COMBINATIONS
  // =====================================================

  if (
    experiencesSelected.length >= 2
  ) {

    experiencesSelected.forEach(
      (category) => {

        if (
          category === mainCategory
        ) {
          return;
        }

        moodsSelected.forEach(
          (mood) => {

            const normalizedMood =

              mood.charAt(0).toUpperCase() +
              mood.slice(1);

            const combinations =

              compatibility?.combinations as
                Record<string, any>;

            const categoryCombination =

              combinations?.[
                category
              ];

            const moodCombination =

              categoryCombination?.[
                normalizedMood
              ];

            const comboAddons =

              moodCombination?.addons || [];

            comboAddons.forEach(
              (addonId: string) => {

                assignNarrativeSlot(
                  addonId
                );
              }
            );
          }
        );
      }
    );
  }

  // =====================================================
  // FINAL IDS
  // =====================================================

const addonIdsRaw = [

  selectedActivity,

  selectedGourmet,

  selectedAtmosphere,
];

let addonIds = addonIdsRaw.filter(
  (item) => item !== null
) as string[];



const usedNarrativeTypes = {

  activity:
    !!selectedActivity,

  gourmet:
    !!selectedGourmet,

  atmosphere:
    !!selectedAtmosphere,
};
  // =====================================================
  // FALLBACKS
  // =====================================================
// =====================================================
// FALLBACKS
// =====================================================

if (
  addonIds.length < 2
) {

  const compatibleCategories =

    compatibility?.compatibleWith || [];

  const fallbackExperiences =

    experiences.filter(
      (experience) => {

        // no hero

        if (
          experience.id ===
          heroExperienceId
        ) {
          return false;
        }

        // no duplicates

        if (
          addonIds.includes(
            experience.id
          )
        ) {
          return false;
        }

        // no same category

        if (
          experience.macroCategory ===
          mainCategory
        ) {
          return false;
        }

        // no duplicate narrative types

        const experienceType =

          addonTypes[
            experience.id
          ];

        if (
          experienceType &&
          usedNarrativeTypes[
            experienceType
          ]
        ) {
          return false;
        }

        // only compatible categories

        return compatibleCategories.includes(
          experience.macroCategory
        );
      }
    );

  fallbackExperiences.forEach(
    (experience) => {

      if (
        addonIds.length >= 3
      ) {
        return;
      }

      addonIds.push(
        experience.id
      );
    }
  );
}

// =====================================================
// REMOVE CONFLICTS
// =====================================================

const cleanedAddons: string[] = [];

addonIds.forEach(
  (id) => {

    const conflicts =

      experienceConflicts[id] || [];

    const hasConflict =

      cleanedAddons.some(
        (existing) =>

          conflicts.includes(
            existing
          )
      );

    if (!hasConflict) {

      cleanedAddons.push(id);
    }
  }
);

addonIds = cleanedAddons;

// =====================================================
// FINAL EXPERIENCES
// =====================================================

const finalExperiences = [

  heroExperience,

  ...addonIds.map(
    (id) =>

      experiences.find(
        (exp) =>
          exp.id === id
      )
  ),

].filter(Boolean);

// =====================================================
// GET BEST IMAGE
// =====================================================

function getBestImage(
  experience: any
) {

  if (!experience) {
    return null;
  }

  // ===================================================
  // COMBINATION KEY
  // ===================================================

  const combinationParts = [

    ...experiencesSelected,

    ...moodsSelected,
  ];

  const combinationKey =

    combinationParts.join("-");

  // ===================================================
  // HERO COMBINATION
  // ===================================================

  const combinationImage =

    experience.heroCombinations?.[
      combinationKey
    ];

  if (combinationImage) {
    return combinationImage;
  }

  // ===================================================
  // SINGLE CATEGORY + MOOD
  // ===================================================

  const singleMoodKey =

    `${experience.macroCategory}-${moodsSelected[0]}`;

  const singleMoodImage =

    experience.heroCombinations?.[
      singleMoodKey
    ];

  if (singleMoodImage) {
    return singleMoodImage;
  }

  // ===================================================
  // HERO IMAGE
  // ===================================================

  if (experience.heroImage) {
    return experience.heroImage;
  }

  // ===================================================
  // GALLERY FALLBACK
  // ===================================================

  if (experience.gallery) {

   const galleryValues =

  Object.values(
    experience.gallery
  ) as string[][];

const firstGallery =
  galleryValues[0];
  }

  return null;
}

// =====================================================
// BUILD IMAGES
// =====================================================

const images: string[] = [];

finalExperiences.forEach(
  (experience) => {

    const image =

      getBestImage(
        experience
      );

    if (image) {

      images.push(
        image
      );
    }
  }
);

// =====================================================
// UNIQUE IMAGES
// =====================================================

const uniqueImages =

  [...new Set(images)];

// =====================================================
// DEBUG
// =====================================================

console.log(
  "FINAL EXPERIENCES",
  finalExperiences
);

console.log(
  "FINAL IMAGES",
  uniqueImages
);

// =====================================================
// RETURN
// =====================================================

return uniqueImages.slice(0, 3);}