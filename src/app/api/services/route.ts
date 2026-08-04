import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(services);
  } catch {
    return NextResponse.json({ error: "Hizmetler yüklenemedi" }, { status: 500 });
  }
}