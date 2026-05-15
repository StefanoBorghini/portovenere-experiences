interface PricingInput {

  selectedExperiences: {
    basePrice: number;
  }[];

  moodsSelected: string[];

  guests: string;

  travelingWithChildren: boolean;
}

export function calculateProposalPrice({

  selectedExperiences,

  moodsSelected,

  guests,

  travelingWithChildren,

}: PricingInput) {

  let totalPrice = 0;

  // EXPERIENCE PRICING

  selectedExperiences.forEach(
    (experience, index) => {

      // PRIMARY EXPERIENCE

      if (index === 0) {

        totalPrice +=
          experience.basePrice;
      }

      // SECOND EXPERIENCE

      else if (index === 1) {

        totalPrice +=
          experience.basePrice * 0.4;
      }

      // THIRD EXPERIENCE

      else if (index === 2) {

        totalPrice +=
          experience.basePrice * 0.25;
      }
    }
  );

  // MOOD PRICING

  const moodPricing: Record<
    string,
    number
  > = {

    Romantic: 400,

    Cinematic: 700,

    Authentic: 300,

    Relaxed: 200,

    Adventure: 500,
  };

  moodsSelected.forEach(
    (mood) => {

      totalPrice +=
        moodPricing[mood] || 0;
    }
  );

  // GUEST MULTIPLIER

  const guestMultiplier: Record<
    string,
    number
  > = {

    "2-5": 1,

    "6-10": 1.4,

    "11+": 1.8,
  };

  totalPrice =
    totalPrice *
    (guestMultiplier[guests] || 1);

  // CHILDREN UPGRADE

  if (
    travelingWithChildren
  ) {

    totalPrice += 500;
  }

  return Math.round(
    totalPrice
  );
}