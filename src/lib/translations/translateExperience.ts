/**
 * Experience translation orchestrator
 * =====================================================================
 * Wires the generic Lara service (lara.ts) to the specific shape of
 * `experience_content`. Called ONLY from the server-side API route
 * /api/translate-experience — never directly from client code, and
 * never from a page render, so the site never pays a translation
 * call on visitor traffic.
 *
 * Sections and facts follow the exact same pattern (syncSection /
 * syncFact below) — kept as separate small functions so each can be
 * called independently from wherever sections/facts are saved.
 *
 * getSupabaseAdmin() e' chiamato dentro ogni funzione che lo usa,
 * MAI a livello di modulo — altrimenti verrebbe eseguito al semplice
 * caricamento del file (anche durante la fase di build "collecting
 * page data" di Next.js), rompendo il build se gli env var non sono
 * ancora visibili in quella fase.
 * =====================================================================
 */

import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import {
  translateFields,
  SUPPORTED_TARGET_LOCALES,
  TargetLocale,
} from "./lara";

// Deterministic hash of the English fields, used to skip re-translating
// content that hasn't actually changed since the last successful run.
function hashFields(fields: Record<string, string | undefined | null>): string {
  const normalized = Object.entries(fields)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v ?? ""}`)
    .join("|");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

// ---------------------------------------------------------------------
// Top-level experience fields (title, short_description, description)
// ---------------------------------------------------------------------
export interface ExperienceEnglishFields {
  title: string | null | undefined;
  short_description: string | null | undefined;
  description: string | null | undefined;
  // Firma indice esplicita — senza questa, TS non considera il tipo
  // assegnabile a Record<string, ...> anche se ogni proprietà nota
  // e' gia' compatibile.
  [key: string]: string | null | undefined;
}

/**
 * Translates and upserts experience_content_translations for every
 * supported locale. Safe to call on every create/update — it no-ops
 * for locales whose translation is already current.
 */
export async function syncExperienceTranslations(
  experienceId: string,
  en: ExperienceEnglishFields
): Promise<void> {

  const sourceHash = hashFields(en);

  await Promise.all(
    SUPPORTED_TARGET_LOCALES.map((locale) =>
      syncExperienceLocale(experienceId, en, locale, sourceHash)
    )
  );
}

async function syncExperienceLocale(
  experienceId: string,
  en: ExperienceEnglishFields,
  locale: TargetLocale,
  sourceHash: string
): Promise<void> {

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("experience_content_translations")
    .select("source_hash, translation_status")
    .eq("experience_id", experienceId)
    .eq("locale", locale)
    .maybeSingle();

  // English hasn't changed since the last GOOD translation -> skip.
  if (existing?.source_hash === sourceHash && existing.translation_status === "ok") {
    return;
  }

  const result = await translateFields(en, locale);

  if (!result.ok) {
    // Record the failure but do NOT touch title/short_description/
    // description columns — if a previous good translation exists it
    // stays live; otherwise the frontend falls back to English.
    const { error: upsertError } = await supabase.from("experience_content_translations").upsert(
      {
        experience_id: experienceId,
        locale,
        translation_status: "failed",
        source_hash: sourceHash,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "experience_id,locale" }
    );
    if (upsertError) {
      console.error(
        `[translateExperience] upsert (failed-status) error for ${experienceId}/${locale}:`,
        upsertError
      );
    }
    console.error(
      `[translateExperience] failed for ${experienceId}/${locale}:`,
      result.error
    );
    return;
  }

  const { error: upsertError } = await supabase.from("experience_content_translations").upsert(
    {
      experience_id: experienceId,
      locale,
      title: result.translations.title ?? null,
      short_description: result.translations.short_description ?? null,
      description: result.translations.description ?? null,
      translation_status: "ok",
      source_hash: sourceHash,
      translated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "experience_id,locale" }
  );

  if (upsertError) {
    console.error(
      `[translateExperience] upsert (ok-status) error for ${experienceId}/${locale}:`,
      upsertError
    );
  }
}

// ---------------------------------------------------------------------
// Sections (rich text blocks) — same pattern, one row per section
// ---------------------------------------------------------------------
export async function syncSectionTranslations(
  sectionId: string,
  en: {
    title: string | null | undefined;
    description: string | null | undefined;
    [key: string]: string | null | undefined;
  }
): Promise<void> {

  const supabase = getSupabaseAdmin();

  const sourceHash = hashFields(en);

  await Promise.all(
    SUPPORTED_TARGET_LOCALES.map(async (locale) => {
      const { data: existing } = await supabase
        .from("experience_sections_translations")
        .select("source_hash, translation_status")
        .eq("section_id", sectionId)
        .eq("locale", locale)
        .maybeSingle();

      if (existing?.source_hash === sourceHash && existing.translation_status === "ok") {
        return;
      }

      const result = await translateFields(en, locale);

      if (!result.ok) {
        const { error: upsertError } = await supabase.from("experience_sections_translations").upsert(
          {
            section_id: sectionId,
            locale,
            translation_status: "failed",
            source_hash: sourceHash,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "section_id,locale" }
        );
        if (upsertError) {
          console.error(
            `[translateExperience] section upsert (failed-status) error for ${sectionId}/${locale}:`,
            upsertError
          );
        }
        console.error(
          `[translateExperience] section failed for ${sectionId}/${locale}:`,
          result.error
        );
        return;
      }

      const { error: upsertError } = await supabase.from("experience_sections_translations").upsert(
        {
          section_id: sectionId,
          locale,
          title: result.translations.title ?? null,
          description: result.translations.description ?? null,
          translation_status: "ok",
          source_hash: sourceHash,
          translated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "section_id,locale" }
      );

      if (upsertError) {
        console.error(
          `[translateExperience] section upsert (ok-status) error for ${sectionId}/${locale}:`,
          upsertError
        );
      }
    })
  );
}

// ---------------------------------------------------------------------
// Facts (label / value pairs) — same pattern, one row per fact
// ---------------------------------------------------------------------
export async function syncFactTranslations(
  factId: string,
  en: {
    label: string | null | undefined;
    value: string | null | undefined;
    [key: string]: string | null | undefined;
  }
): Promise<void> {

  const supabase = getSupabaseAdmin();

  const sourceHash = hashFields(en);

  await Promise.all(
    SUPPORTED_TARGET_LOCALES.map(async (locale) => {
      const { data: existing } = await supabase
        .from("experience_facts_translations")
        .select("source_hash, translation_status")
        .eq("fact_id", factId)
        .eq("locale", locale)
        .maybeSingle();

      if (existing?.source_hash === sourceHash && existing.translation_status === "ok") {
        return;
      }

      const result = await translateFields(en, locale);

      if (!result.ok) {
        const { error: upsertError } = await supabase.from("experience_facts_translations").upsert(
          {
            fact_id: factId,
            locale,
            translation_status: "failed",
            source_hash: sourceHash,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "fact_id,locale" }
        );
        if (upsertError) {
          console.error(
            `[translateExperience] fact upsert (failed-status) error for ${factId}/${locale}:`,
            upsertError
          );
        }
        console.error(
          `[translateExperience] fact failed for ${factId}/${locale}:`,
          result.error
        );
        return;
      }

      const { error: upsertError } = await supabase.from("experience_facts_translations").upsert(
        {
          fact_id: factId,
          locale,
          label: result.translations.label ?? null,
          value: result.translations.value ?? null,
          translation_status: "ok",
          source_hash: sourceHash,
          translated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "fact_id,locale" }
      );

      if (upsertError) {
        console.error(
          `[translateExperience] fact upsert (ok-status) error for ${factId}/${locale}:`,
          upsertError
        );
      }
    })
  );
}