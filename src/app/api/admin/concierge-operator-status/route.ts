import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";

// =========================================================
// GET/PATCH /api/admin/concierge-operator-status
// concierge_operator_status ha RLS senza policy pubblica (stesso
// trattamento di operators) — il client admin (anon) non puo'
// leggerla/scriverla direttamente, serve una route autenticata che usi
// il service role, stesso pattern di /api/admin/request-payment.
// =========================================================

async function requireAdmin(req: NextRequest) {
  if (!supabase) return null;

  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");

  if (!accessToken) return null;

  const { data: userData, error } = await supabase.auth.getUser(accessToken);

  if (error || !userData?.user) return null;

  return userData.user;
}

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const leadId = req.nextUrl.searchParams.get("leadId");

  if (!leadId) {
    return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("concierge_operator_status")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at");

  if (error) {
    console.error("GET concierge-operator-status error:", error);
    return NextResponse.json({ success: false, error: "Could not load rows" }, { status: 500 });
  }

  return NextResponse.json({ success: true, rows: data || [] });
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin(req);

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id, updates } = await req.json();

  if (!id || !updates) {
    return NextResponse.json({ success: false, error: "Missing id or updates" }, { status: 400 });
  }

  // Whitelist esplicita — mai passare l'oggetto "updates" del client
  // direttamente a .update(), altrimenti chiunque potrebbe riscrivere
  // lead_id/item_id/prezzo tramite questa route.
  const allowedFields: Record<string, unknown> = {};

  if (typeof updates.status === "string") allowedFields.status = updates.status;
  if (typeof updates.notes === "string" || updates.notes === null) allowedFields.notes = updates.notes;
  if (typeof updates.item_operator_name === "string" || updates.item_operator_name === null) {
    allowedFields.item_operator_name = updates.item_operator_name;
  }

  if (Object.keys(allowedFields).length === 0) {
    return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 });
  }

  allowedFields.updated_at = new Date().toISOString();

  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("concierge_operator_status")
    .update(allowedFields)
    .eq("id", id);

  if (error) {
    console.error("PATCH concierge-operator-status error:", error);
    return NextResponse.json({ success: false, error: "Could not update row" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
