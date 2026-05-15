import { experiences } from "@/lib/experiences";

interface BuildProposalGalleryProps {
  experiencesSelected: string[];
  moodsSelected: string[];
}

export function buildProposalGallery({
  experiencesSelected,
  moodsSelected,
}: BuildProposalGalleryProps) {

  // MATCH EXPERIENCES
  const matchedExperiences =
    experiences.filter((exp) =>
      experiencesSelected.includes(exp.title)
    );

  // HERO IMAGE
  const heroImage =
    matchedExperiences[0]?.heroImage ||
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070";

  // FINAL GALLERY
  const galleryImages: string[] = [];

  matchedExperiences.forEach((experience) => {

    moodsSelected.forEach((mood) => {

      const moodGallery =
        experience.gallery?.[
          mood as keyof typeof experience.gallery
        ];

      if (
        moodGallery &&
        moodGallery.length > 0
      ) {

        galleryImages.push(
          moodGallery[0]
        );
      }
    });
  });

  // REMOVE DUPLICATES
  const uniqueImages =
    [...new Set(galleryImages)];

  // LIMIT TO 4
  const finalImages =
    uniqueImages.slice(0, 4);

  return {
    heroImage,
    galleryImages: finalImages,
  };
}