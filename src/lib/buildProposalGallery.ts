import { experiences }
from "@/lib/experiences";

interface BuildGalleryProps {

  experiencesSelected: string[];

  moodsSelected: string[];
}

export function buildProposalGallery({

  experiencesSelected,

  moodsSelected,

}: BuildGalleryProps) {

  // ======================================================
  // MATCH EXPERIENCES
  // ======================================================

  const matchedExperiences =
    experiences.filter(
      (experience) =>

        experiencesSelected.includes(
          experience.macroCategory
        )
    );

  // ======================================================
  // SCORE EXPERIENCES
  // ======================================================

  const scoredExperiences =
    matchedExperiences.map(
      (experience) => {

        let score = 0;

        moodsSelected.forEach(
          (mood) => {

            const moodScore =

              experience.moodScores[
                mood as keyof typeof experience.moodScores
              ] || 0;

            score += moodScore;
          }
        );

        return {

          ...experience,

          galleryScore: score,
        };
      }
    );

  // ======================================================
  // SORT
  // ======================================================

  const sortedExperiences =

    scoredExperiences.sort(
      (a, b) =>

        b.galleryScore -
        a.galleryScore
    );

  // ======================================================
  // BUILD GALLERY
  // ======================================================

  const images: string[] = [];

  sortedExperiences.forEach(
    (experience) => {

      if (!experience.gallery) {
        return;
      }

      // ==================================================
      // PRIORITY:
      // HERO COMBINATIONS
      // ==================================================

      moodsSelected.forEach(
        (mood) => {

          const key =
            `${experience.macroCategory}-${mood}`;

          const comboImage =

            experience.heroCombinations?.[
              key
            ];

          if (comboImage) {

            images.push(
              comboImage
            );
          }
        }
      );

      // ==================================================
      // GALLERY IMAGES
      // ==================================================

      Object.values(
        experience.gallery
      ).forEach(
        (galleryImages) => {

          galleryImages.forEach(
            (image) => {

              images.push(image);
            }
          );
        }
      );
    }
  );

  // ======================================================
  // REMOVE DUPLICATES
  // ======================================================

  const uniqueImages =

    [...new Set(images)];

  // ======================================================
  // SHUFFLE
  // ======================================================

  const shuffled =

    uniqueImages.sort(
      () => Math.random() - 0.5
    );

  // ======================================================
  // MAX 4
  // ======================================================

  return shuffled.slice(0, 4);
}