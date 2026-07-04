import { calculatePrice } from "./calculatePrice";

interface CalculateProposalTotalInput {
  experiences: any[]; // featured + included (oggetti Experience grezzi)
  guests: string;
}

export function calculateProposalTotal({
  experiences,
  guests,
}: CalculateProposalTotalInput) {

  const guestCount = Number(guests) || 1;

  const total = experiences.reduce((sum, experience) => {

    if (!experience) {
      return sum;
    }

    const price = calculatePrice(
      experience.base_price,
      experience.pricing_type,
      guestCount
    );

    return sum + price;

  }, 0);

  return Math.round(total);
}