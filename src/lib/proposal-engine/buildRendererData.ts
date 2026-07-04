import { buildProposalGallery } from "@/lib/buildProposalGallery";
import { calculateProposalTotal } from "@/lib/pricing/calculateProposalTotal";
import { buildProposalExperienceCard } from "../buildProposalExperienceCard";
import { buildProposalSummary } from "./buildProposalSummary";
// =====================================================
// COMPATIBILITY HELPERS
// =====================================================

function isIncompatible(a: any, b: any) {

  if (!a || !b) return false;

  const aList = a.incompatible_experiences ?? [];
  const bList = b.incompatible_experiences ?? [];

  return (
    aList.includes(b.id) ||
    bList.includes(a.id)
  );
}

function pickCompatible(pool: any[], anchor: any, max: number) {

  const chosen: any[] = [];

  for (const candidate of pool) {

    if (chosen.length >= max) break;

    if (isIncompatible(anchor, candidate)) continue;

    if (chosen.some((picked) => isIncompatible(picked, candidate))) continue;

    chosen.push(candidate);
  }

  return chosen;
}

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

  const featuredExperience =
    generatedProposal?.featuredExperience;

  // ===================================================
  // GALLERY
  // ===================================================

  const galleryImages =
    buildProposalGallery({
      featuredExperience: generatedProposal?.featuredExperience,
      scoredExperiences: generatedProposal?.scoredExperiences,
    });

  // ===================================================
  // INCLUDED EXPERIENCES (compatibili con la featured
  // e compatibili tra loro)
  // ===================================================

  const featuredCategory =
    featuredExperience?.category;

  const featuredId =
    featuredExperience?.id;

  const candidatePool =
    rankedExperiences

      .filter(
        (experience: any) =>
          experience.id !== featuredId
      )

      .filter(
        (experience: any) =>
          experience.category !== featuredCategory
      );

  const includedExperiencesRaw =
    pickCompatible(candidatePool, featuredExperience, 3);

  // Se la selezione era di una sola categoria, la sezione
  // "included" sarebbe vuota — usiamo i suggerimenti
  // calcolati in generateProposal, filtrati con la stessa
  // logica di compatibilità

  const usingSuggestedAddOns =
    includedExperiencesRaw.length === 0;

  const finalIncludedExperiencesRaw =
    usingSuggestedAddOns
      ? pickCompatible(generatedProposal?.suggestedAddOns || [], featuredExperience, 3)
      : includedExperiencesRaw;

  const includedExperiences =
    finalIncludedExperiencesRaw.map(buildProposalExperienceCard);

  // ===================================================
  // ENHANCEMENTS (filtro quelli incompatibili con la
  // featured o con una qualsiasi delle experience incluse)
  // ===================================================

  const relevantExperiences = [
    featuredExperience,
    ...finalIncludedExperiencesRaw,
  ].filter(Boolean);

  const incompatibleEnhancementIds = new Set<string>();

  relevantExperiences.forEach((experience: any) => {

    (experience.incompatible_enhancements ?? []).forEach(
      (id: any) => incompatibleEnhancementIds.add(String(id))
    );
  });

  const enhancementCards =
    enhancements
      .filter(
        (item: any) => item.active
      )
      .filter(
        (item: any) => !incompatibleEnhancementIds.has(String(item.id))
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
  // PRICE
  // ===================================================

  const finalPrice =
    calculateProposalTotal({
      experiences: [
        featuredExperience,
        ...(usingSuggestedAddOns ? [] : finalIncludedExperiencesRaw),
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