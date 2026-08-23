import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { requireAdminSession } from "@/lib/auth/requireAdminSession";

// =========================================================
// GET /api/admin/partners — lista candidature, piu' recenti prima.
// partner_applications ha RLS senza policy pubbliche (vedi
// supabase-migrations/2026_partner_applications.sql), quindi anche
// l'admin deve passare da qui (service role key), non dal client
// supabase normale come leadRepository.ts.
// =========================================================

export async function GET(req: NextRequest) {

  const auth = await requireAdminSession(req);
  if (!auth.ok) return auth.response;

  try {

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("partner_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/admin/partners error:", error);
      return NextResponse.json({ success: false, error: "Could not load partners" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (err) {
    console.error("GET /api/admin/partners unexpected error:", err);
    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}
