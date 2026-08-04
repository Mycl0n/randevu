import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, customerEmail, date, startTime, serviceId, barberId } = body;

    if (!customerName || !customerPhone || !date || !startTime || !serviceId) {
      return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: "Geçersiz hizmet" }, { status: 400 });
    }

    const [hour, minute] = startTime.split(":").map(Number);
    const startDateTime = new Date(date);
    startDateTime.setHours(hour, minute, 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);

    // Çakışma kontrolü
    const conflict = await prisma.appointment.findFirst({
      where: {
        date: new Date(date),
        status: { not: "CANCELLED" },
        OR: barberId
          ? [{ barberId: Number(barberId) }]
          : [{}],
        startTime: { lt: endDateTime },
        endTime: { gt: startDateTime },
      },
    });

    if (conflict) {
      return NextResponse.json({ error: "Bu saat aralığı dolu" }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        date: new Date(date),
        startTime: startDateTime,
        endTime: endDateTime,
        serviceId: service.id,
        barberId: barberId ? Number(barberId) : null,
        totalPrice: Number(service.price),
        duration: service.duration,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Randevu oluşturma hatası:", error);
    return NextResponse.json({ error: "Randevu oluşturulamadı" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const barberId = searchParams.get("barberId");

  const where: any = { status: { not: "CANCELLED" } };
  if (date) where.date = new Date(date);
  if (barberId) where.barberId = Number(barberId);

  try {
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: true,
        barber: true,
      },
      orderBy: { startTime: "asc" },
    });
    return NextResponse.json(appointments);
  } catch {
    return NextResponse.json({ error: "Randevular yüklenemedi" }, { status: 500 });
  }
}