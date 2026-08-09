/**
 * Locale detection — SERVER ONLY (usa next/headers)
 * =====================================================================
 * Non importare questo file da un Client Component — usa invece
 * localeShared.ts per i tipi/costanti condivisibili (SUPPORTED_LOCALES,
 * Locale, DEFAULT_LOCALE, LOCALE_COOKIE_NAME, detectLocaleFromHeader).
 *
 * Usato da: i18n/request.ts (next-intl) e dalla Lara-translated CMS
 * content lookup, sempre in contesto server (RSC, route handler).
 * =====================================================================
 */

import { cookies, headers } from "next/headers";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  detectLocaleFromHeader,
  type Locale,
} from "./localeShared";

export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  detectLocaleFromHeader,
  type Locale,
};

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