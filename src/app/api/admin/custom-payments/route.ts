import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";

// =========================================================
// GET /api/admin/custom-payments
// custom_payments ha RLS senza policy pubblica (stesso trattamento di
// concierge_operator_status/operators) — il client admin (anon) non
// puo' leggerla direttamente, serve una route autenticata che usi il
// service role, stesso pattern di
// /api/admin/concierge-operator-status.
// =========================================================

export async function GET(req: NextRequest) {

  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");

  if (!accessToken) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData, error: authError } = await supabase.auth.getUser(accessToken);

  if (authError || !userData?.user) {
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
