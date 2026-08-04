import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const barbers = await prisma.barber.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(barbers);
}

export async function POST(req: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const barber = await prisma.barber.create({
    data: {
      name: body.name,
      title: body.title,
      bio: body.bio,
      sortOrder: Number(body.sortOrder) || 0,
    },
  });

  // Create working hours for the new barber
  for (let day = 0; day < 7; day++) {
    await prisma.workingHour.create({
      data: {
        barberId: barber.id,
        dayOfWeek: day,
        openTime: "09:00",
        closeTime: "19:00",
        isWorking: day !== 0,
      },
    });
  }

  return NextResponse.json(barber, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;

  const barber = await prisma.barber.update({
    where: { id: Number(id) },
    data: {
      ...data,
      sortOrder: data.sortOrder ? Number(data.sortOrder) : undefined,
    },
  });
  return NextResponse.json(barber);
}