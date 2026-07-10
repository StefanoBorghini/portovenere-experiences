import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = {
  "/craft-your-experience": {
    username: process.env.PRIVATE_LOGIN_STEFANO_USER!,
    password: process.env.PRIVATE_LOGIN_STEFANO_PASS!,
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