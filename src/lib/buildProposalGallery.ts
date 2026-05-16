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
        experience.title
      )
    );

  // SORT BY SCORE

  const sortedExperiences =
    matchedExperiences.sort(
      (a, b) =>
        b.score - a.score
    );

  // EXPERIENCE IMAGES

  sortedExperiences.forEach(
    (experience) => {

      const gallery =
        experience.gallery;

      if (!gallery) return;

      // PRENDE UNA IMMAGINE RANDOM
      // DA OGNI VARIANTE

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

  // aggiunge immagini extra coerenti
  // in base al mood scelto

  moodsSelected.forEach((mood) => {

    matchedExperiences.forEach(
      (experience) => {

        if (
          !experience.moods.includes(
            mood
          )
        ) {
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