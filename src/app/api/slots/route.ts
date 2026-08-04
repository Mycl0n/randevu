import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const barberId = searchParams.get("barberId");
  const serviceId = searchParams.get("serviceId");

  if (!date) return NextResponse.json({ error: "Tarih gerekli" }, { status: 400 });

  try {
    const workStart = await prisma.setting.findUnique({ where: { key: "work_start" } });
    const workEnd = await prisma.setting.findUnique({ where: { key: "work_end" } });

    const openTime = workStart?.value || "09:00";
    const closeTime = workEnd?.value || "19:00";
    const [openH, openM] = openTime.split(":").map(Number);
    const [closeH, closeM] = closeTime.split(":").map(Number);

    // Tüm randevuları getir
    const where: any = {
      date: new Date(date),
      status: { not: "CANCELLED" },
    };
    if (barberId && barberId !== "") {
      where.barberId = Number(barberId);
    }

    const appts = await prisma.appointment.findMany({
      where,
      select: { startTime: true, endTime: true, barberId: true },
    });

    // Tüm olası 15dk'lık slot'ları üret
    const slots: string[] = [];
    const startMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;

    for (let m = startMinutes; m < endMinutes; m += 15) {
      const hh = Math.floor(m / 60).toString().padStart(2, "0");
      const mm = (m % 60).toString().padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }

    // Dolu slotları filtrele (standart 30 dk minimum randevu süresi)
    const blocked = new Set<number>();
    for (const a of appts) {
      const aStart = a.startTime ? new Date(a.startTime) : new Date();
      const aEnd = a.endTime ? new Date(a.endTime) : new Date();
      const aStartM = aStart.getHours() * 60 + aStart.getMinutes();
      const aEndM = aEnd.getHours() * 60 + aEnd.getMinutes();
      for (let m = startMinutes; m < endMinutes; m += 15) {
        if (m < aEndM && m + 15 > aStartM) {
          blocked.add(m);
        }
      }
    }

    // Molaları getir ve engelle
    const breakTimes = await prisma.breakTime.findMany({ where: { isActive: true } });
    for (const b of breakTimes) {
      const [bStartH, bStartM] = b.startTime.split(":").map(Number);
      const [bEndH, bEndM] = b.endTime.split(":").map(Number);
      const bStart = bStartH * 60 + bStartM;
      const bEnd = bEndH * 60 + bEndM;
      for (let m = startMinutes; m < endMinutes; m += 15) {
        if (m < bEnd && m + 15 > bStart) blocked.add(m);
      }
    }

    // Filtrelenmiş slotlar
    const availableSlots = slots.filter((slot) => {
      const [h, m] = slot.split(":").map(Number);
      const min = h * 60 + m;
      return !blocked.has(min);
    });

    return NextResponse.json({
      slots: availableSlots.map((s) => ({ time: s })),
      bookedSlots: appts.map((a) => ({ start: a.startTime, end: a.endTime })),
    });
  } catch (error) {
    console.error("Slots error:", error);
    return NextResponse.json({ slots: [], bookedSlots: [] }, { status: 500 });
  }
}