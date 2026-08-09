import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;

  const { data, error: fetchError } = await getSupabaseAdmin()
    .from("operators")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !data) {
    return NextResponse.json({ success: false, error: "Operator not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, operator: data });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const { name, email } = await req.json();

  const updates: Record<string, string> = {};
  if (typeof name === "string" && name.trim()) updates.name = name;
  if (typeof email === "string" && email.trim()) updates.email = email;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: "Nothing to update" }, { status: 400 });
  }

  const { data, error: updateError } = await getSupabaseAdmin()
    .from("operators")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.error("admin/operators/[id] PATCH error:", updateError);
    return NextResponse.json({ success: false, error: "Could not update operator" }, { status: 500 });
  }

  return NextResponse.json({ success: true, operator: data });
}
