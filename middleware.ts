import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const auth = request.headers.get("authorization");

  if (auth) {
    const encoded = auth.split(" ")[1];
    const decoded = atob(encoded);

    const [user, password] = decoded.split(":");

    if (user === "vip" && password === "portovenere") {
      return NextResponse.next();
    }
  }

  return new NextResponse("Access denied", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: "/:path*",
};