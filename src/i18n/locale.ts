/**
 * Locale detection — single source of truth
 * =====================================================================
 * Used by BOTH:
 *  - next-intl (static UI text: buttons, labels, wizard steps)
 *  - the Lara-translated CMS content lookups (experience_content_translations)
 *
 * Keeping this in one small file means the whole site — static copy
 * AND database content — always agrees on which language to show.
 * =====================================================================
 */

import { cookies, headers } from "next/headers";

export const SUPPORTED_LOCALES = ["en", "it"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE_NAME = "locale";

/**
 * Parses an Accept-Language header (e.g. "it-IT,it;q=0.9,en;q=0.8")
 * and returns the first supported locale found, or the default.
 */
export function detectLocaleFromHeader(
  acceptLanguage: string | null | undefined
): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  // "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7" -> ["it-IT", "it", "en-US", "en"]
  const candidates = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().split("-")[0].toLowerCase());

  const match = candidates.find((c) =>
    SUPPORTED_LOCALES.includes(c as Locale)
  );

  return (match as Locale) ?? DEFAULT_LOCALE;
}

/**
 * Server-only helper: resolves the current locale the same way for
 * every server-side data fetch (RSC, route handlers, server actions).
 * Cookie wins if present (explicit choice or already-detected value);
 * otherwise falls back to the browser's Accept-Language header.
 */
export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  const headerList = await headers();
  return detectLocaleFromHeader(headerList.get("accept-language"));
}