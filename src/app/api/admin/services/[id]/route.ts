import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const id = req.nextUrl.pathname.split("/").pop();
  if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

  try {
    const body = await req.json();
    const { rowId, ...data } = body;

    const service = await prisma.service.update({
      where: { id: Number(id) },
      data: {
        ...data,
        price: data.price ? Number(data.price) : undefined,
        duration: data.duration ? Number(data.duration) : undefined,
        sortOrder: data.sortOrder ? Number(data.sortOrder) : undefined,
      },
    });
    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ error: "Güncelleme hatası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const id = req.nextUrl.pathname.split("/").pop();
  if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

  try {
    await prisma.service.update({
      where: { id: Number(id) },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Silme hatası" }, { status: 500 });
  }
}