import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const id = req.nextUrl.pathname.split("/").pop();

  await prisma.barber.update({
    where: { id: Number(id) },
    data: { isActive: body.isActive },
  });
  return NextResponse.json({ success: true });
}