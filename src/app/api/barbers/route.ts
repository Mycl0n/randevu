import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const barbers = await prisma.barber.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(barbers);
  } catch {
    return NextResponse.json({ error: "Berberler yüklenemedi" }, { status: 500 });
  }
}