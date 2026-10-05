import { NextRequest, NextResponse } from "next/server";
import { getPublicEventFeed } from "@/lib/supabase/eventRepository";

// =========================================================
// GET /api/events/feed — endpoint pubblico (nessun requireAdminSession,
// nessun dato sensibile: solo eventi attivi gia' pensati per essere
// mostrati a chiunque) consumato dal widget embeddabile su un sito
// esterno (WordPress, dominio diverso) — vedi
// public/widget/events-widget.js. CORS aperto perche' e' un feed in
// sola lettura, non un'azione: nessuna sessione/cookie coinvolti,
// stesso principio di un RSS feed pubblico.
//
// Cache breve lato CDN (Vercel/Next rispettano Cache-Control anche su
// route dinamiche): il feed cambia raramente, non serve ricalcolarlo
// a ogni singola richiesta da ogni widget embeddato nel mondo.
// =========================================================

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(req: NextRequest) {

  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 20;

  const siteUrl = `${url.protocol}//${url.host}`;

  try {

    const events = await getPublicEventFeed(limit, siteUrl);

    return NextResponse.json(
      { success: true, events },
      {
        headers: {
          ...CORS_HEADERS,
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );

  } catch (err) {

    console.error("api/events/feed error:", err);

    return NextResponse.json(
      { success: false, error: "Could not load events" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
