/**
 * POST /api/translate-experience
 * =====================================================================
 * Unico punto d'ingresso per la sincronizzazione Lara Translate — per
 * l'esperienza stessa (title/short_description/description), per una
 * section o per un fact. Gira SEMPRE come funzione server (Vercel/Node),
 * mai nel browser — qui process.env.LARA_ACCESS_KEY_ID/SECRET e il
 * modulo "crypto" di Node funzionano correttamente, a differenza di
 * quando venivano chiamati direttamente da experienceRepository.ts
 * lato client.
 *
 * Chiamata da experienceRepository.ts via fetch, con Promise.allSettled:
 * un fallimento qui non deve mai far fallire il salvataggio.
 *
 * Body: { experienceId } oppure { sectionId } oppure { factId } —
 * esattamente uno dei tre, distingue quale sync lanciare.
 * =====================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import {
  syncExperienceTranslations,
  syncSectionTranslations,
  syncFactTranslations,
} from "@/lib/translations/translateExperience";

export async function POST(request: NextRequest) {

  try {

    const body = await request.json();
    const supabaseAdmin = getSupabaseAdmin();

    if (body.sectionId) {

      const { data: freshRow, error } = await supabaseAdmin
        .from("experience_sections")
        .select("title, description")
        .eq("id", body.sectionId)
        .single();

      if (error || !freshRow) {
        console.error(
          `[api/translate-experience] could not load section ${body.sectionId}:`,
          error
        );
        return NextResponse.json(
          { success: false, error: "Section not found" },
          { status: 404 }
        );
      }

      await syncSectionTranslations(body.sectionId, freshRow);
      return NextResponse.json({ success: true });
    }

    if (body.factId) {

      const { data: freshRow, error } = await supabaseAdmin
        .from("experience_facts")
        .select("label, value")
        .eq("id", body.factId)
        .single();

      if (error || !freshRow) {
        console.error(
          `[api/translate-experience] could not load fact ${body.factId}:`,
          error
        );
        return NextResponse.json(
          { success: false, error: "Fact not found" },
          { status: 404 }
        );
      }

      await syncFactTranslations(body.factId, freshRow);
      return NextResponse.json({ success: true });
    }

    const { experienceId } = body;

    if (!experienceId) {
      return NextResponse.json(
        { success: false, error: "experienceId, sectionId, or factId is required" },
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