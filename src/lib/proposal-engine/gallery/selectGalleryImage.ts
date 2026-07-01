
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
console.log(
  "GALLERY EXPERIENCE",
  experience
);
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
// ===================================================
// HERO IMAGE
// ===================================================

if (experience.hero_image) {

  return experience.hero_image;

}

// ===================================================
// GALLERY FALLBACK
// ===================================================

if (
  experience.gallery?.length
) {

  const featured = experience.gallery.find(
    (image: any) =>
      image.featured && image.active
  );

  if (featured) {
    return featured.image_url;
  }

  const first = experience.gallery.find(
    (image: any) =>
      image.active
  );

  if (first) {
    return first.image_url;
  }

}

console.log({
  hero_image: experience.hero_image,
  gallery: experience.gallery,
});
}

