
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

import {
  cleanConflicts,
  removeDuplicates,
  hasConflict,
} from "./proposal-engine/gallery/galleryHelpers";

import {
  selectGalleryImage,
} from "./proposal-engine//gallery/selectGalleryImage";

// =====================================================
// TYPES
// =====================================================

interface BuildGalleryProps {

  experiencesSelected:
    string[];

  moodsSelected:
    string[];

  heroExperienceId:
    string;
}

// =====================================================
// BUILD PROPOSAL GALLERY
// =====================================================

export function buildProposalGallery({

  experiencesSelected,

  moodsSelected,

  heroExperienceId,

}: BuildGalleryProps) {

  // ===================================================
  // HERO EXPERIENCE
  // ===================================================

  const heroExperience =

    experiences.find(
      (exp) =>
        exp.id === heroExperienceId
    );

  if (!heroExperience) {
    return [];
  }

  // ===================================================
  // MAIN CATEGORY
  // ===================================================

  const mainCategory =
    heroExperience.macroCategory;

  const compatibility =

    experienceCompatibility[
      mainCategory as keyof typeof experienceCompatibility
    ];

  // ===================================================
  // NARRATIVE SLOTS
  // ===================================================

  let selectedActivity:
    string | null = null;

  let selectedGourmet:
    string | null = null;

  let selectedAtmosphere:
    string | null = null;

  // ===================================================
  // ADDON TYPES
  // ===================================================

  // TODO:
  // move this inside experiences
  // as narrativeRole / slot

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

  // ===================================================
  // ASSIGN SLOT
  // ===================================================

  function assignNarrativeSlot(
    addonId: string
  ) {

    const type =
      addonTypes[addonId];

    if (!type) {
      return;
    }

    // -----------------------------------------------

    if (
      type === "activity" &&
      !selectedActivity
    ) {

      selectedActivity =
        addonId;
    }

    // -----------------------------------------------

    if (
      type === "gourmet" &&
      !selectedGourmet
    ) {

      selectedGourmet =
        addonId;
    }

    // -----------------------------------------------

    if (
      type === "atmosphere" &&
      !selectedAtmosphere
    ) {

      selectedAtmosphere =
        addonId;
    }
  }

  // ===================================================
  // SINGLE CATEGORY
  // ===================================================

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

  // ===================================================
  // CATEGORY COMBINATIONS
  // ===================================================

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

  // ===================================================
  // ADDON IDS
  // ===================================================

  const addonIdsRaw = [

    selectedActivity,

    selectedGourmet,

    selectedAtmosphere,
  ];

  let addonIds = addonIdsRaw.filter(
    (item) => item !== null
  ) as string[];

  // ===================================================
  // FALLBACKS
  // ===================================================

  if (
    addonIds.length < 2
  ) {

    const compatibleExperiences =

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

            // compatibility

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

    compatibleExperiences.forEach(
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

  // ===================================================
  // CLEAN CONFLICTS
  // ===================================================

  addonIds = cleanConflicts(

    addonIds,

    experienceConflicts
  );

  // ===================================================
  // GALLERY EXPERIENCES
  // ===================================================

  const galleryExperiences:
    any[] = [];

  // always hero first

  galleryExperiences.push(
    heroExperience
  );

  // ===================================================
  // CANDIDATES
  // ===================================================

  const candidateExperiences =

    addonIds

      .map(
        (id) =>

          experiences.find(
            (exp) =>
              exp.id === id
          )
      )

      .filter(Boolean);

  // ===================================================
  // ADD COMPATIBLE
  // ===================================================

  candidateExperiences.forEach(
    (candidate: any) => {

      if (
        galleryExperiences.length >= 3
      ) {

        return;
      }

      const hasAnyConflict =

        galleryExperiences.some(
          (selected) =>

            hasConflict(

              selected,

              candidate,

              experienceConflicts
            )
        );

      if (!hasAnyConflict) {

        galleryExperiences.push(
          candidate
        );
      }
    }
  );

  // ===================================================
  // FILL EMPTY SLOTS
  // ===================================================

  while (
    galleryExperiences.length < 3
  ) {

    galleryExperiences.push(
      heroExperience
    );
  }

  // ===================================================
  // BUILD IMAGES
  // ===================================================

  const images: string[] = [];

  galleryExperiences.forEach(
    (experience) => {

      if (!experience) {
        return;
      }

      const bestImage =

        selectGalleryImage({

          experience,

          selectedCategories:
            experiencesSelected,

          selectedMoods:
            moodsSelected,
        });

      if (bestImage) {

        images.push(
          bestImage
        );
      }
    }
  );

  // ===================================================
  // REMOVE DUPLICATES
  // ===================================================

  const finalImages =

    removeDuplicates(images);

  // ===================================================
  // RETURN
  // ===================================================

  return finalImages.slice(0, 3);
}

