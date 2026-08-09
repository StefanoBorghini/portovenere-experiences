import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  const { username, password } = await req.json();

  const expectedUser = process.env.ADMIN_GATE_USER;
  const expectedPass = process.env.ADMIN_GATE_PASS;

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("adminGateAuth", `${username}:${password}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    // 7 giorni: non devi rifare login ogni volta che apri il pannello,
    // ma comunque scade — non e' una sessione infinita.
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}