import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const breaks = await prisma.breakTime.findMany({ orderBy: { startTime: "asc" } });
    return NextResponse.json(breaks);
  } catch {
    return NextResponse.json({ error: "Yükleme hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const body = await req.json();
    const breakTime = await prisma.breakTime.create({
      data: {
        name: body.name,
        startTime: body.startTime,
        endTime: body.endTime,
        isActive: true,
      },
    });
    return NextResponse.json(breakTime, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Oluşturma hatası" }, { status: 500 });
  }
}