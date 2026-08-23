import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// =========================================================
// Stesso pattern gia' usato da /api/admin/send-reminder e dalle
// altre route admin (operators, custom-payments, ecc.): verifica
// il Bearer token (access_token della sessione Supabase lato
// client) contro supabase.auth.getUser(). Estratto qui perche' le
// route di partner_applications (list/detail/update/delete/
// contract) lo ripeterebbero identico altrimenti.
//
// Ritorna { ok: true } se autorizzato, altrimenti { ok: false,
// response } gia' pronto da restituire cosi' com'e' dalla route.
// =========================================================

export async function requireAdminSession(req: NextRequest) {

  if (!supabase) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: "Supabase not configured" },
        { status: 500 }
      ),
    };
  }

  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");

  if (!accessToken) {
    return {
      ok: false as const,
      response: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: userData, error: authError } = await supabase.auth.getUser(accessToken);

  if (authError || !userData?.user) {
    return {
      ok: false as const,
      response: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true as const };
}
