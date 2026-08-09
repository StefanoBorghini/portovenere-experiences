import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { calculatePrice } from "./calculatePrice";
import { resolveSeasonalPriceOverride } from "./resolveSeasonalPrice";

// =========================================================
// COMPUTE LEAD PRICING SNAPSHOT
// Dato un elenco di experienceIds/enhancementIds scelti dal
// cliente, ricalcola server-side il prezzo di ciascuno e il
// totale — da chiamare in /api/request-booking e
// /api/confirm-changes, subito prima di scrivere su `leads`,
// e riusata per il dettaglio prezzi mostrato nelle email.
// =========================================================

// price: null quando la riga non ha un prezzo autonomo da
// mostrare (pricing_type "on_request" o "included" — un €0
// letterale sarebbe fuorviante, es. per un enhancement senza
// prezzo determinato il cliente non deve vedere "€0" a fianco).
interface PriceLineItem {
  type: "experience" | "enhancement";
  id: string;
  title: string;
  operator?: string;
  base_price: number;
  pricing_type: string;
  price: number | null;
}

export function priceOrNull(pricingType: string, price: number): number | null {
  if (pricingType === "on_request" || pricingType === "included") {
    return null;
  }
  return Math.round(price);
}

interface ComputeLeadPricingSnapshotInput {
  experienceIds: string[];
  enhancementIds: string[];
  guests: string | number;
  children?: string | number;
  // Determina quale fascia di seasonal pricing si applica (stessa
  // logica di calculateProposalTotal.ts / proposalClient.tsx) —
  // opzionale: se omesso, ogni esperienza con seasonal pricing
  // torna semplicemente al calcolo prezzo normale.
  checkInDate?: string | null;
}

export async function computeLeadPricingSnapshot({
  experienceIds,
  enhancementIds,
  guests,
  children = 0,
  checkInDate = null,
}: ComputeLeadPricingSnapshotInput): Promise<{
  finalPrice: number;
  lineItems: PriceLineItem[];
}> {
  // Client ADMIN (service role), non l'anon pubblico: questa funzione
  // gira solo server-side dentro route gia' autenticate/verificate
  // (request-booking, confirm-changes) — usare l'anon qui rischiava di
  // far sparire silenziosamente esperienze coperte da RLS piu'
  // restrittive di quelle su enhancement_content (un enhancement
  // restava visibile, l'esperienza no, con la stessa chiamata).
  const supabaseAdmin = getSupabaseAdmin();

  const guestCount = Number(guests) || 1;
  const childCount = Number(children) || 0;

  const lineItems: PriceLineItem[] = [];

  // =======================================================
  // EXPERIENCES
  // =======================================================

  if (experienceIds && experienceIds.length > 0) {
    // NB: niente "operator_id" in questa select — quella colonna esiste
    // solo se la migration Stripe Connect (2026_stripe_connect.sql,
    // Fase 2) e' stata eseguita in Supabase. Selezionarla per nome
    // qui, che gira su OGNI calcolo prezzo (booking, email, Concierge
    // Fee), farebbe fallire l'intera query con "column ... does not
    // exist" su chi non l'ha ancora eseguita — stesso identico bug
    // gia' risolto per seasonal_pricing. Il modello Concierge Fee non
    // ne ha comunque bisogno: usa il campo "operator" (testo libero,
    // gia' esistente da prima di Stripe Connect) per il coordinamento.
    const { data: experiences, error: experiencesError } = await supabaseAdmin
      .from("experience_content")
      .select(
        "id, title, operator, base_price, pricing_type, child_discount_percentage, use_guest_tiers, seasonal_pricing_enabled"
      )
      .in("id", experienceIds);

    if (experiencesError) {
      console.error(
        "computeLeadPricingSnapshot: error loading experiences",
        experiencesError
      );
    }

    const { data: tiersRows, error: tiersError } = await supabaseAdmin
      .from("experience_price_tiers")
      .select("experience_id, min_guests, max_guests, price")
      .in("experience_id", experienceIds);

    if (tiersError) {
      console.error(
        "computeLeadPricingSnapshot: error loading price tiers",
        tiersError
      );
    }

    // seasonal_pricing NON e' una colonna di experience_content — e'
    // una tabella collegata a parte (stesso pattern di experience_price_tiers
    // sopra). Selezionarla direttamente nella query sopra come colonna
    // (bug pre-esistente, non introdotto da questa modifica) faceva
    // fallire l'INTERA query con "column ... does not exist", quindi
    // experiences tornava sempre vuoto — da qui le esperienze mancanti
    // nelle email, a prescindere da RLS/anon vs admin.
    const { data: seasonalRows, error: seasonalError } = await supabaseAdmin
      .from("experience_seasonal_pricing")
      .select("experience_id, id, start_date, end_date, price, display_order")
      .in("experience_id", experienceIds);

    if (seasonalError) {
      console.error(
        "computeLeadPricingSnapshot: error loading seasonal pricing",
        seasonalError
      );
    }

    (experiences || []).forEach((experience: any) => {
      const tiersForThisExperience = (tiersRows || []).filter(
        (tier: any) => tier.experience_id === experience.id
      );

      const seasonalPrice = resolveSeasonalPriceOverride(
        {
          ...experience,
          seasonal_pricing: (seasonalRows || []).filter(
            (range: { experience_id: string }) => range.experience_id === experience.id
          ),
        },
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
              tiersForThisExperience,
              experience.use_guest_tiers === true
            );

      lineItems.push({
        type: "experience",
        id: experience.id,
        title: experience.title,
        operator: experience.operator,
        base_price: experience.base_price,
        pricing_type: experience.pricing_type,
        // Un override stagionale e' sempre un prezzo autonomo reale
        // (mai null), a prescindere da pricing_type.
        price: seasonalPrice !== null
          ? Math.round(seasonalPrice)
          : priceOrNull(experience.pricing_type, price),
      });
    });
  }

  // =======================================================
  // ENHANCEMENTS
  // =======================================================

  if (enhancementIds && enhancementIds.length > 0) {
    // Stesso motivo della select sopra: niente "operator_id" per
    // colonna esplicita — non e' garantito che esista, e non serve
    // al modello Concierge Fee.
    const { data: enhancements, error: enhancementsError } = await supabaseAdmin
      .from("enhancement_content")
      .select("id, title, base_price, price_type")
      .in("id", enhancementIds);

    if (enhancementsError) {
      console.error(
        "computeLeadPricingSnapshot: error loading enhancements",
        enhancementsError
      );
    }

    (enhancements || []).forEach((enhancement: any) => {
      const price = calculatePrice(
        enhancement.base_price,
        enhancement.price_type,
        guestCount
      );

      lineItems.push({
        type: "enhancement",
        id: enhancement.id,
        title: enhancement.title,
        base_price: enhancement.base_price,
        pricing_type: enhancement.price_type,
        price: priceOrNull(enhancement.price_type, price),
      });
    });
  }

  const finalPrice = Math.round(
    lineItems.reduce((sum, item) => sum + (item.price ?? 0), 0)
  );

  return { finalPrice, lineItems };
}