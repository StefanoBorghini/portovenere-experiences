import { calculatePrice } from "./calculatePrice";
import { resolveSeasonalPriceOverride } from "./resolveSeasonalPrice";

interface CalculateProposalTotalInput {
  experiences: any[]; // featured + included (oggetti Experience grezzi)
  guests: string;
  children?: string | number;
  // Data di check-in del cliente (lead.start_date). Determina quale
  // fascia di seasonal pricing si applica, quando l'esperienza ce l'ha
  // attiva. Opzionale e retro-compatibile: se omesso, ogni esperienza
  // con seasonal pricing torna semplicemente al calcolo prezzo normale.
  checkInDate?: string | null;
}

export function calculateProposalTotal({
  experiences,
  guests,
  children = 0,
  checkInDate = null,
}: CalculateProposalTotalInput) {

  const guestCount = Number(guests) || 1;
  const childCount = Number(children) || 0;

  const total = experiences.reduce((sum, experience) => {

    if (!experience) {
      return sum;
    }

    // Se seasonal_pricing_enabled e il check-in cade in una fascia,
    // quel prezzo sostituisce interamente il prezzo di questa
    // esperienza per la proposal — bypassa sia pricing_type
    // (fixed/per_person/...) sia i price tiers a scaglioni, perché
    // è un prezzo fisso sostitutivo per quel periodo, non un input
    // che rientra in un altro calcolo.
    const seasonalPrice = resolveSeasonalPriceOverride(
      experience,
      checkInDate
    );

    const price =
      seasonalPrice !== null
        ? seasonalPrice
        : calculatePrice(
            experience.base_price,
            experience.pricing_type,
            guestCount,
            childCount,
            experience.child_discount_percentage ?? 0,
            experience.price_tiers ?? [],
            experience.use_guest_tiers === true
          );

    return sum + price;

  }, 0);

  return Math.round(total);
}