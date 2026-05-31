
// =====================================================
// selectGalleryImage.ts
// =====================================================

interface SelectGalleryImageProps {

  experience: any;

  selectedCategories:
    string[];

  selectedMoods:
    string[];
}

export function selectGalleryImage({

  experience,

  selectedCategories,

  selectedMoods,

}: SelectGalleryImageProps) {

  if (!experience) {
    return null;
  }

  // ===================================================
  // HERO VARIANTS
  // ===================================================

  const heroVariants =

    experience.heroVariants || [];

  // ===================================================
  // MATCH VARIANT
  // ===================================================

  const matchingVariant =

    heroVariants.find(
      (variant: any) => {

        const categoryMatch =

          variant.categories.every(
            (category: string) =>

              selectedCategories.includes(
                category
              )
          );

        const moodMatch =

          variant.moods.every(
            (mood: string) =>

              selectedMoods.includes(
                mood
              )
          );

        return (
          categoryMatch &&
          moodMatch
        );
      }
    );

  if (
    matchingVariant?.image
  ) {

    return matchingVariant.image;
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
      firstGallery?.[0]
    ) {

      return firstGallery[0];
    }
  }

  return null;
}

