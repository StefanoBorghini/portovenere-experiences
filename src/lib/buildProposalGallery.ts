"use client";

import { experiences } from "./experiences";

interface BuildProposalGalleryProps {
  experiencesSelected: string[];
  moodsSelected: string[];
}

export function buildProposalGallery({
  experiencesSelected,
  moodsSelected,
}: BuildProposalGalleryProps): string[] {
  const images: string[] = [];

  // Trova le esperienze selezionate
  const matchedExperiences = experiences.filter((exp) =>
    experiencesSelected.includes(exp.title)
  );

  matchedExperiences.forEach((experience) => {
    const gallery = experience.gallery;
    if (!gallery) return;

    const galleryKeys = Object.keys(gallery) as (keyof typeof gallery)[];

    // Prima immagine per ciascun mood/esperienza disponibile
    galleryKeys.forEach((key) => {
      if (moodsSelected.includes(key)) {
        const galleryImages = gallery[key];
        if (galleryImages && galleryImages.length > 0) {
          images.push(galleryImages[0]);
        }
      }
    });

    // Se non ci sono immagini selezionate dai moods, prendi l'hero
    if (!images.some((img) => img === experience.heroImage)) {
      images.push(experience.heroImage);
    }
  });

  // Limita a 4 immagini
  return images.slice(0, 4);
}