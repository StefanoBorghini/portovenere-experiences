import { experiences }
from "@/lib/experiences";

import {
  experienceCompatibility,
} from "@/lib/experienceCompatibility";

import {
  calculateTotalCompatibility,
} from "./experienceScoring";

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

    horses: "activity",

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

    // ===================================================
    // ACTIVITY
    // ===================================================

    if (
      type === "activity" &&
      !selectedActivity
    ) {

      selectedActivity =
        addonId;
    }

    // ===================================================
    // GOURMET
    // ===================================================

    if (
      type === "gourmet" &&
      !selectedGourmet
    ) {

      selectedGourmet =
        addonId;
    }

    // ===================================================
    // ATMOSPHERE
    // ===================================================

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
  // USED NARRATIVE TYPES
  // =====================================================

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

  if (
    addonIds.length < 2
  ) {

    const compatibleCategories =

      compatibility?.compatibleWith || [];

    const fallbackExperiences =

  experiences

    .filter(
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

        // compatible only

        return compatibility?.compatibleWith.includes(
          experience.macroCategory
        );
      }
    )

    .map(
      (experience) => ({

        experience,

        score:
          calculateTotalCompatibility(

            heroExperience,

            experience
          ),
      })
    )

    .sort(
      (a, b) =>
        b.score - a.score
    )

    .map(
      (item) =>
        item.experience
    
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

  const cleanedAddons:
    string[] = [];

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

  ].filter(
    (
      exp
    ): exp is typeof heroExperience =>

      Boolean(exp)
  );

  console.log(
  "addonIds",
  addonIds
);

console.log(
  "finalExperiences",
  finalExperiences
);
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

      if (
        firstGallery &&
        firstGallery[0]
      ) {

        return firstGallery[0];
      }
    }

    return null;
  }

  // =====================================================
  // EXPERIENCE SLOT SYSTEM
  // =====================================================

  const activityExperience =
    finalExperiences.find(
      (exp) =>
        exp &&
        exp.slot === "activity"
    );

  const gourmetExperience =
    finalExperiences.find(
      (exp) =>
        exp &&
        exp.slot === "gourmet"
    );

  const atmosphereExperience =
    finalExperiences.find(
      (exp) =>
        exp &&
        exp.slot === "atmosphere"
    );

  // =====================================================
  // FINAL GALLERY EXPERIENCES
  // =====================================================

  const galleryExperiences = [

    heroExperience,

    activityExperience,

    gourmetExperience ||

      atmosphereExperience,

  ].filter(Boolean);

  console.log(
    "galleryExperiences",
    galleryExperiences
  );

  // =====================================================
  // BUILD IMAGES
  // =====================================================

  const images: string[] = [];

  galleryExperiences.forEach(
    (experience) => {

      if (!experience) {
        return;
      }

      const bestImage =
        getBestImage(
          experience
        );

      if (bestImage) {

        images.push(
          bestImage
        );
      }
    }
  );

  // =====================================================
  // REMOVE DUPLICATES
  // =====================================================

  const finalImages = [

    ...new Set(images),
  ];

  console.log(
    "finalImages",
    finalImages
  );

  // =====================================================
  // RETURN
  // =====================================================

  return finalImages.slice(0, 3);
}