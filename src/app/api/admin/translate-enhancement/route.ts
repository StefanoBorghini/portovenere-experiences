import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getEnhancements } from "@/lib/supabase/enhancementRepository";
import { syncAllEnhancementTranslations } from "@/lib/translations/translateEnhancement";

// =========================================================
// POST /api/admin/translate-enhancement
// Bottone "Traduci ora" nella scheda enhancement in admin — stesso
// scopo del suo equivalente per le esperienze
// (/api/admin/translate-experience): finora un enhancement veniva
// ritradotto SOLO quando una nuova proposal veniva generata
// (/api/translate-proposal-experiences chiama syncAllEnhancementTranslations
// sull'intero catalogo), quindi modificare un enhancement in admin
// lasciava la traduzione italiana vecchia — con status "ok" — finche'
// non capitava per caso una nuova proposal. Questo bottone la
// aggiorna subito, senza aspettare.
//
// syncAllEnhancementTranslations e' gia' idempotente per hash: righe
// gia' tradotte e invariate vengono saltate, quindi richiamarla non
// spreca mai quota Lara su contenuto che non e' cambiato.
// =========================================================

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

    const { enhancementId } = await req.json();

    if (!enhancementId) {
      return NextResponse.json(
        { success: false, error: "Missing enhancementId" },
        { status: 400 }
      );
    }

    const allEnhancements = await getEnhancements();
    const enhancement = allEnhancements.find(
      (e: { id: unknown }) => String(e.id) === String(enhancementId)
    );

    if (!enhancement) {
      return NextResponse.json(
        { success: false, error: "Enhancement not found" },
        { status: 404 }
      );
    }

    await syncAllEnhancementTranslations([enhancement]);

    return NextResponse.json({ success: true });

  } catch (err) {

    console.error("admin/translate-enhancement error:", err);

    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
