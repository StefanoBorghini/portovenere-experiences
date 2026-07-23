/**
 * next-intl request config — NO locale-prefixed routing.
 * Same URL for every visitor; the locale comes from getCurrentLocale()
 * (cookie -> Accept-Language fallback), not from the path.
 */

import { getRequestConfig } from "next-intl/server";
import { getCurrentLocale } from "./locale";

export default getRequestConfig(async () => {
  const locale = await getCurrentLocale();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});