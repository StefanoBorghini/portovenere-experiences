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

  const matchedExperiences =
    experiences.filter((exp) =>
      experiencesSelected.includes(exp.title)
    );

  matchedExperiences.forEach((experience) => {

    const gallery = experience.gallery;

    if (!gallery) return;

    const galleryKeys =
      Object.keys(gallery);

    // PRENDE LA PRIMA GALLERY DISPONIBILE

    galleryKeys.forEach((key) => {

     const galleryImages =
  gallery[
    key as keyof typeof gallery
  ];

      if (
        galleryImages &&
        galleryImages.length > 0
      ) {

        images.push(galleryImages[0]);
      }
    });
  });

  // LIMITA A 4 IMMAGINI

  return images.slice(0, 4);
}