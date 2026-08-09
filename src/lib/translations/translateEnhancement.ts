/**
 * Enhancement translation
 * =====================================================================
 * Stesso schema di experience_content_translations, ma per il
 * catalogo enhancement (enhancement_content) — un manciata di righe
 * (Boutique Stays, Private Transfer, Drone Pilot, ecc.), stabile nel
 * tempo. A differenza delle experience, qui non serve un meccanismo
 * on-demand per-proposal: syncAllEnhancementTranslations() traduce
 * l'intero catalogo in un colpo solo (una chiamata Lara per locale,
 * tutti gli enhancement insieme — sono pochi, non serve nemmeno
 * spezzare in blocchi), pensata per essere richiamata dal backfill e,
 * in futuro, da un salvataggio in admin.
 * =====================================================================
 */

import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { hashFields } from "./translateExperience";
import { translateFields, SUPPORTED_TARGET_LOCALES } from "./lara";

interface EnhancementRow {
  id: string;
  title: string | null;
  description: string | null;
  unselected_button_text: string | null;
  selected_button_text: string | null;
}

/**
 * Traduce tutti gli enhancement passati (tipicamente l'intero
 * catalogo) verso ogni locale supportato, saltando quelli il cui
 * inglese non e' cambiato dall'ultima traduzione riuscita. Non lancia
 * mai — un fallimento su un enhancement non blocca gli altri.
 */
export async function syncAllEnhancementTranslations(
  enhancements: EnhancementRow[]
): Promise<void> {

  if (enhancements.length === 0) return;

  const supabase = getSupabaseAdmin();

  await Promise.all(
    SUPPORTED_TARGET_LOCALES.map(async (locale) => {

      const { data: existingRows } = await supabase
        .from("enhancement_content_translations")
        .select("enhancement_id, source_hash, translation_status")
        .eq("locale", locale)
        .in("enhancement_id", enhancements.map((e) => e.id));

      const existingByFk = new Map(
        (existingRows ?? []).map((row) => [row.enhancement_id, row])
      );

      const fieldNames = [
        "title",
        "description",
        "unselected_button_text",
        "selected_button_text",
      ] as const;

      const toTranslate = enhancements.filter((enhancement) => {
        const hash = hashFields(
          Object.fromEntries(fieldNames.map((f) => [f, enhancement[f]]))
        );
        const existing = existingByFk.get(enhancement.id);
        return !(existing?.source_hash === hash && existing.translation_status === "ok");
      });

      if (toTranslate.length === 0) return;

      const fields: Record<string, string> = {};
      toTranslate.forEach((enhancement, i) => {
        fieldNames.forEach((fieldName) => {
          const value = enhancement[fieldName];
          if (value) fields[`${fieldName}_${i}`] = value;
        });
      });

      const result = await translateFields(fields, locale);

      if (!result.ok) {
        console.error(
          `[translateEnhancement] batch failed for locale ${locale}:`,
          result.error
        );
      }

      const rows = toTranslate.map((enhancement, i) => {

        const sourceHash = hashFields(
          Object.fromEntries(fieldNames.map((f) => [f, enhancement[f]]))
        );

        if (!result.ok) {
          return {
            enhancement_id: enhancement.id,
            locale,
            translation_status: "failed",
            source_hash: sourceHash,
            updated_at: new Date().toISOString(),
          };
        }

        return {
          enhancement_id: enhancement.id,
          locale,
          title: result.translations[`title_${i}`] ?? null,
          description: result.translations[`description_${i}`] ?? null,
          unselected_button_text: result.translations[`unselected_button_text_${i}`] ?? null,
          selected_button_text: result.translations[`selected_button_text_${i}`] ?? null,
          translation_status: "ok",
          source_hash: sourceHash,
          translated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      const { error: upsertError } = await supabase
        .from("enhancement_content_translations")
        .upsert(rows, { onConflict: "enhancement_id,locale" });

      if (upsertError) {
        console.error(
          `[translateEnhancement] batch upsert error for locale ${locale}:`,
          upsertError
        );
      }
    })
  );
}
