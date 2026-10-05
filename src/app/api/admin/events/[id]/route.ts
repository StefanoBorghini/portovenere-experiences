import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/requireAdminSession";
import {
  getEvent,
  updateEvent,
  deleteEvent,
  setEventWeekdays,
  upsertEventDate,
  deleteEventDate,
} from "@/lib/supabase/eventRepository";

// =========================================================
// GET/PATCH/DELETE /api/admin/events/[id] — dettaglio evento,
// comprese le righe di ricorrenza (weekdays) e le date puntuali
// (occorrenze uniche, o cancellazioni/override su una ricorrenza).
// =========================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const auth = await requireAdminSession(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const event = await getEvent(id);

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (err) {
    console.error("admin/events/[id] GET error:", err);
    return NextResponse.json({ success: false, error: "Could not load event" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const auth = await requireAdminSession(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();

  try {

    // Campi base dell'evento (title/description/image_url/
    // link_default/active) — tutti opzionali, si aggiorna solo
    // quello che arriva nel body.
    if (
      body.title !== undefined ||
      body.description !== undefined ||
      body.image_url !== undefined ||
      body.link_default !== undefined ||
      body.active !== undefined
    ) {
      await updateEvent(id, {
        title: body.title,
        description: body.description,
        image_url: body.image_url,
        link_default: body.link_default,
        active: body.active,
      });
    }

    // Sostituzione in blocco dei giorni ricorrenti — array di numeri
    // 0-6, o array vuoto per rimuovere la ricorrenza.
    if (Array.isArray(body.weekdays)) {
      await setEventWeekdays(id, body.weekdays);
    }

    // Upsert di una singola data (occorrenza unica, o
    // cancellazione/override su una data generata dalla ricorrenza).
    if (body.upsertDate) {
      await upsertEventDate(id, body.upsertDate.date, {
        status: body.upsertDate.status,
        link_override: body.upsertDate.link_override,
        note: body.upsertDate.note,
      });
    }

    if (body.deleteDate) {
      await deleteEventDate(id, body.deleteDate);
    }

    const event = await getEvent(id);
    return NextResponse.json({ success: true, event });

  } catch (err) {
    console.error("admin/events/[id] PATCH error:", err);
    return NextResponse.json({ success: false, error: "Could not update event" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const auth = await requireAdminSession(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    await deleteEvent(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("admin/events/[id] DELETE error:", err);
    return NextResponse.json({ success: false, error: "Could not delete event" }, { status: 500 });
  }
}
