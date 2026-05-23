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

        const moodAddons =

          compatibility?.moods?.[
            mood as keyof typeof compatibility.moods
          ]?.addons || [];

        addonIds.push(
          ...moodAddons
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

          const combinations =

  compatibility?.combinations as
    Record<string, any>;

const categoryCombination =

  combinations?.[
    category
  ];
          }
        );
      }
    );
  }

  // =====================================================
  // REMOVE DUPLICATES
  // =====================================================

  addonIds =
    [...new Set(addonIds)];

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

      // =================================================
      // TAKE FIRST IMAGE ONLY
      // =================================================

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
  // MAX 4
  // =====================================================
  
  console.log("ADDON IDS", addonIds);
  console.log("IMAGES", images);  
  console.log("MOODS", moodsSelected);

  return images.slice(0, 4);
}