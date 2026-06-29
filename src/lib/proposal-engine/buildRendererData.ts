import { buildProposalGallery } from "@/lib/buildProposalGallery";
import { calculateProposalPrice } from "@/lib/pricing";
import { buildProposalExperienceCard } from "../buildProposalExperienceCard";

// =====================================================
// BUILD RENDERER DATA
// =====================================================

export function buildRendererData({
  generatedProposal,
  lead,
  enhancements,
}: any) {

  // ===================================================
  // EXPERIENCES
  // ===================================================

  const rankedExperiences =
    generatedProposal?.scoredExperiences || [];

  // ===================================================
  // GALLERY
  // ===================================================

  const galleryImages =
    buildProposalGallery(generatedProposal);

  // ===================================================
  // ENHANCEMENTS
  // ===================================================

  const enhancementCards =
    enhancements
      .filter(
        (item: any) => item.active
      )
      .map(
        (item: any, index: number) => ({

          ...item,

          image:
            item.image ||
            galleryImages[
              index % galleryImages.length
            ],

        })
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

      .map(buildProposalExperienceCard);

  // ===================================================
  // PRICE
  // ===================================================

  // TODO:
  // sostituire con il Pricing Engine centralizzato

  const finalPrice = 2800;

  // Esempio futuro:
  //
  // const finalPrice =
  //   calculateProposalPrice({
  //     proposal: generatedProposal,
  //     enhancements,
  //     guests: lead?.guests
  //   });

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