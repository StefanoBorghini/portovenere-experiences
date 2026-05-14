import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes: Record<string, string> = {
  "/private-sailing-experience-with-snorkeling": "sailing2026",
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

      response.cookies.set("clientName", user);

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