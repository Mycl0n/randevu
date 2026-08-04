"use client";

import { useEffect, useState } from "react";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { DAYS_OF_WEEK } from "@/lib/utils";

interface WorkHour {
  id: number;
  barberId: number;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isWorking: boolean;
}

interface BreakTime {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function AdminSchedule() {
  const [workHours, setWorkHours] = useState<WorkHour[]>([]);
  const [breakTimes, setBreakTimes] = useState<BreakTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [barbers, setBarbers] = useState<{ id: number; name: string }[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);

  // New break form
  const [newBreak, setNewBreak] = useState({ name: "", startTime: "12:00", endTime: "13:00" });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/barbers").then((r) => r.json()),
      fetch("/api/admin/schedule/breaks").then((r) => r.json()),
    ]).then(([barberData, breakData]) => {
      setBarbers(barberData);
      setBreakTimes(breakData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedBarber) {
      setWorkHours([]);
      return;
    }
    fetch(`/api/admin/schedule?barberId=${selectedBarber}`)
      .then((r) => r.json())
      .then(setWorkHours);
  }, [selectedBarber]);

  const updateWorkHour = async (dayOfWeek: number, field: string, value: string | boolean) => {
    const existing = workHours.find((w) => w.dayOfWeek === dayOfWeek);
    if (!existing) return;

    setWorkHours((prev) =>
      prev.map((w) => (w.dayOfWeek === dayOfWeek ? { ...w, [field]: value } : w))
    );
  };

  const saveWorkHours = async () => {
    if (!selectedBarber) return;
    const payload = workHours.map((w) => ({
      id: w.id,
      openTime: w.openTime,
      closeTime: w.closeTime,
      isWorking: w.isWorking,
    }));

    await fetch("/api/admin/schedule", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barberId: selectedBarber, hours: payload }),
    });
    toast.success("Mesai saatleri kaydedildi");
  };

  const addBreak = async () => {
    if (!newBreak.name) { toast.error("Ad gerekli"); return; }
    const res = await fetch("/api/admin/schedule/breaks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBreak),
    });
    if (res.ok) {
      toast.success("Mola eklendi");
      setNewBreak({ name: "", startTime: "12:00", endTime: "13:00" });
      const data = await fetch("/api/admin/schedule/breaks").then((r) => r.json());
      setBreakTimes(data);
    }
  };

  const toggleBreak = async (id: number, isActive: boolean) => {
    await fetch(`/api/admin/schedule/breaks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    const data = await fetch("/api/admin/schedule/breaks").then((r) => r.json());
    setBreakTimes(data);
  };

  const deleteBreak = async (id: number) => {
    await fetch(`/api/admin/schedule/breaks/${id}`, { method: "DELETE" });
    toast.success("Mola silindi");
    const data = await fetch("/api/admin/schedule/breaks").then((r) => r.json());
    setBreakTimes(data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading font-bold mb-8">Mesai Saatleri</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Berber selektörü */}
          <div className="card">
            <label className="block text-sm font-medium text-dark-700 mb-2">Berber Seçin</label>
            <select className="input-field max-w-xs" value={selectedBarber || ""} onChange={(e) => setSelectedBarber(Number(e.target.value) || null)}>
              <option value="">Seçiniz...</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Çalışma Saatleri */}
          {selectedBarber && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Haftalık Çalışma Saatleri</h2>
                <button onClick={saveWorkHours} className="btn-primary flex items-center gap-2 text-sm">
                  <FaSave /> Kaydet
                </button>
              </div>
              <div className="space-y-3">
                {DAYS_OF_WEEK.map((dayName, dayIndex) => {
                  const wh = workHours.find((w) => w.dayOfWeek === dayIndex);
                  if (!wh) return null;
                  return (
                    <div key={dayIndex} className="flex items-center gap-4 py-2 border-b border-dark-100 last:border-0">
                      <div className="w-28 font-medium">{dayName}</div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={wh.isWorking} onChange={(e) => updateWorkHour(dayIndex, "isWorking", e.target.checked)} className="w-4 h-4" />
                        <span className="text-sm text-dark-500">Çalışıyor</span>
                      </label>
                      {wh.isWorking && (
                        <div className="flex items-center gap-2 ml-auto">
                          <input type="time" className="input-field w-32" value={wh.openTime} onChange={(e) => updateWorkHour(dayIndex, "openTime", e.target.value)} />
                          <span className="text-dark-400">-</span>
                          <input type="time" className="input-field w-32" value={wh.closeTime} onChange={(e) => updateWorkHour(dayIndex, "closeTime", e.target.value)} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Molalar */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Mola Saatleri</h2>
            <div className="flex flex-wrap gap-4 mb-4 items-end">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Ad</label>
                <input className="input-field" value={newBreak.name} onChange={(e) => setNewBreak({ ...newBreak, name: e.target.value })} placeholder="Örn: Öğle Molası" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Başlangıç</label>
                <input type="time" className="input-field" value={newBreak.startTime} onChange={(e) => setNewBreak({ ...newBreak, startTime: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Bitiş</label>
                <input type="time" className="input-field" value={newBreak.endTime} onChange={(e) => setNewBreak({ ...newBreak, endTime: e.target.value })} />
              </div>
              <button onClick={addBreak} className="btn-primary flex items-center gap-2"><FaPlus /> Ekle</button>
            </div>
            <div className="space-y-2">
              {breakTimes.map((b) => (
                <div key={b.id} className={`flex items-center gap-4 p-3 rounded-lg ${b.isActive ? "bg-dark-50" : "bg-gray-100 opacity-50"}`}>
                  <span className="font-medium flex-1">{b.name}</span>
                  <span className="text-dark-500">{b.startTime} - {b.endTime}</span>
                  <button onClick={() => toggleBreak(b.id, b.isActive)} className={`text-sm ${b.isActive ? "text-green-600" : "text-red-500"}`}>
                    {b.isActive ? "Aktif" : "Pasif"}
                  </button>
                  <button onClick={() => deleteBreak(b.id)} className="text-red-400 hover:text-red-600">
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tatil Günleri yönetimi basit bir şekilde */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Tatil Günleri</h2>
            <p className="text-dark-400 text-sm">
              Tatil günlerini ekleyip yönetebilirsiniz. Tatil günlerinde yeni randevu alınamaz.
            </p>
            {/* Tatil yönetimi - burada basit bir placeholder bırakıyorum */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              Tatil yönetimi API'ı hazır. Tatil eklemek için admin panel randevu sayfasında tarih 
              bloğu pasifleştirilir. Dinamik tatil ekleme arayüzü talep üzerine eklenecektir.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}