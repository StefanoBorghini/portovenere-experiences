// =====================================================
// buildProposalGallery.ts
// Costruisce la gallery a partire dalle experience
// dinamiche (Supabase) già scorate da generateProposal
// =====================================================

interface BuildGalleryProps {
  featuredExperience: any;
  scoredExperiences: any[];
}

export function buildProposalGallery({
  featuredExperience,
  scoredExperiences,
}: BuildGalleryProps) {

  if (!featuredExperience) {
    return [];
  }

  const images: string[] = [];

  // ===================================================
  // GALLERY DELLA FEATURED EXPERIENCE
  // ===================================================

  const featuredGalleryImages = (featuredExperience.gallery || [])
    .filter((img: any) => img.active !== false)
    .sort((a: any, b: any) =>
      (a.display_order ?? 0) - (b.display_order ?? 0)
    )
    .map((img: any) => img.image_url)
    .filter(Boolean);

  images.push(...featuredGalleryImages);

  // ===================================================
  // FALLBACK SE LA FEATURED NON HA GALLERY
  // ===================================================

  if (images.length === 0) {
    const fallback =
      featuredExperience.detail_image ||
      featuredExperience.hero_image ||
      featuredExperience.featured_image;

    if (fallback) {
      images.push(fallback);
    }
  }

  // ===================================================
  // UNA FOTO DALLE ALTRE EXPERIENCE MEGLIO SCORATE
  // (danno varietà alla gallery, non solo la featured)
  // ===================================================

  const otherExperiences = (scoredExperiences || [])
    .filter((exp: any) => exp.id !== featuredExperience.id);

  otherExperiences.slice(0, 4).forEach((exp: any) => {

    const img =
      (exp.gallery || []).find((g: any) => g.featured)?.image_url ||
      exp.detail_image ||
      exp.hero_image ||
      exp.featured_image;

    if (img) {
      images.push(img);
    }
  });

  // ===================================================
  // DEDUPE
  // ===================================================

  const uniqueImages = [...new Set(images)];

  return uniqueImages.slice(0, 8);
}