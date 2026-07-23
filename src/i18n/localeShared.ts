/**
 * Locale — costanti e tipi condivisi (client-safe)
 * =====================================================================
 * NESSUN import di "next/headers" qui dentro — questo file puo' essere
 * importato sia da Server Component che da Client Component ("use
 * client"). La logica che dipende da next/headers (getCurrentLocale)
 * vive separata in locale.ts, che e' server-only.
 * =====================================================================
 */

export const SUPPORTED_LOCALES = ["en", "it"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE_NAME = "locale";

/**
 * Parses an Accept-Language header (e.g. "it-IT,it;q=0.9,en;q=0.8")
 * and returns the first supported locale found, or the default.
 * Pura funzione, nessuna dipendenza da next/headers — condivisibile.
 */
export function detectLocaleFromHeader(
  acceptLanguage: string | null | undefined
): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const candidates = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().split("-")[0].toLowerCase());

  const match = candidates.find((c) =>
    SUPPORTED_LOCALES.includes(c as Locale)
  );

  return (match as Locale) ?? DEFAULT_LOCALE;
}