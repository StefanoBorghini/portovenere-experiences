import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes: Record<string, string> = {
  "/private-sailing-experience-with-snorkeling": "sailing2026@",
    username: "Carolina",
    password: "sailing2026@",
    expiresAt: "2026-05-17T23:59:59",
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const requiredPassword = protectedRoutes[path];

  if (!requiredPassword) {
    return NextResponse.next();
  }

  const auth = request.headers.get("authorization");

  if (auth) {
    const encoded = auth.split(" ")[1];
    const decoded = atob(encoded);

    const [user, password] = decoded.split(":");

    if (password === requiredPassword) {

      const response = NextResponse.next();

response.cookies.set(
  "clientName",
  user,
  {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  }
);      

      return response;
    }
  }

  return new NextResponse("Protected Area", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Private Experience"',
    },
  });
}

export const config = {
  matcher: ["/:path*"],
};