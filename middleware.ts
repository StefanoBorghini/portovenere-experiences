import { NextRequest, NextResponse } from "next/server";

// =========================================================
// Route private a corrispondenza ESATTA (una singola pagina
// ciascuna, es. link di proposal privata per un cliente specifico)
// =========================================================

const protectedRoutes = {
  "/craft-your-experience": {
    username: process.env.PRIVATE_LOGIN_STEFANO_USER!,
    password: process.env.PRIVATE_LOGIN_STEFANO_PASS!,
    expiresAt: "2027-05-23T23:59:59",
  },
};

// =========================================================
// Gate dedicato per /admin — corrispondenza "inizia con",
// protegge automaticamente tutte le sotto-pagine (/admin/experiences,
// /admin/enhancements, ecc.) senza doverle elencare una per una.
// E' una barriera IN PIU', indipendente dal login Supabase che
// gestisce l'accesso vero e proprio: anche se qualcuno bypassasse
// il controllo client-side del pannello admin, trova comunque
// questo muro prima ancora di arrivare alla pagina.
// =========================================================

const ADMIN_GATE_USER = process.env.ADMIN_GATE_USER!;
const ADMIN_GATE_PASS = process.env.ADMIN_GATE_PASS!;
const ADMIN_GATE_COOKIE = "adminGateAuth";

export function middleware(request: NextRequest) {

  const path = request.nextUrl.pathname;

  // ===== GATE ADMIN =====

  if (path.startsWith("/admin") && path !== "/admin-gate") {

    const authCookie = request.cookies.get(ADMIN_GATE_COOKIE);
    const expectedValue = `${ADMIN_GATE_USER}:${ADMIN_GATE_PASS}`;

    if (authCookie?.value === expectedValue) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/admin-gate", request.url);
    loginUrl.searchParams.set("redirect", path);

    return NextResponse.redirect(loginUrl);
  }

  // ===== ROUTE PRIVATE A CORRISPONDENZA ESATTA =====

  const credentials =
    protectedRoutes[path as keyof typeof protectedRoutes];

  if (!credentials) {
    return NextResponse.next();
  }

  if (new Date() > new Date(credentials.expiresAt)) {
    return new NextResponse(
      "This private proposal has expired.",
      { status: 403 }
    );
  }

  const authCookie = request.cookies.get("proposalAuth");

  if (
    authCookie?.value ===
    `${credentials.username}:${credentials.password}`
  ) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/private-access", request.url);
  loginUrl.searchParams.set("redirect", path);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/:path*"],
};