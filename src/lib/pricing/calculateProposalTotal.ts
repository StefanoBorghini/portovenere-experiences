import { calculatePrice } from "./calculatePrice";

interface CalculateProposalTotalInput {
  experiences: any[]; // featured + included (oggetti Experience grezzi)
  guests: string;
  children?: string | number;
}

export function calculateProposalTotal({
  experiences,
  guests,
  children = 0,
}: CalculateProposalTotalInput) {

  const guestCount = Number(guests) || 1;
  const childCount = Number(children) || 0;

  const total = experiences.reduce((sum, experience) => {

    if (!experience) {
      return sum;
    }

    const price = calculatePrice(
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