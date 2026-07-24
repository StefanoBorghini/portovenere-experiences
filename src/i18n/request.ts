/**
 * next-intl request config — NO locale-prefixed routing.
 * Same URL for every visitor; the locale comes from getCurrentLocale()
 * (cookie -> Accept-Language fallback), not from the path.
 *
 * I messaggi arrivano da Supabase (site_copy / site_copy_translations),
 * tradotti da Lara — non da file JSON committati. src/messages/*.json
 * restano nel repo solo come seed storico per src/scripts/seed-site-copy.mjs,
 * non sono piu' letti a runtime. Vedi src/lib/translations/siteCopy.ts.
 */

import { getRequestConfig } from "next-intl/server";
import { getCurrentLocale } from "./locale";
import { getSiteCopyMessages } from "@/lib/translations/siteCopy";

export default getRequestConfig(async () => {
  const locale = await getCurrentLocale();

  return {
    locale,
    messages: await getSiteCopyMessages(locale),
  };
});