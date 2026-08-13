import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";

// =========================================================
// GET/DELETE /api/admin/custom-payments
// custom_payments ha RLS senza policy pubblica (stesso trattamento di
// concierge_operator_status/operators) — il client admin (anon) non
// puo' leggerla/scriverla direttamente, serve una route autenticata
// che usi il service role, stesso pattern di
// /api/admin/concierge-operator-status.
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

  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("custom_payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET custom-payments error:", error);
    return NextResponse.json({ success: false, error: "Could not load rows" }, { status: 500 });
  }

  return NextResponse.json({ success: true, rows: data || [] });
}

// Cancella un pagamento custom dalla lista (es. voci di test) — non
// tocca Stripe: la Checkout Session, se ancora aperta, scade comunque
// da sola secondo le sue regole normali. Solo il record locale sparisce.
export async function DELETE(req: NextRequest) {
  const user = await requireAdmin(req);

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("custom_payments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("DELETE custom-payments error:", error);
    return NextResponse.json({ success: false, error: "Could not delete row" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
