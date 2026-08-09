
// =====================================================
// galleryHelpers.ts
// =====================================================

import { experiences }
from "@/lib/experiences";

// =====================================================
// GET EXPERIENCE
// =====================================================

export function getExperienceById(
  id: string
) {

  return experiences.find(
    (exp) => exp.id === id
  );
}

// =====================================================
// REMOVE DUPLICATES
// =====================================================

export function removeDuplicates(
  array: string[]
) {

  return [...new Set(array)];
}

// =====================================================
// HAS CONFLICT
// =====================================================

export function hasConflict(

  experienceA: any,

  experienceB: any,

  conflicts:
    Record<string, string[]>
) {

  const firstConflicts =

    conflicts[
      experienceA.id
    ] || [];

  const secondConflicts =

    conflicts[
      experienceB.id
    ] || [];

  return (

    firstConflicts.includes(
      experienceB.id
    ) ||

    secondConflicts.includes(
      experienceA.id
    )
  );
}

// =====================================================
// CLEAN CONFLICTS
// =====================================================

export function cleanConflicts(

  ids: string[],

  conflicts:
    Record<string, string[]>
) {

  const cleaned: string[] = [];

  ids.forEach((id) => {

    const currentConflicts =
      conflicts[id] || [];

    const hasAnyConflict =

      cleaned.some(
        (existing) =>

          currentConflicts.includes(
            existing
          )
      );

    if (!hasAnyConflict) {

      cleaned.push(id);
    }
  });

  return cleaned;
}

