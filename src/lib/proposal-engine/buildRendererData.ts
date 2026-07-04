import { buildProposalGallery } from "@/lib/buildProposalGallery";
import { calculateProposalTotal } from "@/lib/pricing/calculateProposalTotal";
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

  const includedExperiencesRaw =
    rankedExperiences

      .filter(
        (experience: any) =>
          experience.id !== featuredId
      )

      .filter(
        (experience: any) =>
          experience.category !== featuredCategory
      )

      .slice(0, 3);

  // Se la selezione era di una sola categoria, la sezione
  // "included" sarebbe vuota — usiamo i suggerimenti
  // calcolati in generateProposal (categorie diverse,
  // non pre-selezionati, sono "da aggiungere")

  const usingSuggestedAddOns =
    includedExperiencesRaw.length === 0;

  const finalIncludedExperiencesRaw =
    usingSuggestedAddOns
      ? (generatedProposal?.suggestedAddOns || [])
      : includedExperiencesRaw;

  const includedExperiences =
    finalIncludedExperiencesRaw.map(buildProposalExperienceCard);

  // ===================================================
  // PRICE
  // ===================================================

  const finalPrice =
    calculateProposalTotal({
      experiences: [
        generatedProposal?.featuredExperience,
        // I suggerimenti non sono pre-inclusi, quindi
        // non pesano sul prezzo di partenza
        ...(usingSuggestedAddOns ? [] : includedExperiencesRaw),
      ],
      guests: lead?.guests,
    });

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

    includedExperiencesPreSelected:
      !usingSuggestedAddOns,

    finalPrice,

    proposalSummary,

  };

}