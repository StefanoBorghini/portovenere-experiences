/**
 * Locale — costanti e tipi condivisi (client-safe)
 * =====================================================================
 * NESSUN import di "next/headers" qui dentro — questo file puo' essere
 * importato sia da Server Component che da Client Component ("use
 * client"). La logica che dipende da next/headers (getCurrentLocale)
 * vive separata in locale.ts, che e' server-only.
 * =====================================================================
 */

export const SUPPORTED_LOCALES = ["en", "it", "fr", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE_NAME = "locale";

/**
 * Parses an Accept-Language header (e.g. "it-IT,it;q=0.9,en;q=0.8") and
 * returns the locale to use, based ONLY on the browser's primary/top
 * language preference — not the default.
 *
 * Guarda solo il primo tag (la lingua PRINCIPALE del browser), non
 * l'intera lista: Chrome/Android aggiungono spesso la lingua della
 * regione del dispositivo come voce a priorita' piu' bassa (es. un
 * telefono con regione Italia ma lingua del browser impostata su
 * francese puo' comunque mandare "fr-FR,fr;q=0.9,it-IT;q=0.8,it;q=0.7,
 * en;q=0.6") — scorrere l'intera lista finirebbe per matchare quell'
 * "it" di rumore invece di ricadere sull'inglese come richiesto quando
 * la lingua PRINCIPALE del browser non e' supportata.
 */
export function detectLocaleFromHeader(
  acceptLanguage: string | null | undefined
): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const primaryLanguage = acceptLanguage
    .split(",")[0]
    .split(";")[0]
    .trim()
    .split("-")[0]
    .toLowerCase();

  return (SUPPORTED_LOCALES as readonly string[]).includes(primaryLanguage)
    ? (primaryLanguage as Locale)
    : DEFAULT_LOCALE;
}