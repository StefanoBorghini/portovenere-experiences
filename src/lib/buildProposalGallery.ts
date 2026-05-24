import { experiences }
from "@/lib/experiences";

import {
  experienceCompatibility,
} from "@/lib/experienceCompatibility";

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
  // =====================================================
  // FALLBACKS
  // =====================================================
if (
  addonIds.length < 3
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

          // compatible only

          return compatibleCategories.includes(
            experience.macroCategory
          );
        }
      );

    fallbackExperiences.forEach(
      (experience) => {

        if (
          addonIds.length >= 4
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
  // BUILD IMAGES
  // =====================================================

  const images: string[] = [];

  addonIds.forEach(
    (addonId) => {

      const addonExperience =

        experiences.find(
          (exp) =>
            exp.id === addonId
        );

      if (
        !addonExperience ||
        !addonExperience.gallery
      ) {
        return;
      }

      const galleryValues =

        Object.values(
          addonExperience.gallery
        );

      const firstGallery =
        galleryValues[0];

      if (
        firstGallery &&
        firstGallery[0]
      ) {

        images.push(
          firstGallery[0]
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
    "FINAL ADDON IDS",
    addonIds
  );

  console.log(
    "FINAL IMAGES",
    uniqueImages
  );

  // =====================================================
  // RETURN
  // =====================================================

  return uniqueImages.slice(0, 3);
}