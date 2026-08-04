"use client";

import { useEffect, useState } from "react";
import {
  FaCut,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaUserFriends,
  FaMoneyBillWave,
} from "react-icons/fa";
import Link from "next/link";

interface Stats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  totalServices: number;
  activeServices: number;
  totalBarbers: number;
  todayAppointments: number;
  monthlyRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  const cards = [
    { label: "Bugünkü Randevular", value: stats.todayAppointments, icon: FaCalendarAlt, color: "bg-blue-500", href: "/admin/randevular" },
    { label: "Bekleyen Randevular", value: stats.pendingAppointments, icon: FaSpinner, color: "bg-yellow-500", href: "/admin/randevular?status=PENDING" },
    { label: "Onaylanan Randevular", value: stats.confirmedAppointments, icon: FaCheckCircle, color: "bg-green-500", href: "/admin/randevular?status=CONFIRMED" },
    { label: "Aktif Hizmetler", value: stats.activeServices, icon: FaCut, color: "bg-primary-500", href: "/admin/hizmetler" },
    { label: "Berberler", value: stats.totalBarbers, icon: FaUserFriends, color: "bg-purple-500", href: "/admin/berberler" },
    { label: "Aylık Ciro", value: `${stats.monthlyRevenue.toLocaleString("tr-TR")} ₺`, icon: FaMoneyBillWave, color: "bg-blue-500", href: "/admin/randevular" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <Link key={i} href={card.href} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`${card.color} p-3 rounded-xl`}>
                <card.icon className="text-xl" />
              </div>
              <div>
                <p className="text-dark-500 text-sm">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}