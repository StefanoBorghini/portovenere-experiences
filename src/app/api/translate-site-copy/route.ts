/**
 * POST /api/translate-site-copy
 * =====================================================================
 * Ri-sincronizza la traduzione Lara per UNA chiave di site_copy — utile
 * se modifichi en_text direttamente nella tabella Supabase (non c'e' un
 * pannello admin che lo faccia scattare in automatico). Gira sempre
 * lato server, stesso motivo di /api/translate-experience.
 *
 * Uso manuale, es.:
 *   curl -X POST https://<dominio>/api/translate-site-copy \
 *     -H "Content-Type: application/json" \
 *     -d '{"key": "landing.hero.title"}'
 *
 * Body: { key } oppure { key: "*" } per ritradurre TUTTE le chiavi
 * (utile dopo una modifica massiva fatta direttamente in tabella).
 * =====================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { syncSiteCopyTranslation } from "@/lib/translations/siteCopy";

export async function POST(request: NextRequest) {

  try {

    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { success: false, error: "key is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (key === "*") {

      const { data: rows, error } = await supabaseAdmin
        .from("site_copy")
        .select("key, en_text");

      if (error || !rows) {
        return NextResponse.json(
          { success: false, error: "Could not load site_copy" },
          { status: 500 }
        );
      }

      await Promise.all(
        rows.map((row) => syncSiteCopyTranslation(row.key, row.en_text))
      );

      return NextResponse.json({ success: true, count: rows.length });
    }

    const { data: row, error } = await supabaseAdmin
      .from("site_copy")
      .select("en_text")
      .eq("key", key)
      .single();

    if (error || !row) {
      return NextResponse.json(
        { success: false, error: "Key not found in site_copy" },
        { status: 404 }
      );
    }

    await syncSiteCopyTranslation(key, row.en_text);

    return NextResponse.json({ success: true });

  } catch (err) {

    console.error("[api/translate-site-copy] unexpected error:", err);

    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
