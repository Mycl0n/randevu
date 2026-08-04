"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", price: "", duration: "", description: "", sortOrder: "" });

  const load = async () => {
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    setServices(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: "", price: "", duration: "", description: "", sortOrder: "0" });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: s.name,
      price: s.price.toString(),
      duration: s.duration.toString(),
      description: s.description || "",
      sortOrder: s.sortOrder.toString(),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.duration) {
      toast.error("İsim, fiyat ve süre zorunludur");
      return;
    }
    const body = {
      name: form.name,
      price: Number(form.price),
      duration: Number(form.duration),
      description: form.description || null,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      if (editing) {
        const res = await fetch(`/api/admin/services/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, rowId: editing.id }),
        });
        toast.success("Hizmet güncellendi");
      } else {
        await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("Hizmet eklendi");
      }
      resetForm();
      load();
    } catch {
      toast.error("Bir hata oluştu");
    }
  };

  const toggleActive = async (s: Service) => {
    const newStatus = !s.isActive;
    await fetch(`/api/admin/services/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rowId: s.id, isActive: newStatus }),
    });
    toast.success(newStatus ? "Hizmet aktif edildi" : "Hizmet pasif edildi");
    load();
  };

  const formatPrice = (p: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(p);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-heading font-bold">Hizmetler</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <FaPlus /> Yeni Hizmet Ekle
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{editing ? "Hizmeti Düzenle" : "Yeni Hizmet"}</h2>
              <button onClick={resetForm} className="text-dark-400 hover:text-dark-700"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Hizmet Adı</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn: Saç Kesimi" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Fiyat (₺)</label>
                  <input className="input-field" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="250" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Süre (dk)</label>
                  <input className="input-field" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="45" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Açıklama</label>
                <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="İsteğe bağlı" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Sıralama</label>
                <input className="input-field" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editing ? "Güncelle" : "Ekle"}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 text-dark-400">Henüz hizmet eklenmemiş.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className={`card ${!s.isActive ? "opacity-60" : ""}`}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">{s.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)} className="text-dark-400 hover:text-primary-500">
                    <FaEdit />
                  </button>
                  <button onClick={() => toggleActive(s)} className={s.isActive ? "text-green-500" : "text-red-500"}>
                    {s.isActive ? <FaCheck /> : <FaTimes />}
                  </button>
                </div>
              </div>
              <p className="text-2xl font-bold text-primary-500 mb-2">{formatPrice(s.price)}</p>
              <p className="text-dark-500 text-sm">{s.duration} dakika</p>
              {s.description && <p className="text-dark-400 text-sm mt-2">{s.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}