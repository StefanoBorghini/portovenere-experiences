import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/requireAdminSession";
import { getEvent } from "@/lib/supabase/eventRepository";
import { syncAllEventTranslations } from "@/lib/translations/translateEvent";

// =========================================================
// POST /api/admin/translate-event
// Bottone "Translate now" nella scheda evento in admin — stesso
// scopo del suo equivalente per gli enhancement
// (/api/admin/translate-enhancement). syncAllEventTranslations e'
// gia' idempotente per hash: richiamarla su un evento invariato non
// spreca mai quota Lara.
// =========================================================

export async function POST(req: NextRequest) {

  const auth = await requireAdminSession(req);
  if (!auth.ok) return auth.response;

  const { eventId } = await req.json();

  if (!eventId) {
    return NextResponse.json({ success: false, error: "Missing eventId" }, { status: 400 });
  }

  try {

    const event = await getEvent(eventId);

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    await syncAllEventTranslations([event]);

    return NextResponse.json({ success: true });

  } catch (err) {

    console.error("admin/translate-event error:", err);

    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}
