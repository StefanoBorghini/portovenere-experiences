/**
 * Event translation
 * =====================================================================
 * Stesso schema/meccanismo di translateEnhancement.ts, per la tabella
 * events (solo title/description, niente prezzo/ospiti/bottoni). Non
 * automatica a ogni salvataggio — richiamata dal bottone "Translate
 * now" nella scheda evento in admin (vedi
 * /api/admin/translate-event), cosi' il salvataggio principale resta
 * veloce e non aspetta le chiamate Lara.
 * =====================================================================
 */

import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { hashFields } from "./translateExperience";
import { translateFields, SUPPORTED_TARGET_LOCALES } from "./lara";

interface EventRow {
  id: string;
  title: string | null;
  description: string | null;
}

/**
 * Traduce tutti gli eventi passati verso ogni locale supportato,
 * saltando quelli il cui inglese non e' cambiato dall'ultima
 * traduzione riuscita. Non lancia mai — un fallimento su un evento
 * non blocca gli altri.
 */
export async function syncAllEventTranslations(
  events: EventRow[]
): Promise<void> {

  if (events.length === 0) return;

  const supabase = getSupabaseAdmin();

  await Promise.all(
    SUPPORTED_TARGET_LOCALES.map(async (locale) => {

      const { data: existingRows } = await supabase
        .from("event_translations")
        .select("event_id, source_hash, translation_status")
        .eq("locale", locale)
        .in("event_id", events.map((e) => e.id));

      const existingByFk = new Map(
        (existingRows ?? []).map((row) => [row.event_id, row])
      );

      const fieldNames = ["title", "description"] as const;

      const toTranslate = events.filter((event) => {
        const hash = hashFields(
          Object.fromEntries(fieldNames.map((f) => [f, event[f]]))
        );
        const existing = existingByFk.get(event.id);
        return !(existing?.source_hash === hash && existing.translation_status === "ok");
      });

      if (toTranslate.length === 0) return;

      const fields: Record<string, string> = {};
      toTranslate.forEach((event, i) => {
        fieldNames.forEach((fieldName) => {
          const value = event[fieldName];
          if (value) fields[`${fieldName}_${i}`] = value;
        });
      });

      const result = await translateFields(fields, locale);

      if (!result.ok) {
        console.error(
          `[translateEvent] batch failed for locale ${locale}:`,
          result.error
        );
      }

      const rows = toTranslate.map((event, i) => {

        const sourceHash = hashFields(
          Object.fromEntries(fieldNames.map((f) => [f, event[f]]))
        );

        if (!result.ok) {
          return {
            event_id: event.id,
            locale,
            translation_status: "failed",
            source_hash: sourceHash,
            updated_at: new Date().toISOString(),
          };
        }

        return {
          event_id: event.id,
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
        .from("event_translations")
        .upsert(rows, { onConflict: "event_id,locale" });

      if (upsertError) {
        console.error(
          `[translateEvent] batch upsert error for locale ${locale}:`,
          upsertError
        );
      }
    })
  );
}
