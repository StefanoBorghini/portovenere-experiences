#!/usr/bin/env node
/**
 * Migrazione UNA TANTUM: da src/messages/en.json (next-intl) alle
 * tabelle Supabase site_copy / site_copy_translations.
 * =====================================================================
 * Dopo aver eseguito la migrazione SQL in supabase-migrations/2026_site_copy.sql,
 * lancia questo script UNA VOLTA per popolare le tabelle: prende ogni
 * chiave/valore di en.json (namespace "landing", "configurator",
 * "proposal", "common"), la inserisce in site_copy, poi chiama Lara
 * Translate per popolare site_copy_translations (locale "it").
 *
 * Da questo momento in poi il sito legge da queste tabelle (vedi
 * src/lib/translations/siteCopy.ts) — src/messages/*.json restano nel
 * repo solo come riferimento storico, non sono piu' usati a runtime.
 *
 * Uso:
 *   NEXT_PUBLIC_SUPABASE_URL=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   LARA_ACCESS_KEY_ID=... \
 *   LARA_ACCESS_KEY_SECRET=... \
 *   node src/scripts/seed-site-copy.mjs
 *
 * Idempotente: rilanciarlo aggiorna solo le chiavi il cui testo
 * inglese e' cambiato dall'ultima esecuzione (stesso source_hash usato
 * dal resto della pipeline Lara).
 * =====================================================================
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EN_MESSAGES_PATH = path.join(__dirname, "..", "messages", "en.json");

const TARGET_LOCALES = ["it"]; // tenere in sync con SUPPORTED_TARGET_LOCALES

const LOCALE_TO_LARA = {
  en: "en-US",
  it: "it-IT",
};

const BRAND_INSTRUCTIONS = [
  "This is UI copy (buttons, form labels, step titles, headings) for a luxury travel experience platform on the Italian Riviera (Golfo dei Poeti / Cinque Terre).",
  "Write in a premium, natural tone aimed at affluent international travelers — keep it concise, this is interface text, not long-form marketing copy.",
  "Preserve any {placeholders} (e.g. {count}, {name}) exactly as written — they are interpolated at runtime, never translate or alter their contents.",
];

function flatten(obj, prefix = "") {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flatten(value, fullKey));
    } else if (typeof value === "string") {
      out[fullKey] = value;
    }
  }
  return out;
}

function hashText(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function main() {

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const laraKeyId = process.env.LARA_ACCESS_KEY_ID;
  const laraKeySecret = process.env.LARA_ACCESS_KEY_SECRET;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "[seed-site-copy] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY mancanti — interrotto."
    );
    process.exit(1);
  }

  if (!laraKeyId || !laraKeySecret) {
    console.error(
      "[seed-site-copy] LARA_ACCESS_KEY_ID / LARA_ACCESS_KEY_SECRET mancanti — interrotto."
    );
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const { Credentials, Translator } = await import("@translated/lara");

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const translator = new Translator(new Credentials(laraKeyId, laraKeySecret));

  const en = JSON.parse(readFileSync(EN_MESSAGES_PATH, "utf-8"));
  const flatEn = flatten(en);
  const keys = Object.keys(flatEn);

  console.log(`[seed-site-copy] ${keys.length} chiavi trovate in en.json`);

  // ---------------------------------------------------------
  // 1. UPSERT site_copy (testo inglese)
  // ---------------------------------------------------------

  const siteCopyRows = keys.map((key) => ({
    key,
    en_text: flatEn[key],
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase
    .from("site_copy")
    .upsert(siteCopyRows, { onConflict: "key" });

  if (upsertError) {
    console.error("[seed-site-copy] upsert site_copy failed:", upsertError);
    process.exit(1);
  }

  console.log(`[seed-site-copy] site_copy popolata (${siteCopyRows.length} righe)`);

  // ---------------------------------------------------------
  // 2. TRADUZIONE — solo le chiavi il cui hash e' cambiato
  //    (o che non hanno ancora una riga "ok" per quel locale)
  // ---------------------------------------------------------

  for (const locale of TARGET_LOCALES) {

    const { data: existingRows, error: fetchError } = await supabase
      .from("site_copy_translations")
      .select("key, source_hash, translation_status")
      .eq("locale", locale);

    if (fetchError) {
      console.error(`[seed-site-copy] fetch existing translations failed for ${locale}:`, fetchError);
      continue;
    }

    const existingByKey = new Map(existingRows.map((row) => [row.key, row]));

    const toTranslate = keys.filter((key) => {
      const enText = flatEn[key];
      const hash = hashText(enText);
      const existing = existingByKey.get(key);
      return !(existing?.source_hash === hash && existing.translation_status === "ok");
    });

    if (toTranslate.length === 0) {
      console.log(`[seed-site-copy] ${locale}: nulla da tradurre, tutto gia' aggiornato.`);
      continue;
    }

    console.log(`[seed-site-copy] ${locale}: traduco ${toTranslate.length} chiave/i via Lara...`);

    const values = toTranslate.map((key) => flatEn[key]);

    try {

      const res = await translator.translate(
        values,
        LOCALE_TO_LARA.en,
        LOCALE_TO_LARA[locale] ?? locale,
        {
          style: "creative",
          instructions: BRAND_INSTRUCTIONS,
          contentType: "text/plain",
        }
      );

      const translatedValues = Array.isArray(res.translation)
        ? res.translation
        : [res.translation];

      const translationRows = toTranslate.map((key, i) => ({
        key,
        locale,
        text: translatedValues[i] ?? flatEn[key],
        translation_status: "ok",
        source_hash: hashText(flatEn[key]),
        translated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: trUpsertError } = await supabase
        .from("site_copy_translations")
        .upsert(translationRows, { onConflict: "key,locale" });

      if (trUpsertError) {
        console.error(`[seed-site-copy] upsert translations failed for ${locale}:`, trUpsertError);
      } else {
        console.log(`[seed-site-copy] ${locale}: ${translationRows.length} traduzioni salvate.`);
      }

    } catch (err) {
      console.error(`[seed-site-copy] Lara call failed for ${locale}:`, err);
    }
  }

  console.log("[seed-site-copy] completato.");
}

main().catch((err) => {
  console.error("[seed-site-copy] errore inatteso:", err);
  process.exit(1);
});
