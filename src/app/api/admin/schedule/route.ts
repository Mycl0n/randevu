import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const barberId = searchParams.get("barberId");

  if (!barberId) {
    return NextResponse.json({ error: "barberId gerekli" }, { status: 400 });
  }

  try {
    const hours = await prisma.workingHour.findMany({
      where: { barberId: Number(barberId) },
      orderBy: { dayOfWeek: "asc" },
    });
    return NextResponse.json(hours);
  } catch {
    return NextResponse.json({ error: "Yükleme hatası" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const body = await req.json();
    const { barberId, hours } = body;

    if (!barberId || !hours || !Array.isArray(hours)) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    for (const h of hours) {
      await prisma.workingHour.update({
        where: { id: h.id },
        data: {
          openTime: h.openTime,
          closeTime: h.closeTime,
          isWorking: h.isWorking,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Güncelleme hatası" }, { status: 500 });
  }
}