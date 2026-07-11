// =========================================================
// PRICE TIER TYPE — una fascia di ospiti con il suo prezzo
// =========================================================

export interface PriceTier {
  min_guests: number;
  max_guests: number;
  price: number;
}

export function calculatePrice(

    basePrice = 0,

    priceType = "fixed",

    guests = 1,

    children = 0,

    childDiscountPercentage = 0,

    // Nuovi parametri, entrambi opzionali: le chiamate esistenti
    // che non li passano continuano a funzionare esattamente come
    // prima, priceType si comporta come sempre.
    tiers: PriceTier[] = [],

    // OVERRIDE ESPLICITO — se true, ignora priceType e usa SOLO
    // gli scaglioni. pricing_type resta quindi libero di restare
    // "fixed" (o qualsiasi altro valore) senza che questo cambi
    // nulla per nessun altro punto del codice che legge priceType.
    useGuestTiers = false,

) {

    // =====================================================
    // OVERRIDE — controllato PRIMA dello switch su priceType,
    // cosi' priceType stesso non deve mai valere "tiered_by_guests"
    // o simili: resta uno dei 4 valori di sempre.
    // =====================================================

    if (useGuestTiers) {

        const totalGuests = guests + children;

        const matchingTier = tiers.find(
            (tier) =>
                totalGuests >= tier.min_guests &&
                totalGuests <= tier.max_guests
        );

        if (matchingTier) {
            return matchingTier.price;
        }

        // Nessuna fascia configurata copre questo numero di ospiti.
        // Fallback: prezzo della fascia più alta configurata invece
        // di mostrare €0. Se non c'è NESSUNA fascia, cade su basePrice.
        const highestTier = [...tiers].sort(
            (a, b) => b.max_guests - a.max_guests
        )[0];

        return highestTier ? highestTier.price : basePrice;
    }

    // =====================================================
    // COMPORTAMENTO INVARIATO — identico a prima dell'aggiunta
    // dei tier, priceType non ha mai un quinto valore possibile.
    // =====================================================

    switch (priceType) {

        case "fixed":

            return basePrice;

        case "per_person": {

            const adultsTotal =
                basePrice * guests;

            const childPrice =
                basePrice * (1 - childDiscountPercentage / 100);

            const childrenTotal =
                childPrice * children;

            return adultsTotal + childrenTotal;
        }

        case "included":

            return 0;

        case "on_request":

            return 0;

        default:

            return basePrice;

    }

}