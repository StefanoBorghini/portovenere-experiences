// =========================================================
// SEASONAL PRICING RESOLVER
//
// Alcune esperienze hanno un prezzo diverso a seconda del periodo
// (es. giugno/luglio/agosto). Se l'esperienza ha
// seasonal_pricing_enabled=true e almeno una fascia di date che
// include la data di CHECK-IN del cliente (lead.start_date), quella
// fascia SOSTITUISCE interamente il prezzo finale dell'esperienza
// per quella proposal — non solo base_price, ma il prezzo che
// sarebbe stato calcolato da calculatePrice() in qualunque modo
// (fixed, per_person, oppure tier a scaglioni con use_guest_tiers).
// Questo perché un "prezzo fisso sostitutivo per quella fascia" è,
// per definizione, il prezzo che il cliente paga in quel periodo,
// non un input che rientra in un altro calcolo.
//
// Risoluzione delle sovrapposizioni: se il check-in cade in più
// fasce contemporaneamente, vince quella con display_order più
// basso (la prima nell'ordine impostato in CMS). Se nessuna fascia
// copre il check-in (o seasonal_pricing_enabled è false), la
// funzione ritorna null e il chiamante deve usare il calcolo
// prezzo normale (calculatePrice con base_price/pricing_type/tiers).
//
// Questa funzione è pura e non tocca Supabase: prende in input
// l'oggetto experience già completo (con .seasonal_pricing popolato
// da getFullExperiences) e la data di check-in del lead.
// =========================================================

interface SeasonalPricingRange {
  id: string;
  start_date: string;
  end_date: string;
  price: number | string;
  display_order?: number;
}

export function resolveSeasonalPriceOverride(
  experience: any,
  checkInDate?: string | null
): number | null {

  if (!experience?.seasonal_pricing_enabled) {
    return null;
  }

  const ranges: SeasonalPricingRange[] = experience?.seasonal_pricing;

  if (!Array.isArray(ranges) || ranges.length === 0) {
    return null;
  }

  if (!checkInDate) {
    // Nessuna data di check-in nota (non dovrebbe succedere su una
    // proposal reale, ma per sicurezza torniamo al prezzo normale
    // piuttosto che applicare una fascia a caso).
    return null;
  }

  const checkIn = new Date(checkInDate).getTime();

  if (Number.isNaN(checkIn)) {
    return null;
  }

  const sortedRanges = [...ranges].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  const matchingRange = sortedRanges.find((range) => {

    const start = new Date(range.start_date).getTime();
    const end = new Date(range.end_date).getTime();

    if (Number.isNaN(start) || Number.isNaN(end)) return false;

    return checkIn >= start && checkIn <= end;
  });

  return matchingRange ? Number(matchingRange.price) : null;
}