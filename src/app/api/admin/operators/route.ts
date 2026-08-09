import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";

// =========================================================
// GET/POST /api/admin/operators
// operators non ha nessuna policy RLS pubblica (stesso trattamento
// di partner_applications) — ogni accesso, anche la sola lettura
// dall'admin, passa da qui con la service role key, non dal client
// Supabase anon usato altrove nelle pagine admin.
// =========================================================

async function requireAdmin(req: NextRequest) {

  if (!supabase) {
    return { error: NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 500 }) };
  }

  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");

  if (!accessToken) {
    return { error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: userData, error: authError } = await supabase.auth.getUser(accessToken);

  if (authError || !userData?.user) {
    return { error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }

  return { error: null };
}

export async function GET(req: NextRequest) {

  const { error } = await requireAdmin(req);
  if (error) return error;

  const { data, error: fetchError } = await getSupabaseAdmin()
    .from("operators")
    .select("*")
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("admin/operators GET error:", fetchError);
    return NextResponse.json({ success: false, error: "Could not load operators" }, { status: 500 });
  }

  return NextResponse.json({ success: true, operators: data || [] });
}

export async function POST(req: NextRequest) {

  const { error } = await requireAdmin(req);
  if (error) return error;

  const { name, email } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ success: false, error: "Missing name or email" }, { status: 400 });
  }

  const { data, error: insertError } = await getSupabaseAdmin()
    .from("operators")
    .insert({ name, email })
    .select()
    .single();

  if (insertError) {
    console.error("admin/operators POST error:", insertError);
    return NextResponse.json({ success: false, error: "Could not create operator" }, { status: 500 });
  }

  return NextResponse.json({ success: true, operator: data });
}
