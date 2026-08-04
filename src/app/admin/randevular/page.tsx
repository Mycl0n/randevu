"use client";

import { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaCalendarAlt, FaSearch, FaUserClock } from "react-icons/fa";
import toast from "react-hot-toast";
import { STATUS_MAP, formatDate, formatTime } from "@/lib/utils";

interface Appointment {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  duration: number;
  adminNote: string | null;
  createdAt: string;
  service: { name: string; price: number };
  barber: { name: string } | null;
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [noteModal, setNoteModal] = useState<{ id: number; note: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (dateFilter) params.set("date", dateFilter);
    const res = await fetch(`/api/admin/appointments?${params}`);
    const data = await res.json();
    if (Array.isArray(data)) setAppointments(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter, dateFilter]);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/appointments/${Number(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    toast.success("Durum güncellendi");
    load();
  };

  const updateNote = async () => {
    if (!noteModal) return;
    await fetch(`/api/admin/appointments/${Number(noteModal.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: noteModal.id, adminNote: noteModal.note }),
    });
    toast.success("Not kaydedildi");
    setNoteModal(null);
    load();
  };

  const formatPrice = (p: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(p);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading font-bold mb-8">Randevular</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-dark-700 mb-1">Tarihe Göre</label>
            <input type="date" className="input-field" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-dark-700 mb-1">Duruma Göre</label>
            <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tümü</option>
              <option value="PENDING">Bekleyen</option>
              <option value="CONFIRMED">Onaylanan</option>
              <option value="CANCELLED">İptal Edilen</option>
              <option value="COMPLETED">Tamamlanan</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setStatusFilter(""); setDateFilter(""); }} className="btn-secondary">
              Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="card text-center py-12 text-dark-400">Henüz randevu bulunmuyor.</div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => {
            const statusInfo = STATUS_MAP[a.status] || { label: a.status, color: "bg-gray-100" };
            return (
              <div key={a.id} className="card flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{a.customerName}</span>
                    <span className="text-dark-400 text-sm">{a.customerPhone}</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-dark-500">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> {formatDate(a.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaUserClock /> {formatTime(a.startTime)} - {formatTime(a.endTime)} ({a.duration} dk)
                    </span>
                    <span className="font-medium text-dark-700">{a.service.name}</span>
                    <span className="font-bold text-primary-500">{formatPrice(a.totalPrice)}</span>
                    {a.barber && <span className="text-dark-700">Berber: {a.barber.name}</span>}
                  </div>
                  {a.adminNote && (
                    <p className="text-sm text-dark-400 mt-1">Not: {a.adminNote}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {a.status === "PENDING" && (
                    <>
                      <button onClick={() => updateStatus(a.id, "CONFIRMED")} className="btn-primary text-sm py-2 px-3">
                        Onayla
                      </button>
                      <button onClick={() => updateStatus(a.id, "CANCELLED")} className="btn-secondary text-sm py-2 px-3 text-red-600">
                        İptal
                      </button>
                    </>
                  )}
                  {a.status === "CONFIRMED" && (
                    <button onClick={() => updateStatus(a.id, "COMPLETED")} className="btn-primary text-sm py-2 px-3 bg-green-500 hover:bg-green-600">
                      Tamamla
                    </button>
                  )}
                  <button onClick={() => setNoteModal({ id: a.id, note: a.adminNote || "" })} className="text-dark-400 hover:text-primary-500 text-sm">
                    Not Ekle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Admin Notu</h2>
            <textarea
              className="input-field mb-4"
              rows={3}
              value={noteModal.note}
              onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
              placeholder="Randevu hakkında not..."
            />
            <div className="flex gap-3">
              <button onClick={updateNote} className="btn-primary flex-1">Kaydet</button>
              <button onClick={() => setNoteModal(null)} className="btn-secondary flex-1">İptal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}