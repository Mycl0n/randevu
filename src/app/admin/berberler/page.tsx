"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

interface Barber {
  id: number;
  name: string;
  title: string | null;
  bio: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Barber | null>(null);
  const [form, setForm] = useState({ name: "", title: "", bio: "", sortOrder: "0" });

  const load = async () => {
    const res = await fetch("/api/admin/barbers");
    const data = await res.json();
    setBarbers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: "", title: "", bio: "", sortOrder: "0" });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (b: Barber) => {
    setEditing(b);
    setForm({ name: b.name, title: b.title || "", bio: b.bio || "", sortOrder: String(b.sortOrder) });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("İsim zorunlu"); return; }
    try {
      const res = await fetch("/api/admin/barbers", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...form, sortOrder: Number(form.sortOrder) } : form),
      });
      if (res.ok) toast.success(editing ? "Güncellendi" : "Eklendi");
      resetForm();
      load();
    } catch { toast.error("Hata"); }
  };

  const toggleActive = async (b: Barber) => {
    await fetch(`/api/admin/barbers/${b.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !b.isActive }),
    });
    toast.success(b.isActive ? "Pasif edildi" : "Aktif edildi");
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-heading font-bold">Berberler</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <FaPlus /> Yeni Berber Ekle
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{editing ? "Berber Düzenle" : "Yeni Berber"}</h2>
              <button onClick={resetForm} className="text-dark-400 hover:text-dark-700"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Ad Soyad</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Ünvan</label>
                <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Örn: Usta Berber" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Biyografi</label>
                <textarea className="input-field" rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Sıralama</label>
                <input className="input-field" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{editing ? "Güncelle" : "Ekle"}</button>
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : barbers.length === 0 ? (
        <div className="text-center py-12 text-dark-400">Henüz berber eklenmemiş.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbers.map((b) => (
            <div key={b.id} className={`card ${!b.isActive ? "opacity-60" : ""}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{b.name}</h3>
                  {b.title && <p className="text-primary-500 text-sm">{b.title}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(b)} className="text-dark-400 hover:text-primary-500"><FaEdit /></button>
                  <button onClick={() => toggleActive(b)} className={b.isActive ? "text-green-500" : "text-red-500"}>
                    {b.isActive ? <FaCheck /> : <FaTimes />}
                  </button>
                </div>
              </div>
              {b.bio && <p className="text-dark-500 text-sm">{b.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}