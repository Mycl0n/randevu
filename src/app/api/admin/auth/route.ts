import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyPassword, destroySession, verifySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password } = body;

  const isValid = await verifyPassword(password);
  if (!isValid) {
    return NextResponse.json({ error: "Hatalı şifre" }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const isAuthed = await verifySession();
  return NextResponse.json({ authenticated: isAuthed });
}