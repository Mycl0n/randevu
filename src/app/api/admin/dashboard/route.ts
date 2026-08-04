import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    cancelledAppointments,
    totalServices,
    activeServices,
    totalBarbers,
    todayAppointments,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.count({ where: { status: "CONFIRMED" } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
    prisma.service.count(),
    prisma.service.count({ where: { isActive: true } }),
    prisma.barber.count({ where: { isActive: true } }),
    prisma.appointment.count({ where: { date: { gte: todayStart, lte: todayEnd } } }),
    prisma.appointment.aggregate({
      _sum: { totalPrice: true },
      where: { status: { in: ["CONFIRMED", "COMPLETED"] }, date: { gte: monthStart } },
    }),
  ]);

  return NextResponse.json({
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    cancelledAppointments,
    totalServices,
    activeServices,
    totalBarbers,
    todayAppointments,
    monthlyRevenue: monthlyRevenue._sum.totalPrice || 0,
  });
}