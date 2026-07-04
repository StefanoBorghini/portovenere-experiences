import { buildProposalGallery } from "@/lib/buildProposalGallery";
import { calculateProposalPrice } from "@/lib/pricing";
import { buildProposalExperienceCard } from "../buildProposalExperienceCard";
import { buildProposalSummary } from "./buildProposalSummary";
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
    buildProposalGallery({
      featuredExperience: generatedProposal?.featuredExperience,
      scoredExperiences: generatedProposal?.scoredExperiences,
    });

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

  const finalPrice = 2800;

  // ===================================================
  // RETURN
  // ===================================================
const proposalSummary =
  buildProposalSummary(
    lead,
    generatedProposal
  );
  return {

    galleryImages,

    enhancements:
      enhancementCards,

    includedExperiences,

    finalPrice,

    proposalSummary,

  };

}