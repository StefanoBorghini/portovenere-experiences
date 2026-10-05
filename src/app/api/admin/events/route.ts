import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/requireAdminSession";
import { listEvents, createEvent } from "@/lib/supabase/eventRepository";

// =========================================================
// GET/POST /api/admin/events — stesso pattern delle altre route
// admin (operators, partners): events non ha policy RLS pubbliche,
// ogni accesso passa da qui con la service role key.
// =========================================================

export async function GET(req: NextRequest) {

  const auth = await requireAdminSession(req);
  if (!auth.ok) return auth.response;

  try {
    const events = await listEvents();
    return NextResponse.json({ success: true, events });
  } catch (err) {
    console.error("admin/events GET error:", err);
    return NextResponse.json({ success: false, error: "Could not load events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {

  const auth = await requireAdminSession(req);
  if (!auth.ok) return auth.response;

  const { title, description, image_url, link_default } = await req.json();

  if (!title || typeof title !== "string") {
    return NextResponse.json({ success: false, error: "Missing title" }, { status: 400 });
  }

  try {
    const event = await createEvent({ title, description, image_url, link_default });
    return NextResponse.json({ success: true, event });
  } catch (err) {
    console.error("admin/events POST error:", err);
    return NextResponse.json({ success: false, error: "Could not create event" }, { status: 500 });
  }
}
