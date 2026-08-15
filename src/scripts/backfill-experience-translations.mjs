#!/usr/bin/env node
/**
 * Backfill UNA TANTUM: traduce via Lara tutte le righe di
 * experience_content / experience_sections / experience_facts /
 * experience_hero_titles che non hanno ancora una riga "ok" nella
 * rispettiva tabella *_translations.
 * =====================================================================
 * La pipeline Lara per le experience (src/lib/translations/translateExperience.ts)
 * viene chiamata SOLO quando qualcuno salva dal pannello admin — le
 * righe create prima che questa pipeline esistesse (o mai più salvate
 * da allora) non sono mai state tradotte, e il sito mostra l'inglese
 * come fallback silenzioso. Questo script chiude quel buco una tantum,
 * riusando la stessa identica logica hash/upsert di translateExperience.ts
 * (qui reimplementata perché e' un file .ts, non importabile da un
 * plain node script come questo).
 *
 * Uso:
 *   NEXT_PUBLIC_SUPABASE_URL=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   LARA_ACCESS_KEY_ID=... \
 *   LARA_ACCESS_KEY_SECRET=... \
 *   node src/scripts/backfill-experience-translations.mjs
 *
 * Idempotente: rilanciarlo ritraduce solo le righe il cui inglese e'
 * cambiato (o che non hanno ancora una traduzione "ok") dall'ultima
 * esecuzione.
 * =====================================================================
 */

import crypto from "crypto";
import { loadEnvLocal } from "./loadEnvLocal.mjs";

loadEnvLocal();

const TARGET_LOCALES = ["it", "fr", "de", "es", "ru", "zh", "ja"]; // tenere in sync con SUPPORTED_TARGET_LOCALES

const LOCALE_TO_LARA = {
  en: "en-US",
  it: "it-IT",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  ru: "ru-RU",
  zh: "zh-CN",
  ja: "ja-JP",
};

const BRAND_INSTRUCTIONS = [
  "This is marketing copy for a luxury travel experience platform on the Italian Riviera (Golfo dei Poeti / Cinque Terre).",
  "Write in a premium, natural, emotionally engaging tone aimed at affluent international travelers — this is not literal translation, it's luxury travel copywriting.",
  "Prioritize how a native Italian copywriter for a high-end travel brand would phrase it, over a word-for-word rendering.",
  "Preserve proper nouns, place names, and brand names exactly as written in the source.",
];

function hashFields(fields) {
  const normalized = Object.entries(fields)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v ?? ""}`)
    .join("|");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Backfilla una tabella (experience_content, experience_sections o
 * experience_facts) verso la sua tabella *_translations.
 */
async function backfillTable({
  supabase,
  translator,
  sourceTable,
  idColumn,
  fields, // es. ["title", "short_description", "description"]
  translationsTable,
  fkColumn, // es. "experience_id" | "section_id" | "fact_id"
}) {

  const { data: rows, error: fetchError } = await supabase
    .from(sourceTable)
    .select(["id", ...fields].join(", "));

  if (fetchError || !rows) {
    console.error(`[backfill] fetch ${sourceTable} failed:`, fetchError);
    return;
  }

  console.log(`[backfill] ${sourceTable}: ${rows.length} righe trovate`);

  for (const locale of TARGET_LOCALES) {

    const { data: existingRows, error: existingError } = await supabase
      .from(translationsTable)
      .select(`${fkColumn}, source_hash, translation_status`)
      .eq("locale", locale);

    if (existingError) {
      console.error(`[backfill] fetch ${translationsTable} failed for ${locale}:`, existingError);
      continue;
    }

    const existingByFk = new Map(existingRows.map((row) => [row[fkColumn], row]));

    let translated = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of rows) {

      const en = Object.fromEntries(fields.map((f) => [f, row[f]]));
      const sourceHash = hashFields(en);
      const existing = existingByFk.get(row.id);

      if (existing?.source_hash === sourceHash && existing.translation_status === "ok") {
        skipped++;
        continue;
      }

      const entries = Object.entries(en).filter(
        ([, v]) => typeof v === "string" && v.trim().length > 0
      );

      if (entries.length === 0) {
        skipped++;
        continue;
      }

      try {

        const res = await translator.translate(
          entries.map(([, v]) => v),
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

        const translations = {};
        entries.forEach(([key], i) => {
          translations[key] = translatedValues[i] ?? "";
        });

        const { error: upsertError } = await supabase.from(translationsTable).upsert(
          {
            [fkColumn]: row.id,
            locale,
            ...translations,
            translation_status: "ok",
            source_hash: sourceHash,
            translated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: `${fkColumn},locale` }
        );

        if (upsertError) {
          console.error(`[backfill] upsert ${translationsTable} failed for ${row.id}:`, upsertError);
          failed++;
        } else {
          translated++;
        }

      } catch (err) {
        console.error(`[backfill] Lara call failed for ${sourceTable}/${row.id}/${locale}:`, err.message ?? err);

        await supabase.from(translationsTable).upsert(
          {
            [fkColumn]: row.id,
            locale,
            translation_status: "failed",
            source_hash: sourceHash,
            updated_at: new Date().toISOString(),
          },
          { onConflict: `${fkColumn},locale` }
        );

        failed++;
      }
    }

    console.log(
      `[backfill] ${sourceTable}/${locale}: ${translated} tradotte, ${skipped} gia' ok, ${failed} fallite`
    );
  }
}

async function main() {

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const laraKeyId = process.env.LARA_ACCESS_KEY_ID;
  const laraKeySecret = process.env.LARA_ACCESS_KEY_SECRET;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "[backfill] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY mancanti — interrotto."
    );
    process.exit(1);
  }

  if (!laraKeyId || !laraKeySecret) {
    console.error(
      "[backfill] LARA_ACCESS_KEY_ID / LARA_ACCESS_KEY_SECRET mancanti — interrotto."
    );
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const { Credentials, Translator } = await import("@translated/lara");

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const translator = new Translator(new Credentials(laraKeyId, laraKeySecret));

  await backfillTable({
    supabase,
    translator,
    sourceTable: "experience_content",
    idColumn: "id",
    fields: ["title", "short_description", "description"],
    translationsTable: "experience_content_translations",
    fkColumn: "experience_id",
  });

  await backfillTable({
    supabase,
    translator,
    sourceTable: "experience_sections",
    idColumn: "id",
    fields: ["title", "description"],
    translationsTable: "experience_sections_translations",
    fkColumn: "section_id",
  });

  await backfillTable({
    supabase,
    translator,
    sourceTable: "experience_facts",
    idColumn: "id",
    fields: ["label", "value"],
    translationsTable: "experience_facts_translations",
    fkColumn: "fact_id",
  });

  await backfillTable({
    supabase,
    translator,
    sourceTable: "experience_hero_titles",
    idColumn: "id",
    fields: ["title"],
    translationsTable: "experience_hero_titles_translations",
    fkColumn: "hero_title_id",
  });

  console.log("[backfill] completato.");
}

main().catch((err) => {
  console.error("[backfill] errore inatteso:", err);
  process.exit(1);
});
