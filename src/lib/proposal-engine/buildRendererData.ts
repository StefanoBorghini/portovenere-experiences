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

function pickCompatible(
  pool: any[],
  anchor: any,
  max: number,
  ignoreIncompatibility: boolean = false
) {

  // Viaggio multi-giorno: si puo' fare un'esperienza "incompatibile"
  // in un giorno diverso, quindi prendiamo semplicemente le migliori
  // per punteggio, senza escludere nessuna per incompatibilita'.
  if (ignoreIncompatibility) {
    return pool.slice(0, max);
  }

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
  // MULTI-DAY TRIP CHECK
  // Se start_date e end_date sono giorni diversi, il cliente
  // ha piu' di un giorno a disposizione: le esperienze segnate
  // come incompatibili tra loro (pensate per "non lo stesso
  // giorno") possono comunque comparire insieme nella proposal,
  // pianificate su giorni diversi.
  // ===================================================

  const isMultiDayTrip =
    Boolean(lead?.start_date) &&
    Boolean(lead?.end_date) &&
    lead.start_date !== lead.end_date;

  // ===================================================
  // EXPERIENCES
  // ===================================================

  const rankedExperiences =
    generatedProposal?.scoredExperiences || [];

  const featuredExperience =
    generatedProposal?.featuredExperience;

  // ===================================================
  // INCLUDED EXPERIENCES (compatibili con la featured
  // e compatibili tra loro — a meno che il viaggio non
  // duri piu' di un giorno, vedi sopra)
  // — CALCOLATE PRIMA della gallery, così la gallery
  // può usare esattamente queste esperienze
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
    pickCompatible(candidatePool, featuredExperience, 3, isMultiDayTrip);

  // Se la selezione era di una sola categoria, la sezione
  // "included" sarebbe vuota — usiamo i suggerimenti
  // calcolati in generateProposal, filtrati con la stessa
  // logica di compatibilità

  const usingSuggestedAddOns =
    includedExperiencesRaw.length === 0;

  const finalIncludedExperiencesRaw =
    usingSuggestedAddOns
      ? pickCompatible(generatedProposal?.suggestedAddOns || [], featuredExperience, 3, isMultiDayTrip)
      : includedExperiencesRaw;

  const includedExperiences =
    finalIncludedExperiencesRaw.map(buildProposalExperienceCard);

  // ===================================================
  // GALLERY
  // — ORA usa la featured experience + le esperienze
  // REALMENTE incluse in questa proposal (finalIncludedExperiencesRaw),
  // non più "le prime 4 tra tutte le esperienze scorate".
  // Se non ci sono esperienze incluse (solo suggerimenti
  // non selezionati), la gallery mostra solo la featured.
  // ===================================================

  const galleryImages =
    buildProposalGallery({
      featuredExperience,
      includedExperiences: finalIncludedExperiencesRaw,
    });

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
      children: lead?.children,
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

    isMultiDayTrip,

    finalPrice,

    proposalSummary,

  };

}