import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = {
  "/private-sailing-experience-with-snorkeling": {
    username: "Carolina",
    password: "sailing2026@",
  },

  "/craft-your-experience": {
    username: "Stefano",
    password: "riviera2026@",
  },

  "/dmitri-july-2026": {
    username: "Dmitri",
    password: "29-july-2026@",
  },
};

export async function POST(
  request: NextRequest
) {

  const body =
    await request.json();

  const { username, password } =
    body;

  for (const path in protectedRoutes) {

    const credentials =
      protectedRoutes[
        path as keyof typeof protectedRoutes
      ];

    if (
      username === credentials.username &&
      password === credentials.password
    ) {

      const response =
        NextResponse.json({
          success: true,
          redirect: path,
        });

      response.cookies.set(
        "proposalAuth",
        `${username}:${password}`,
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

  return NextResponse.json({
    success: false,
  });
}