import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { requireAdminSession } from "@/lib/auth/requireAdminSession";

// Solo questi campi sono modificabili dall'admin via PATCH — mai i
// dati che l'operatore ha inviato lui stesso (company_name, email,
// profile, ecc.), per non corrompere la candidatura originale.
const EDITABLE_FIELDS = [
  "status",
  "payment_status",
  "payment_sent_at",
  "payment_amount",
  "subscription_start_date",
  "subscription_end_date",
  "internal_notes",
  "stripe_checkout_session_id",
  "checkout_url",
] as const;

function pickEditableFields(body: Record<string, unknown>) {
  const updates: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }
  return updates;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const auth = await requireAdminSession(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {

    const { data, error } = await getSupabaseAdmin()
      .from("partner_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });

  } catch (err) {
    console.error("GET /api/admin/partners/[id] error:", err);
    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const auth = await requireAdminSession(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {

    const body = await req.json();
    const updates = pickEditableFields(body);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: "No editable fields provided" }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from("partner_applications")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("PATCH /api/admin/partners/[id] error:", error);
      return NextResponse.json({ success: false, error: "Could not update" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("PATCH /api/admin/partners/[id] unexpected error:", err);
    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
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

    const { error } = await getSupabaseAdmin()
      .from("partner_applications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE /api/admin/partners/[id] error:", error);
      return NextResponse.json({ success: false, error: "Could not delete" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("DELETE /api/admin/partners/[id] unexpected error:", err);
    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}
