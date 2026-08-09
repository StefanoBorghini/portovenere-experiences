/**
 * Frontend fallback helper
 * =====================================================================
 * Pure, no network/DB calls — just picks the right string. The page
 * fetches both the English row and the translation row (if any) once,
 * server-side, and this function decides what to render.
 *
 * Rule: show the translation if it exists AND its last run succeeded
 * AND the field isn't empty. Otherwise fall back to English. Never
 * show a stale/failed translation.
 * =====================================================================
 */

export interface TranslationRow {
  translation_status: "pending" | "ok" | "failed";
  [field: string]: unknown;
}

export function getLocalizedField<T extends Record<string, unknown>>(
  english: T,
  translation: TranslationRow | null | undefined,
  field: keyof T
): T[keyof T] {
  if (translation?.translation_status === "ok") {
    const value = translation[field as string];
    if (typeof value === "string" && value.trim().length > 0) {
      return value as T[keyof T];
    }
  }
  return english[field];
}

/**
 * Convenience wrapper for the common case: localize every field of an
 * experience-like object in one call, given its EN row + translation row.
 */
export function getLocalizedExperience<T extends Record<string, unknown>>(
  english: T,
  translation: TranslationRow | null | undefined,
  fields: (keyof T)[]
): T {
  const result = { ...english };
  for (const field of fields) {
    result[field] = getLocalizedField(english, translation, field);
  }
  return result;
}