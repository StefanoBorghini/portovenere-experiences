#!/usr/bin/env node
/**
 * Backfill automatico dei messaggi next-intl via Lara Translate
 * =====================================================================
 * Confronta src/messages/en.json con src/messages/<locale>.json per
 * ogni locale target e traduce SOLO le chiavi mancanti nel file di
 * destinazione. Le traduzioni gia' presenti (generate da Lara in un
 * run precedente, o scritte a mano) non vengono mai toccate — quindi
 * rilanciare questo script ad ogni build (e' il prebuild in
 * package.json) non costa nulla quando non c'e' nulla di nuovo da
 * tradurre, e le chiavi nuove aggiunte a en.json vengono tradotte
 * automaticamente al build successivo, senza intervento manuale.
 *
 * Non deve MAI far fallire la build: se le chiavi Lara non sono
 * configurate, o la chiamata fallisce, logga e lascia il file di
 * destinazione esattamente com'era.
 * =====================================================================
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.join(__dirname, "..", "messages");

const SOURCE_LOCALE = "en";

// Tenere in sync con SUPPORTED_TARGET_LOCALES in src/lib/translations/lara.ts
const TARGET_LOCALES = ["it"];

const LOCALE_TO_LARA = {
  en: "en-US",
  it: "it-IT",
};

const BRAND_INSTRUCTIONS = [
  "This is UI copy (buttons, form labels, step titles) for a luxury travel experience platform on the Italian Riviera (Golfo dei Poeti / Cinque Terre).",
  "Write in a premium, natural tone aimed at affluent international travelers — keep it concise, this is interface text, not long-form marketing copy.",
  "Preserve any {placeholders} (e.g. {count}) exactly as written — they are interpolated at runtime, never translate or alter their contents.",
];

function flatten(obj, prefix = "") {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flatten(value, fullKey));
    } else {
      out[fullKey] = value;
    }
  }
  return out;
}

function setPath(obj, dottedKey, value) {
  const parts = dottedKey.split(".");
  let node = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof node[part] !== "object" || node[part] === null) {
      node[part] = {};
    }
    node = node[part];
  }
  node[parts[parts.length - 1]] = value;
}

async function translateMissing(missing, targetLocale) {
  const accessKeyId = process.env.LARA_ACCESS_KEY_ID;
  const accessKeySecret = process.env.LARA_ACCESS_KEY_SECRET;

  if (!accessKeyId || !accessKeySecret) {
    console.warn(
      "[translate-messages] LARA_ACCESS_KEY_ID/LARA_ACCESS_KEY_SECRET non impostate — salto la traduzione automatica, le chiavi mancanti restano tali."
    );
    return {};
  }

  const { Credentials, Translator } = await import("@translated/lara");
  const translator = new Translator(new Credentials(accessKeyId, accessKeySecret));

  const keys = Object.keys(missing);
  const values = keys.map((k) => missing[k]);

  try {
    const res = await translator.translate(
      values,
      LOCALE_TO_LARA[SOURCE_LOCALE],
      LOCALE_TO_LARA[targetLocale] ?? targetLocale,
      {
        style: "creative",
        instructions: BRAND_INSTRUCTIONS,
        contentType: "text/plain",
      }
    );

    const translatedValues = Array.isArray(res.translation)
      ? res.translation
      : [res.translation];

    const result = {};
    keys.forEach((key, i) => {
      result[key] = translatedValues[i] ?? missing[key];
    });
    return result;
  } catch (err) {
    console.error(`[translate-messages] chiamata Lara fallita per ${targetLocale}:`, err);
    return {};
  }
}

async function run() {
  const enPath = path.join(MESSAGES_DIR, `${SOURCE_LOCALE}.json`);
  const en = JSON.parse(readFileSync(enPath, "utf-8"));
  const flatEn = flatten(en);

  for (const targetLocale of TARGET_LOCALES) {
    const targetPath = path.join(MESSAGES_DIR, `${targetLocale}.json`);
    const target = existsSync(targetPath)
      ? JSON.parse(readFileSync(targetPath, "utf-8"))
      : {};
    const flatTarget = flatten(target);

    const missing = {};
    for (const [key, value] of Object.entries(flatEn)) {
      if (typeof value !== "string" || value.trim().length === 0) continue;

      const existing = flatTarget[key];
      if (typeof existing !== "string" || existing.trim().length === 0) {
        missing[key] = value;
      }
    }

    if (Object.keys(missing).length === 0) {
      console.log(`[translate-messages] ${targetLocale}: nessuna chiave mancante, salto la chiamata a Lara.`);
      continue;
    }

    console.log(
      `[translate-messages] ${targetLocale}: traduco ${Object.keys(missing).length} chiave/i mancante/i via Lara...`
    );

    const translated = await translateMissing(missing, targetLocale);

    for (const [key, value] of Object.entries(translated)) {
      setPath(target, key, value);
    }

    writeFileSync(targetPath, JSON.stringify(target, null, 2) + "\n", "utf-8");
  }
}

run().catch((err) => {
  console.error("[translate-messages] errore inatteso, la build continua comunque:", err);
});
