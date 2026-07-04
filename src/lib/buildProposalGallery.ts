// =====================================================
// buildProposalGallery.ts
// Costruisce la gallery usando SOLO le immagini della
// featured experience e delle esperienze effettivamente
// incluse in questa proposal — non più da esperienze
// scorate genericamente ma escluse dal risultato finale.
// =====================================================

interface BuildGalleryProps {
  featuredExperience: any;
  includedExperiences: any[]; // le esperienze REALMENTE presenti in questa proposal
  maxImagesPerExperience?: number;
  maxTotalImages?: number;
}

function getExperienceGalleryImages(experience: any): string[] {
  const galleryImages = (experience?.gallery || [])
    .filter((img: any) => img.active !== false)
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((img: any) => img.image_url)
    .filter(Boolean);

  if (galleryImages.length > 0) {
    return galleryImages;
  }

  // fallback su singola immagine se l'esperienza non ha una gallery
  const fallback =
    experience?.detail_image ||
    experience?.hero_image ||
    experience?.featured_image;

  return fallback ? [fallback] : [];
}

export function buildProposalGallery({
  featuredExperience,
  includedExperiences,
  maxImagesPerExperience = 3,
  maxTotalImages = 12,
}: BuildGalleryProps) {

  if (!featuredExperience) {
    return [];
  }

  const images: string[] = [];

  // ===================================================
  // GALLERY DELLA FEATURED EXPERIENCE
  // (nessun limite: è l'esperienza principale della proposal)
  // ===================================================

  images.push(...getExperienceGalleryImages(featuredExperience));

  // ===================================================
  // GALLERY DELLE ESPERIENZE REALMENTE INCLUSE
  // (max N immagini a testa, per dare varietà senza
  // che una singola esperienza monopolizzi la gallery)
  // ===================================================

  (includedExperiences || [])
    .filter((exp: any) => exp?.id !== featuredExperience.id)
    .forEach((exp: any) => {
      const expImages = getExperienceGalleryImages(exp).slice(
        0,
        maxImagesPerExperience
      );
      images.push(...expImages);
    });

  // ===================================================
  // DEDUPE + CAP
  // ===================================================

  const uniqueImages = [...new Set(images)];

  return uniqueImages.slice(0, maxTotalImages);
}