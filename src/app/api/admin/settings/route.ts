import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { changePassword } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();

  // Şifre değişikliği
  if (body.password) {
    await changePassword(body.password);
    return NextResponse.json({ success: true });
  }

  // Tüm ayarları toplu güncelle
  const updates = body.settings;
  if (updates && typeof updates === "object") {
    for (const [key, value] of Object.entries(updates)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: value as string },
        create: { key, value: value as string },
      });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
}