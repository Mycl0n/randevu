import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json(services);
  } catch {
    return NextResponse.json({ error: "Yükleme hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const body = await req.json();
    const service = await prisma.service.create({
      data: {
        name: body.name,
        price: Number(body.price),
        duration: Number(body.duration),
        description: body.description || null,
        sortOrder: Number(body.sortOrder) || 0,
      },
    });
    return NextResponse.json(service, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Oluşturma hatası" }, { status: 500 });
  }
}