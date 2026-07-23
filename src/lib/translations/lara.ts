/**
 * Lara Translate — core service
 * =====================================================================
 * Centralizes ALL communication with the Lara Translate API
 * (https://developers.laratranslate.com). Nothing else in the codebase
 * should import "@translated/lara" directly — go through the helpers
 * exported here instead, so auth, tone, and error handling stay in one
 * place and are easy to extend to new languages.
 *
 * Auth model: Lara does NOT use a single API key. It uses an access
 * key PAIR (LARA_ACCESS_KEY_ID + LARA_ACCESS_KEY_SECRET), generated at
 * https://app.laratranslate.com/account/credentials. The SDK signs and
 * encrypts requests with this pair — never call the API without it.
 *
 * Install: npm install @translated/lara
 * =====================================================================
 */

import { Credentials, Translator } from "@translated/lara";

const ACCESS_KEY_ID = process.env.LARA_ACCESS_KEY_ID;
const ACCESS_KEY_SECRET = process.env.LARA_ACCESS_KEY_SECRET;

// Lara's own docs recommend instantiating the Translator once and
// reusing it, rather than creating a new instance per call.
let laraInstance: Translator | null = null;

function getLara(): Translator {
  if (!ACCESS_KEY_ID || !ACCESS_KEY_SECRET) {
    throw new Error(
      "Lara Translate is not configured: LARA_ACCESS_KEY_ID / LARA_ACCESS_KEY_SECRET missing from env."
    );
  }

  if (!laraInstance) {
    const credentials = new Credentials(ACCESS_KEY_ID, ACCESS_KEY_SECRET);
    laraInstance = new Translator(credentials);
  }

  return laraInstance;
}

// ---------------------------------------------------------------------
// Supported target locales. English is always the source and is never
// listed here. Adding a language later = adding one string to this
// array + one row to LOCALE_TO_LARA below. No other code changes.
// ---------------------------------------------------------------------
export const SUPPORTED_TARGET_LOCALES = ["it"] as const;
// Future: ["it", "fr", "de", "es"] as const;

export type TargetLocale = (typeof SUPPORTED_TARGET_LOCALES)[number];

// Our DB uses short codes ("it"), Lara wants full locale codes
// ("it-IT"). Single mapping point — extend here when adding a language.
const LOCALE_TO_LARA: Record<string, string> = {
  en: "en-US",
  it: "it-IT",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
};

// Applied to every call so tone stays consistent across the whole
// site without repeating it at every call site. Tune here only.
const BRAND_INSTRUCTIONS = [
  "This is marketing copy for a luxury travel experience platform on the Italian Riviera (Golfo dei Poeti / Cinque Terre).",
  "Write in a premium, natural, emotionally engaging tone aimed at affluent international travelers — this is not literal translation, it's luxury travel copywriting.",
  "Prioritize how a native Italian copywriter for a high-end travel brand would phrase it, over a word-for-word rendering.",
  "Preserve proper nouns, place names, and brand names exactly as written in the source.",
];

export interface TranslateFieldsResult {
  ok: boolean;
  translations: Record<string, string>;
  error?: string;
}

/**
 * Translates a map of named text fields (e.g. { title, description })
 * from English to a target locale in a single Lara call, using
 * Creative style (style: "creative").
 *
 * Fields are sent together as a context-linked array on purpose: they
 * all belong to the same experience, so letting Lara see them together
 * improves consistency (same experience won't get two different tones
 * for its title vs its description). This is different from batching
 * unrelated texts, which Lara's docs advise against.
 *
 * Never throws. On failure, returns { ok: false } so the caller can
 * leave the English content as the only available version — a failed
 * translation must never block the admin save flow.
 */
export async function translateFields(
  fields: Record<string, string | undefined | null>,
  targetLocale: TargetLocale,
  sourceLocale: string = "en"
): Promise<TranslateFieldsResult> {
  const entries = Object.entries(fields).filter(
    ([, value]) => typeof value === "string" && value.trim().length > 0
  ) as [string, string][];

  if (entries.length === 0) {
    return { ok: true, translations: {} };
  }

  const source = LOCALE_TO_LARA[sourceLocale] ?? sourceLocale;
  const target = LOCALE_TO_LARA[targetLocale] ?? targetLocale;

  try {
    const lara = getLara();

    const res = await lara.translate(
      entries.map(([, value]) => value),
      source,
      target,
      {
        style: "creative",
        instructions: BRAND_INSTRUCTIONS,
        contentType: "text/plain",
      }
    );

    const translatedValues = Array.isArray(res.translation)
      ? (res.translation as string[])
      : [res.translation as string];

    const translations: Record<string, string> = {};
    entries.forEach(([key], i) => {
      translations[key] = translatedValues[i] ?? "";
    });

    return { ok: true, translations };
  } catch (err) {
    console.error("[lara] translateFields failed:", err);
    return {
      ok: false,
      translations: {},
      error: err instanceof Error ? err.message : "Unknown Lara error",
    };
  }
}