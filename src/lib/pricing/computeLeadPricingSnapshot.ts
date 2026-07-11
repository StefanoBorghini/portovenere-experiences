import { supabase } from "@/lib/supabase";
import { calculatePrice } from "./calculatePrice";

// =========================================================
// COMPUTE LEAD PRICING SNAPSHOT
// Dato un elenco di experienceIds/enhancementIds scelti dal
// cliente, ricalcola server-side il prezzo di ciascuno e il
// totale — da chiamare in /api/request-booking e
// /api/confirm-changes, subito prima di scrivere su `leads`.
// =========================================================

interface PriceLineItem {
  type: "experience" | "enhancement";
  id: string;
  title: string;
  operator?: string;
  base_price: number;
  pricing_type: string;
  price: number;
}

interface ComputeLeadPricingSnapshotInput {
  experienceIds: string[];
  enhancementIds: string[];
  guests: string | number;
  children?: string | number;
}

export async function computeLeadPricingSnapshot({
  experienceIds,
  enhancementIds,
  guests,
  children = 0,
}: ComputeLeadPricingSnapshotInput): Promise<{
  finalPrice: number;
  lineItems: PriceLineItem[];
}> {
  if (!supabase) {
    return { finalPrice: 0, lineItems: [] };
  }

  const guestCount = Number(guests) || 1;
  const childCount = Number(children) || 0;

  const lineItems: PriceLineItem[] = [];

  // =======================================================
  // EXPERIENCES
  // =======================================================

  if (experienceIds && experienceIds.length > 0) {
    const { data: experiences, error: experiencesError } = await supabase
      .from("experience_content")
      .select(
        "id, title, operator, base_price, pricing_type, child_discount_percentage, use_guest_tiers"
      )
      .in("id", experienceIds);

    if (experiencesError) {
      console.error(
        "computeLeadPricingSnapshot: error loading experiences",
        experiencesError
      );
    }

    const { data: tiersRows, error: tiersError } = await supabase
      .from("experience_price_tiers")
      .select("experience_id, min_guests, max_guests, price")
      .in("experience_id", experienceIds);

    if (tiersError) {
      console.error(
        "computeLeadPricingSnapshot: error loading price tiers",
        tiersError
      );
    }

    (experiences || []).forEach((experience: any) => {
      const tiersForThisExperience = (tiersRows || []).filter(
        (tier: any) => tier.experience_id === experience.id
      );

      const price = calculatePrice(
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
        price: Math.round(price),
      });
    });
  }

  // =======================================================
  // ENHANCEMENTS
  // =======================================================

  if (enhancementIds && enhancementIds.length > 0) {
    const { data: enhancements, error: enhancementsError } = await supabase
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
        price: Math.round(price),
      });
    });
  }

  const finalPrice = Math.round(
    lineItems.reduce((sum, item) => sum + item.price, 0)
  );

  return { finalPrice, lineItems };
}