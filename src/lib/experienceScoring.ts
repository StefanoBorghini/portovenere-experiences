import {
  Experience,
} from "./experiences";

// =====================================================
// ENERGY SCORE
// =====================================================

export function calculateEnergyCompatibility(

  experienceA: Experience,

  experienceB: Experience
) {

  let score = 0;

  Object.entries(
    experienceA.energyScores
  ).forEach(
    ([key, value]) => {

      const secondValue =

        experienceB.energyScores[
          key as keyof typeof experienceB.energyScores
        ] || 0;

      score +=
        value * secondValue;
    }
  );

  return score;
}

// =====================================================
// VISUAL SCORE
// =====================================================

export function calculateVisualCompatibility(

  experienceA: Experience,

  experienceB: Experience
) {

  let score = 0;

  Object.entries(
    experienceA.visualStyleScores
  ).forEach(
    ([key, value]) => {

      const secondValue =

        experienceB.visualStyleScores[
          key as keyof typeof experienceB.visualStyleScores
        ] || 0;

      score +=
        value * secondValue;
    }
  );

  return score;
}

// =====================================================
// TOTAL SCORE
// =====================================================

export function calculateTotalCompatibility(

  experienceA: Experience,

  experienceB: Experience
) {

  const energyScore =

    calculateEnergyCompatibility(
      experienceA,
      experienceB
    );

  const visualScore =

    calculateVisualCompatibility(
      experienceA,
      experienceB
    );

  const narrativeScore =

    experienceB.narrativePriority;

  return (

    energyScore +
    visualScore +
    narrativeScore
  );
}