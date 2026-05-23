import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = {
  "/private-sailing-experience-with-snorkeling": {
    username: "Carolina",
    password: "sailing2026@",
    expiresAt: "2026-06-01T23:59:59",
  },

  "/craft-your-experience": {
    username: "Stefano",
    password: "riviera2026@",
    expiresAt: "2026-05-23T23:59:59",
  },

  "/dmitri-july-2026": {
    username: "Dmitri",
    password: "29-july-2026@",
    expiresAt: "2026-05-23T23:59:59",
  },
};

export function middleware(request: NextRequest) {

  const path = request.nextUrl.pathname;

  const credentials =
    protectedRoutes[
      path as keyof typeof protectedRoutes
    ];

  // PUBLIC ROUTE

  if (!credentials) {
    return NextResponse.next();
  }

  // CHECK EXPIRATION

  if (
    new Date() >
    new Date(credentials.expiresAt)
  ) {

    return new NextResponse(
      "This private proposal has expired.",
      {
        status: 403,
      }
    );
  }

  // CHECK COOKIE

  const authCookie =
    request.cookies.get("proposalAuth");

  if (
    authCookie?.value ===
    `${credentials.username}:${credentials.password}`
  ) {

    return NextResponse.next();
  }

  // REDIRECT TO LOGIN PAGE

  const loginUrl = new URL(
    "/private-access",
    request.url
  );

  loginUrl.searchParams.set(
    "redirect",
    path
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/:path*"],
};