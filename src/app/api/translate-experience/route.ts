/**
 * POST /api/translate-experience
 * =====================================================================
 * Unico punto d'ingresso per la sincronizzazione Lara Translate.
 * Gira SEMPRE come funzione server (Vercel/Node), mai nel browser —
 * qui process.env.LARA_ACCESS_KEY_ID/SECRET e il modulo "crypto" di
 * Node funzionano correttamente, a differenza di quando venivano
 * chiamati direttamente da experienceRepository.ts lato client.
 *
 * Chiamata da updateExperience() via fetch, con Promise.allSettled:
 * un fallimento qui non deve mai far fallire il salvataggio.
 * =====================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { syncExperienceTranslations } from "@/lib/translations/translateExperience";

export async function POST(request: NextRequest) {

  try {

    const { experienceId } = await request.json();

    if (!experienceId) {
      return NextResponse.json(
        { success: false, error: "experienceId is required" },
        { status: 400 }
      );
    }

    const { data: freshRow, error } = await supabaseAdmin
      .from("experience_content")
      .select("title, short_description, description")
      .eq("id", experienceId)
      .single();

    if (error || !freshRow) {
      console.error(
        `[api/translate-experience] could not load experience ${experienceId}:`,
        error
      );
      return NextResponse.json(
        { success: false, error: "Experience not found" },
        { status: 404 }
      );
    }

    await syncExperienceTranslations(experienceId, freshRow);

    return NextResponse.json({ success: true });

  } catch (err) {

    console.error("[api/translate-experience] unexpected error:", err);

    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}