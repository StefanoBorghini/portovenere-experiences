import {
  buildProposalGallery,
} from "@/lib/buildProposalGallery";

import {
  calculateProposalPrice,
} from "@/lib/pricing";

// =====================================================
// BUILD RENDERER DATA
// =====================================================

export function buildRendererData({

  generatedProposal,

  lead,

  enhancements,

}: any) {

  // ===================================================
  // GALLERY
  // ===================================================

  

  const rankedExperiences =

  generatedProposal
    ?.scoredExperiences || [];

  const galleryImages =

  rankedExperiences

    .flatMap(
      (experience: any) =>
        experience.gallery || []
    )

    .filter(
      (image: any) =>
        image.active
    )

    .sort(
      (a: any, b: any) =>
        a.display_order - b.display_order
    )

    .map(
      (image: any) =>
        image.image_url
    )

    .slice(0, 6);

  // ===================================================
  // ENHANCEMENTS
  // ===================================================
const enhancementCards =

  enhancements.map(

    (item: any, index: number) => ({

      ...item,

      image:

        item.image ||

        galleryImages[
          index % galleryImages.length
        ],

    })

  );
 console.log(
  "ENHANCEMENTS RECEIVED",
  enhancements
);
  // ===================================================
  // INCLUDED EXPERIENCES
  // ===================================================

 const featuredCategory =
  generatedProposal
    ?.featuredExperience
    ?.category;

const featuredId =
  generatedProposal
    ?.featuredExperience
    ?.id;
console.log(
  "SECONDARY EXPERIENCES",
  rankedExperiences
    .filter(
      (e: any) =>
        e.category !== featuredCategory
    )
    .map(
      (e: any) => ({
        id: e.id,
        category: e.category,
      })
    )
);

console.log(
  "RANKED",
  rankedExperiences.map(
    (e: any) => ({
      id: e.id,
      category: e.category,
      score: e.finalScore,
    })
  )
);
const includedExperiences =

  rankedExperiences

    .filter(
      (experience: any) =>
        experience.id !== featuredId
    )

    .filter(
      (experience: any) =>
        experience.category !== featuredCategory
    )

    .slice(0, 3)

    .map((experience: any, index: number) => {

    console.log(
  "IMAGE CHECK",
  {
    id: experience.id,
    title: experience.title,
    featured: experience.featured_image,
    gallery: experience.gallery?.[0]?.image_url,
    final:
      experience.featured_image ||
      experience.gallery?.[0]?.image_url ||
      galleryImages[index]
  }
);
      return {

        id:
          experience.id,

        price:
          experience.base_price || 0,

        image:
  experience.detail_image ||
  experience.hero_image ||
  experience.gallery?.[0]?.image_url ||
  "/images/default.webp",

        title:
          experience.title,

        description:
          experience.short_description ||
          experience.description ||
          "",

        details: [

          experience.operator,

          experience.category
            ?.replaceAll("_", " "),

          `From €${experience.base_price}`,
        ],
      };

    });
  // ===================================================
  // PRICE
  // ===================================================


const finalPrice = 2800;
  // ===================================================
  // RETURN
  // ===================================================

  return {

    galleryImages,

    enhancements:
  enhancementCards,

    includedExperiences,

    finalPrice,
  };
}