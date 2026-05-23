import { experiences } from "@/lib/experiences";

interface BuildGalleryProps {
  experiencesSelected: string[];
  moodsSelected: string[];
}

export function buildProposalGallery({
  experiencesSelected,
  moodsSelected,
}: BuildGalleryProps) {

  const images: string[] = [];

  // MATCH EXPERIENCES

  const matchedExperiences =
    experiences.filter((experience) =>

      experiencesSelected.includes(
        experience.macroCategory
      )
    );

  // SORT BY MOOD SCORE

  matchedExperiences.sort(
    (a, b) => {

      const aScore =
        moodsSelected.reduce(
          (total, mood) => {

            return (
              total +
              (
                a.moodScores[
                  mood as keyof typeof a.moodScores
                ] || 0
              )
            );
          },
          0
        );

      const bScore =
        moodsSelected.reduce(
          (total, mood) => {

            return (
              total +
              (
                b.moodScores[
                  mood as keyof typeof b.moodScores
                ] || 0
              )
            );
          },
          0
        );

      return bScore - aScore;
    }
  );

  // EXPERIENCE IMAGES

  matchedExperiences.forEach(
    (experience) => {

      const gallery =
        experience.gallery;

      if (!gallery) return;

      Object.keys(gallery).forEach(
        (variantKey) => {

          const variantImages =
            gallery[
              variantKey as keyof typeof gallery
            ];

          if (
            variantImages &&
            variantImages.length > 0
          ) {

            const randomImage =
              variantImages[
                Math.floor(
                  Math.random() *
                  variantImages.length
                )
              ];

            images.push(
              randomImage
            );
          }
        }
      );
    }
  );

  // MOOD BOOST

  moodsSelected.forEach((mood) => {

    matchedExperiences.forEach(
      (experience) => {

        const moodValue =

          experience.moodScores[
            mood as keyof typeof experience.moodScores
          ] || 0;

        if (moodValue <= 0) {
          return;
        }

        const gallery =
          experience.gallery;

        if (!gallery) return;

        const galleries =
          Object.values(gallery);

        galleries.forEach(
          (galleryImages) => {

            if (
              galleryImages &&
              galleryImages.length > 0
            ) {

              const randomMoodImage =
                galleryImages[
                  Math.floor(
                    Math.random() *
                    galleryImages.length
                  )
                ];

              images.push(
                randomMoodImage
              );
            }
          }
        );
      }
    );
  });

  // REMOVE DUPLICATES

  const uniqueImages =
    [...new Set(images)];

  // SHUFFLE

  const shuffled =
    uniqueImages.sort(
      () => Math.random() - 0.5
    );

  // MAX 4

  return shuffled.slice(0, 4);
}