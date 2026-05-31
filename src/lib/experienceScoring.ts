
// =====================================================
// experienceScoring.ts
// CLEAN ENGINE VERSION
// =====================================================

import {
  Experience,
} from "./experiences";

// =====================================================
// GENERIC SCORE CALCULATOR
// =====================================================

function calculateAttributeCompatibility(

  firstObject:
    Record<string, number>,

  secondObject:
    Record<string, number>
) {

  let score = 0;

  Object.entries(
    firstObject
  ).forEach(
    ([key, value]) => {

      const secondValue =

        secondObject[key] || 0;

      score +=
        value * secondValue;
    }
  );

  return score;
}

// =====================================================
// ENERGY SCORE
// =====================================================

export function calculateEnergyCompatibility(

  experienceA: Experience,

  experienceB: Experience
) {

  return calculateAttributeCompatibility(

    experienceA.energyScores,

    experienceB.energyScores
  );
}

// =====================================================
// VISUAL SCORE
// =====================================================

export function calculateVisualCompatibility(

  experienceA: Experience,

  experienceB: Experience
) {

  return calculateAttributeCompatibility(

    experienceA.visualStyleScores,

    experienceB.visualStyleScores
  );
}

// =====================================================
// MOOD SCORE
// =====================================================

export function calculateMoodCompatibility(

  experienceA: Experience,

  experienceB: Experience
) {

  if (
    !experienceA.moods ||
    !experienceB.moods
  ) {

    return 0;
  }

  let score = 0;

  experienceA.moods.forEach(
    (mood) => {

      if (
        experienceB.moods?.includes(
          mood
        )
      ) {

        score += 40;
      }
    }
  );

  return score;
}

// =====================================================
// CATEGORY SCORE
// =====================================================

export function calculateCategoryCompatibility(

  experienceA: Experience,

  experienceB: Experience
) {

  if (

    experienceA.macroCategory ===

    experienceB.macroCategory

  ) {

    return -40;
  }

  return 20;
}

// =====================================================
// NARRATIVE SCORE
// =====================================================

export function calculateNarrativeCompatibility(

  experience: Experience
) {

  return (

    experience.narrativePriority || 0
  );
}

// =====================================================
// TOTAL SCORE
// =====================================================

export function calculateTotalCompatibility(

  experienceA: Experience,

  experienceB: Experience
) {

  // ===================================================
  // ENERGY
  // ===================================================

  const energyScore =

    calculateEnergyCompatibility(

      experienceA,

      experienceB
    );

  // ===================================================
  // VISUAL
  // ===================================================

  const visualScore =

    calculateVisualCompatibility(

      experienceA,

      experienceB
    );

  // ===================================================
  // MOOD
  // ===================================================

  const moodScore =

    calculateMoodCompatibility(

      experienceA,

      experienceB
    );

  // ===================================================
  // CATEGORY
  // ===================================================

  const categoryScore =

    calculateCategoryCompatibility(

      experienceA,

      experienceB
    );

  // ===================================================
  // NARRATIVE
  // ===================================================

  const narrativeScore =

    calculateNarrativeCompatibility(

      experienceB
    );

  // ===================================================
  // FINAL SCORE
  // ===================================================

  return (

    energyScore +

    visualScore +

    moodScore +

    categoryScore +

    narrativeScore
  );
}

