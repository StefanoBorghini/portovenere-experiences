/**
 * next-intl request config — NO locale-prefixed routing.
 * Same URL for every visitor; the locale comes from getCurrentLocale()
 * (cookie -> Accept-Language fallback), not from the path.
 *
 * Import statici invece di import(`../messages/${locale}.json`):
 * Turbopack non riesce a risolvere il pattern dinamico con template
 * string. Con soli due locale, un semplice switch e' piu' robusto —
 * aggiungere una lingua richiede solo una riga in piu' qui.
 */

import { getRequestConfig } from "next-intl/server";
import { getCurrentLocale } from "./locale";
import enMessages from "../messages/en.json";
import itMessages from "../messages/it.json";

const MESSAGES = {
  en: enMessages,
  it: itMessages,
} as const;

export default getRequestConfig(async () => {
  const locale = await getCurrentLocale();

  return {
    locale,
    messages: MESSAGES[locale] ?? MESSAGES.en,
  };
});