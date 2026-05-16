import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  
};

export function middleware(
  request: NextRequest
) {

  const path =
    request.nextUrl.pathname;

  const credentials =
    protectedRoutes[
      path as keyof typeof protectedRoutes
    ];

  // PUBLIC ROUTE

  if (!credentials) {
    return NextResponse.next();
  }

  // EXPIRED

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

  const auth =
    request.headers.get(
      "authorization"
    );

  if (auth) {

    const encoded =
      auth.split(" ")[1];

    const decoded =
      atob(encoded);

    const [user, password] =
      decoded.split(":");

    // VALID LOGIN

    if (
      user === credentials.username &&
      password === credentials.password
    ) {

      const response =
        NextResponse.next();

      response.cookies.set(
        "clientName",
        user,
        {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge:
            60 * 60 * 24,
        }
      );

      return response;
    }
  }

  // LOGIN POPUP

  return new NextResponse(
    "Protected Area",
    {
      status: 401,
      headers: {
        "WWW-Authenticate":
          'Basic realm="Private Experience"',
      },
    }
  );
}

export const config = {
  matcher: ["/:path*"],
};