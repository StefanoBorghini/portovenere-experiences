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
// Esportata: riusata anche da translateEnhancement.ts, stessa identica
// logica di skip-se-invariato.
export function hashFields(fields: Record<string, string | undefined | null>): string {
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

/**
 * Traduce un'esperienza intera (titolo/descrizioni + tutte le sue
 * sections + tutti i suoi facts) rileggendo i dati freschi dalle
 * tabelle base. Pensata per essere chiamata on-demand nel momento in
 * cui una proposal viene generata (solo per l'esperienza scelta e i
 * suggested add-ons), invece di un backfill che traduce l'intero
 * catalogo — cosi' si traduce solo cio' che finisce davvero
 * visualizzato in una proposal, non tutto il catalogo a prescindere.
 * Non lancia mai: ogni sync interno gestisce gia' i propri errori.
 */
export async function syncFullExperienceTranslations(
  experienceId: string
): Promise<void> {

  const supabase = getSupabaseAdmin();

  const { data: experience, error: experienceError } = await supabase
    .from("experience_content")
    .select("title, short_description, description")
    .eq("id", experienceId)
    .single();

  if (experienceError || !experience) {
    console.error(
      `[translateExperience] syncFullExperienceTranslations: could not load experience ${experienceId}:`,
      experienceError
    );
    return;
  }

  const { data: sections } = await supabase
    .from("experience_sections")
    .select("id, title, description")
    .eq("experience_id", experienceId);

  const { data: facts } = await supabase
    .from("experience_facts")
    .select("id, label, value")
    .eq("experience_id", experienceId);

  const { data: heroTitles } = await supabase
    .from("experience_hero_titles")
    .select("id, title")
    .eq("experience_id", experienceId);

  // Una sola chiamata Lara per TUTTE le sections dell'esperienza, una
  // per TUTTI i facts, una per TUTTE le hero titles (batch sotto),
  // invece di una chiamata per riga: con 5-7 facts per esperienza il
  // giro per riga moltiplicava inutilmente la latenza di rete, il vero
  // costo di tempo (non il calcolo della traduzione in se'). Restano
  // chiamate separate solo per non mischiare tipi di contenuto diversi
  // in un'unica richiesta enorme.
  await syncExperienceTranslations(experienceId, experience);
  await syncSectionsBatch(sections ?? []);
  await syncFactsBatch(facts ?? []);
  await syncHeroTitlesBatch(heroTitles ?? []);
}

async function syncSectionsBatch(
  sections: { id: string; title: string | null; description: string | null }[]
): Promise<void> {

  if (sections.length === 0) return;

  const supabase = getSupabaseAdmin();

  await Promise.all(
    SUPPORTED_TARGET_LOCALES.map(async (locale) => {

      const { data: existingRows } = await supabase
        .from("experience_sections_translations")
        .select("section_id, source_hash, translation_status")
        .eq("locale", locale)
        .in("section_id", sections.map((s) => s.id));

      const existingByFk = new Map(
        (existingRows ?? []).map((row) => [row.section_id, row])
      );

      const toTranslate = sections.filter((section) => {
        const hash = hashFields({
          title: section.title,
          description: section.description,
        });
        const existing = existingByFk.get(section.id);
        return !(existing?.source_hash === hash && existing.translation_status === "ok");
      });

      if (toTranslate.length === 0) return;

      const fields: Record<string, string> = {};
      toTranslate.forEach((section, i) => {
        if (section.title) fields[`title_${i}`] = section.title;
        if (section.description) fields[`description_${i}`] = section.description;
      });

      const result = await translateFields(fields, locale);

      if (!result.ok) {
        console.error(
          `[translateExperience] sections batch failed for locale ${locale}:`,
          result.error
        );
      }

      const rows = toTranslate.map((section, i) => {

        const sourceHash = hashFields({
          title: section.title,
          description: section.description,
        });

        if (!result.ok) {
          return {
            section_id: section.id,
            locale,
            translation_status: "failed",
            source_hash: sourceHash,
            updated_at: new Date().toISOString(),
          };
        }

        return {
          section_id: section.id,
          locale,
          title: result.translations[`title_${i}`] ?? null,
          description: result.translations[`description_${i}`] ?? null,
          translation_status: "ok",
          source_hash: sourceHash,
          translated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      const { error: upsertError } = await supabase
        .from("experience_sections_translations")
        .upsert(rows, { onConflict: "section_id,locale" });

      if (upsertError) {
        console.error(
          `[translateExperience] sections batch upsert error for locale ${locale}:`,
          upsertError
        );
      }
    })
  );
}

async function syncFactsBatch(
  facts: { id: string; label: string | null; value: string | null }[]
): Promise<void> {

  if (facts.length === 0) return;

  const supabase = getSupabaseAdmin();

  await Promise.all(
    SUPPORTED_TARGET_LOCALES.map(async (locale) => {

      const { data: existingRows } = await supabase
        .from("experience_facts_translations")
        .select("fact_id, source_hash, translation_status")
        .eq("locale", locale)
        .in("fact_id", facts.map((f) => f.id));

      const existingByFk = new Map(
        (existingRows ?? []).map((row) => [row.fact_id, row])
      );

      const toTranslate = facts.filter((fact) => {
        const hash = hashFields({ label: fact.label, value: fact.value });
        const existing = existingByFk.get(fact.id);
        return !(existing?.source_hash === hash && existing.translation_status === "ok");
      });

      if (toTranslate.length === 0) return;

      const fields: Record<string, string> = {};
      toTranslate.forEach((fact, i) => {
        if (fact.label) fields[`label_${i}`] = fact.label;
        if (fact.value) fields[`value_${i}`] = fact.value;
      });

      const result = await translateFields(fields, locale);

      if (!result.ok) {
        console.error(
          `[translateExperience] facts batch failed for locale ${locale}:`,
          result.error
        );
      }

      const rows = toTranslate.map((fact, i) => {

        const sourceHash = hashFields({ label: fact.label, value: fact.value });

        if (!result.ok) {
          return {
            fact_id: fact.id,
            locale,
            translation_status: "failed",
            source_hash: sourceHash,
            updated_at: new Date().toISOString(),
          };
        }

        return {
          fact_id: fact.id,
          locale,
          label: result.translations[`label_${i}`] ?? null,
          value: result.translations[`value_${i}`] ?? null,
          translation_status: "ok",
          source_hash: sourceHash,
          translated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      const { error: upsertError } = await supabase
        .from("experience_facts_translations")
        .upsert(rows, { onConflict: "fact_id,locale" });

      if (upsertError) {
        console.error(
          `[translateExperience] facts batch upsert error for locale ${locale}:`,
          upsertError
        );
      }
    })
  );
}

async function syncHeroTitlesBatch(
  heroTitles: { id: string; title: string | null }[]
): Promise<void> {

  if (heroTitles.length === 0) return;

  const supabase = getSupabaseAdmin();

  await Promise.all(
    SUPPORTED_TARGET_LOCALES.map(async (locale) => {

      const { data: existingRows } = await supabase
        .from("experience_hero_titles_translations")
        .select("hero_title_id, source_hash, translation_status")
        .eq("locale", locale)
        .in("hero_title_id", heroTitles.map((h) => h.id));

      const existingByFk = new Map(
        (existingRows ?? []).map((row) => [row.hero_title_id, row])
      );

      const toTranslate = heroTitles.filter((heroTitle) => {
        const hash = hashFields({ title: heroTitle.title });
        const existing = existingByFk.get(heroTitle.id);
        return !(existing?.source_hash === hash && existing.translation_status === "ok");
      });

      if (toTranslate.length === 0) return;

      const fields: Record<string, string> = {};
      toTranslate.forEach((heroTitle, i) => {
        if (heroTitle.title) fields[`title_${i}`] = heroTitle.title;
      });

      const result = await translateFields(fields, locale);

      if (!result.ok) {
        console.error(
          `[translateExperience] hero titles batch failed for locale ${locale}:`,
          result.error
        );
      }

      const rows = toTranslate.map((heroTitle, i) => {

        const sourceHash = hashFields({ title: heroTitle.title });

        if (!result.ok) {
          return {
            hero_title_id: heroTitle.id,
            locale,
            translation_status: "failed",
            source_hash: sourceHash,
            updated_at: new Date().toISOString(),
          };
        }

        return {
          hero_title_id: heroTitle.id,
          locale,
          title: result.translations[`title_${i}`] ?? null,
          translation_status: "ok",
          source_hash: sourceHash,
          translated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      const { error: upsertError } = await supabase
        .from("experience_hero_titles_translations")
        .upsert(rows, { onConflict: "hero_title_id,locale" });

      if (upsertError) {
        console.error(
          `[translateExperience] hero titles batch upsert error for locale ${locale}:`,
          upsertError
        );
      }
    })
  );
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