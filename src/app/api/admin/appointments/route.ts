import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  const where: any = {};
  if (date) where.date = new Date(date);
  if (status) where.status = status;

  try {
    const appointments = await prisma.appointment.findMany({
      where,
      include: { service: true, barber: true },
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
      take: 100,
    });
    return NextResponse.json(appointments);
  } catch {
    return NextResponse.json({ error: "Yükleme hatası" }, { status: 500 });
  }
}