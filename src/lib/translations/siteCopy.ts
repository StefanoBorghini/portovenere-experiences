/**
 * Site copy — testo statico del sito (landing, configuratore, proposal,
 * stringhe comuni) come contenuto Supabase tradotto da Lara, invece che
 * come file next-intl committati (src/messages/en.json / it.json).
 * =====================================================================
 * Stesso schema e stessa filosofia di experience_content_translations:
 * una riga inglese (site_copy) + una riga di traduzione per locale
 * (site_copy_translations) con translation_status, cosi' una
 * traduzione fallita o vuota non viene mai mostrata — si torna
 * all'inglese.
 *
 * getSiteCopyMessages() e' l'unico punto che il resto del sito usa per
 * leggere: ricostruisce lo stesso oggetto nidificato che prima veniva
 * da en.json/it.json (namespace "landing"/"configurator"/"proposal"/
 * "common"), cosi' i componenti che gia' chiamano useTranslations("...")
 * / t("chiave") non cambiano — cambia solo da dove arriva il dato.
 * =====================================================================
 */

import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { translateFields, SUPPORTED_TARGET_LOCALES, TargetLocale } from "./lara";
import crypto from "crypto";

function setPath(obj: Record<string, any>, dottedKey: string, value: string) {
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

/**
 * Legge tutte le righe di site_copy (+ le traduzioni per `locale`, se
 * diverso da "en") e ricostruisce l'oggetto nidificato dei messaggi.
 * Chiamata SOLO server-side (RSC), con la chiave anon pubblica — le
 * tabelle sono leggibili pubblicamente via RLS (testo di marketing,
 * non dati riservati), stesso trattamento di experience_content.
 */
export async function getSiteCopyMessages(
  locale: string
): Promise<Record<string, any>> {

  if (!supabase) return {};

  const { data: enRows, error: enError } = await supabase
    .from("site_copy")
    .select("key, en_text");

  if (enError || !enRows) {
    console.error("[siteCopy] failed to load site_copy:", enError);
    return {};
  }

  let translationsByKey = new Map<string, { text: string | null; translation_status: string }>();

  if (locale !== "en") {

    const { data: trRows, error: trError } = await supabase
      .from("site_copy_translations")
      .select("key, text, translation_status")
      .eq("locale", locale);

    if (trError) {
      console.error("[siteCopy] failed to load site_copy_translations:", trError);
    } else if (trRows) {
      translationsByKey = new Map(trRows.map((row) => [row.key, row]));
    }
  }

  const messages: Record<string, any> = {};

  for (const row of enRows) {

    const translation = translationsByKey.get(row.key);

    const value =
      translation?.translation_status === "ok" &&
      typeof translation.text === "string" &&
      translation.text.trim().length > 0
        ? translation.text
        : row.en_text;

    setPath(messages, row.key, value);
  }

  return messages;
}

// Deterministic hash — stesso pattern di translateExperience.ts, per
// saltare la ritraduzione quando il testo inglese non e' cambiato.
function hashText(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

/**
 * (Ri)traduce una singola chiave di site_copy per tutti i locale
 * supportati. Chiamata dallo script di seed una tantum, e disponibile
 * per una ri-sincronizzazione manuale (via /api/translate-site-copy)
 * se il testo inglese viene modificato direttamente nella tabella —
 * non c'e' un pannello admin che la triggeri automaticamente.
 */
export async function syncSiteCopyTranslation(
  key: string,
  enText: string
): Promise<void> {

  const supabaseAdmin = getSupabaseAdmin();
  const sourceHash = hashText(enText);

  await Promise.all(
    SUPPORTED_TARGET_LOCALES.map(async (locale: TargetLocale) => {

      const { data: existing } = await supabaseAdmin
        .from("site_copy_translations")
        .select("source_hash, translation_status")
        .eq("key", key)
        .eq("locale", locale)
        .maybeSingle();

      if (existing?.source_hash === sourceHash && existing.translation_status === "ok") {
        return;
      }

      const result = await translateFields({ text: enText }, locale);

      if (!result.ok) {
        await supabaseAdmin.from("site_copy_translations").upsert(
          {
            key,
            locale,
            translation_status: "failed",
            source_hash: sourceHash,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key,locale" }
        );
        console.error(`[siteCopy] translation failed for ${key}/${locale}:`, result.error);
        return;
      }

      await supabaseAdmin.from("site_copy_translations").upsert(
        {
          key,
          locale,
          text: result.translations.text ?? null,
          translation_status: "ok",
          source_hash: sourceHash,
          translated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key,locale" }
      );
    })
  );
}
