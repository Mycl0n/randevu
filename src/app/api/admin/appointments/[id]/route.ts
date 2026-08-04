import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, status, adminNote } = body;

    const appointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data: {
        ...(status && { status }),
        ...(adminNote !== undefined && { adminNote }),
      },
      include: { service: true, barber: true },
    });
    return NextResponse.json(appointment);
  } catch {
    return NextResponse.json({ error: "Güncelleme hatası" }, { status: 500 });
  }
}