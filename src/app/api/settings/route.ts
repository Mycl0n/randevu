import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: { not: "admin_password_hash" },
      },
    });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Ayarlar yüklenemedi" }, { status: 500 });
  }
}