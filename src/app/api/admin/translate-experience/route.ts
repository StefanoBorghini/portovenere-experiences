import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { syncFullExperienceTranslations } from "@/lib/translations/translateExperience";

// =========================================================
// POST /api/admin/translate-experience
// Bottone "Traduci ora" nella scheda esperienza in admin —
// stessa identica sincronizzazione (content + sections + facts
// + hero titles) usata dal backfill e dalla traduzione on-demand
// quando l'esperienza compare in una proposal, ma innescabile a
// mano subito dopo aver creato/modificato un'esperienza, senza
// aspettare la prima proposal reale o dover aprire un terminale.
//
// syncFullExperienceTranslations e' gia' idempotente per hash:
// le righe gia' tradotte e invariate vengono saltate, quindi
// richiamarla piu' volte (o dopo il backfill) non spreca mai
// quota Lara su contenuto che non e' cambiato.
// =========================================================

// Fino a 4 chiamate Lara in sequenza (content, sections batch, facts
// batch, hero titles batch) piu' eventuali retry per rate limiting —
// stesso margine di /api/translate-proposal-experiences.
export const maxDuration = 60;

export async function POST(req: NextRequest) {

  try {

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !userData?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { experienceId } = await req.json();

    if (!experienceId) {
      return NextResponse.json(
        { success: false, error: "Missing experienceId" },
        { status: 400 }
      );
    }

    await syncFullExperienceTranslations(experienceId);

    return NextResponse.json({ success: true });

  } catch (err) {

    console.error("admin/translate-experience error:", err);

    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
