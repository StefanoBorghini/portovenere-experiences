import { getBookableExperiences } from "@/lib/supabase/experienceRepository";
import { generateProposal } from "@/lib/generateProposal";
import { calculatePrice } from "@/lib/pricing/calculatePrice";
import { resolveSeasonalPriceOverride } from "@/lib/pricing/resolveSeasonalPrice";
import { priceOrNull } from "@/lib/pricing/computeLeadPricingSnapshot";

interface LeadForProposal {
  experiences?: string[];
  moods?: string[];
  budget?: string;
  guests?: string | number;
  children?: string | number;
  traveling_with_children?: boolean;
  start_date?: string | null;
  end_date?: string | null;
}

// =====================================================================
// Estrae SOLO la featured experience che generateProposal() calcolerebbe
// per un lead — stesso identico matching usato da buildRendererData()
// per decidere cosa mostrare come esperienza principale sulla proposal
// page. Fattorizzato qui perche' serve in piu' punti (route di notifica
// email, route di traduzione) che altrimenti duplicherebbero lo stesso
// blocco di matching.
//
// Locale "en" qui non conta ai fini del matching (i campi usati —
// budget_*, guest_*, ecc. — non sono localizzati), serve solo a
// ottenere titolo/prezzo/operator in inglese per le email transazionali
// (mai tradotte, stesso trattamento di tutti gli altri template email).
// =====================================================================

async function getGeneratedProposalForLead(lead: LeadForProposal) {

  const tripDays =
    lead.start_date && lead.end_date
      ? Math.max(
          1,
          Math.round(
            (new Date(lead.end_date).getTime() -
              new Date(lead.start_date).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        )
      : undefined;

  const allExperiences = await getBookableExperiences("en");

  return generateProposal({
    experiencesSelected: lead.experiences || [],
    moodsSelected: lead.moods || [],
    budget: lead.budget || "",
    guests: String(lead.guests ?? ""),
    children: lead.children,
    travelingWithChildren: lead.traveling_with_children || false,
    tripDays,
    startDate: lead.start_date,
    endDate: lead.end_date,
    allExperiences,
  });
}

export async function getFeaturedExperienceForLead(lead: LeadForProposal) {
  const generatedProposal = await getGeneratedProposalForLead(lead);
  return generatedProposal?.featuredExperience || null;
}

// =====================================================================
// Come sopra, ma ritorna direttamente titolo+prezzo pronti per una
// email — usata sia dalla notifica "proposta generata" sia dal
// reminder automatico per chi non ha ancora cliccato "Prenota ora"
// (in entrambi i casi confirmed_selection non esiste ancora, quindi
// l'unica "selezione" reale e' la featured experience calcolata da
// generateProposal, la stessa che il cliente vede aprendo la pagina).
// =====================================================================

export async function getFeaturedExperienceLineItemForLead(
  lead: LeadForProposal
): Promise<{ title: string; price: number | null } | null> {

  const featuredExperience = await getFeaturedExperienceForLead(lead);

  if (!featuredExperience) return null;

  const seasonalPrice = resolveSeasonalPriceOverride(
    featuredExperience,
    lead.start_date
  );

  const price =
    seasonalPrice !== null
      ? Math.round(seasonalPrice)
      : priceOrNull(
          featuredExperience.pricing_type,
          calculatePrice(
            featuredExperience.base_price,
            featuredExperience.pricing_type,
            Number(lead.guests) || 1,
            Number(lead.children) || 0,
            featuredExperience.child_discount_percentage ?? 0,
            featuredExperience.price_tiers ?? [],
            featuredExperience.use_guest_tiers === true
          )
        );

  return { title: featuredExperience.title, price };
}
