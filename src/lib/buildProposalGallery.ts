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
  // SUPPORTING IDS
  // =====================================================

  let addonIds: string[] = [];

  const narrativeSlots = {

    activity: [] as string[],

    gourmet: [] as string[],

    atmosphere: [] as string[],
  };

  const addonTypes: Record<
    string,
    keyof typeof narrativeSlots
  > = {

    snorkeling: "activity",

    trekking: "activity",

    restaurant: "gourmet",

    foodwine: "gourmet",

    mermaiding: "atmosphere",

    sunset: "atmosphere",
  };

  const mainCategory =
    heroExperience.macroCategory;

  const compatibility =

    experienceCompatibility[
      mainCategory as keyof typeof experienceCompatibility
    ];

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

            const type =
              addonTypes[addonId];

            if (
              type &&
              narrativeSlots[type].length === 0
            ) {

              narrativeSlots[type].push(
                addonId
              );
            }
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

                const type =
                  addonTypes[addonId];

                if (
                  type &&
                  narrativeSlots[type].length === 0
                ) {

                  narrativeSlots[type].push(
                    addonId
                  );
                }
              }
            );
          }
        );
      }
    );
  }

  // =====================================================
  // FINAL ADDON IDS
  // =====================================================

  addonIds = [

    ...narrativeSlots.activity,

    ...narrativeSlots.gourmet,

    ...narrativeSlots.atmosphere,
  ];

  addonIds =
    [...new Set(addonIds)];

  // =====================================================
  // FALLBACKS
  // =====================================================

  if (
    addonIds.length < 4
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

          // no same category

          if (
            experience.macroCategory ===
            mainCategory
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
  // REMOVE DUPLICATE IMAGES
  // =====================================================

  const uniqueImages =

    [...new Set(images)];

  // =====================================================
  // DEBUG
  // =====================================================

  console.log(
    "ADDON IDS",
    addonIds
  );

  console.log(
    "IMAGES",
    uniqueImages
  );

  console.log(
    "MOODS",
    moodsSelected
  );

  // =====================================================
  // MAX 4
  // =====================================================

  return uniqueImages.slice(0, 4);
}