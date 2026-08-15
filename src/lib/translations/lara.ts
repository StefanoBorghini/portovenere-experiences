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
export const SUPPORTED_TARGET_LOCALES = ["it", "fr", "de", "es", "ru", "zh", "ja"] as const;

export type TargetLocale = (typeof SUPPORTED_TARGET_LOCALES)[number];

// Our DB uses short codes ("it"), Lara wants full locale codes
// ("it-IT"). Single mapping point — extend here when adding a language.
const LOCALE_TO_LARA: Record<string, string> = {
  en: "en-US",
  it: "it-IT",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  ru: "ru-RU",
  zh: "zh-CN",
  ja: "ja-JP",
};

// Applied to every call so tone stays consistent across the whole
// site without repeating it at every call site. Tune here only.
const BRAND_INSTRUCTIONS = [
  "This is marketing copy for a luxury travel experience platform on the Italian Riviera (Golfo dei Poeti / Cinque Terre).",
  "Write in a premium, natural, emotionally engaging tone aimed at affluent international travelers — this is not literal translation, it's luxury travel copywriting.",
  "Prioritize how a native Italian copywriter for a high-end travel brand would phrase it, over a word-for-word rendering.",
  "Preserve ONLY genuine proper nouns exactly as written — real place names (e.g. Cinque Terre, Portovenere, Golfo dei Poeti) and the platform's own brand name.",
  "Experience titles and taglines (e.g. \"Paint With The Colors Of Wine\", \"Sail Into The Sunset\") are marketing copy, NOT proper nouns or brand names — always translate them fully into natural, evocative Italian, exactly like any other marketing text. Never leave a title untranslated just because it sounds like a name.",
];  
    
export interface TranslateFieldsResult {
  ok: boolean;
  translations: Record<string, string>;
  error?: string;
}

// -----------------------------------------------------------------------
// RATE LIMITER — Lara enforces a per-second character rate limit on top
// of (separate from) the monthly quota: 1,000 chars/sec on the Free
// plan, 10,000/sec on paid plans (confirmed with Lara support — the
// "exceeded quota" 429 we were hitting was this momentary limit, not
// the monthly pool, which had plenty of headroom left). Several
// concurrent batched calls (one per experience/section-group/fact-
// group) could easily burst past that in the same instant.
//
// This reserves a character budget from a 1-second sliding window
// before every real Lara call, queueing (not rejecting) requests that
// would exceed it. Conservative budget — comfortably under the Free
// tier's 1,000/sec — since Lara's own character counting may not match
// a plain .length sum exactly.
// -----------------------------------------------------------------------

const RATE_LIMIT_CHARS_PER_SECOND = 700;

let rateLimitWindowStart = Date.now();
let rateLimitCharsUsed = 0;
let rateLimitQueue: Promise<void> = Promise.resolve();

function reserveRateLimitBudget(chars: number): Promise<void> {
  rateLimitQueue = rateLimitQueue.then(async () => {

    const now = Date.now();

    if (now - rateLimitWindowStart >= 1000) {
      rateLimitWindowStart = now;
      rateLimitCharsUsed = 0;
    }

    if (rateLimitCharsUsed + chars > RATE_LIMIT_CHARS_PER_SECOND) {

      const waitMs = 1000 - (now - rateLimitWindowStart);

      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }

      rateLimitWindowStart = Date.now();
      rateLimitCharsUsed = 0;
    }

    rateLimitCharsUsed += chars;
  });

  return rateLimitQueue;
}

function isRateLimitError(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.message.includes("quota") || (err as { statusCode?: number }).statusCode === 429)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  const values = entries.map(([, value]) => value);
  const totalChars = values.reduce((sum, value) => sum + value.length, 0);

  // Fino a 2 ritentativi in piu' (3 tentativi totali): confermato dal
  // supporto Lara che il 429 "exceeded quota" e' spesso il rate-limit
  // al secondo, momentaneo — non il tetto mensile — quindi ha senso
  // ritentare dopo una breve attesa invece di arrendersi subito.
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {

    await reserveRateLimitBudget(totalChars);

    try {
      const lara = getLara();

      const res = await lara.translate(
        values,
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

      const isLastAttempt = attempt === MAX_ATTEMPTS;

      if (isRateLimitError(err) && !isLastAttempt) {
        console.error(
          `[lara] translateFields hit rate limit (attempt ${attempt}/${MAX_ATTEMPTS}), retrying:`,
          err
        );
        await sleep(1000 * attempt);
        continue;
      }

      console.error("[lara] translateFields failed:", err);
      return {
        ok: false,
        translations: {},
        error: err instanceof Error ? err.message : "Unknown Lara error",
      };
    }
  }

  // Irraggiungibile (il loop ritorna sempre dentro try/catch), ma
  // necessario per soddisfare il tipo di ritorno della funzione.
  return { ok: false, translations: {}, error: "Unknown Lara error" };
}