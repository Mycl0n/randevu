"use client";

import { useEffect, useState } from "react";
import { FaSave, FaKey } from "react-icons/fa";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPassword: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, string> = {};
        data.forEach((s: { key: string; value: string }) => { map[s.key] = s.value; });
        setSettings(map);
        setLoading(false);
      });
  }, []);

  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        toast.success("Ayarlar kaydedildi");
      } else {
        toast.error("Kaydetme başarısız");
      }
    } catch {
      toast.error("Bir hata oluştu");
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      toast.error("Şifre en az 4 karakter olmalı");
      return;
    }
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordForm.newPassword }),
      });
      if (res.ok) {
        toast.success("Şifre değiştirildi");
        setPasswordForm({ newPassword: "", confirm: "", current: "" });
      } else {
        toast.error("Şifre değiştirilemedi");
      }
    } catch {
      toast.error("Bir hata oluştu");
    }
  };

  const fieldGroups = [
    {
      title: "Site Bilgileri",
      fields: [
        { key: "site_name", label: "Site Adı", type: "text" },
        { key: "site_description", label: "Site Açıklaması", type: "text" },
        { key: "logo_url", label: "Logo URL", type: "text" },
      ],
    },
    {
      title: "Hero Bölümü",
      fields: [
        { key: "hero_title", label: "Hero Başlık", type: "text" },
        { key: "hero_subtitle", label: "Hero Alt Başlık", type: "text" },
      ],
    },
    {
      title: "Hakkımızda",
      fields: [
        { key: "about_title", label: "Hakkımızda Başlık", type: "text" },
        { key: "about_text", label: "Hakkımızda Metni", type: "textarea" },
      ],
    },
    {
      title: "İletişim Bilgileri",
      fields: [
        { key: "address", label: "Adres", type: "textarea" },
        { key: "phone", label: "Telefon", type: "text" },
        { key: "email", label: "E-posta", type: "text" },
      ],
    },
    {
      title: "Sosyal Medya",
      fields: [
        { key: "instagram", label: "Instagram URL", type: "text" },
        { key: "facebook", label: "Facebook URL", type: "text" },
        { key: "whatsapp", label: "WhatsApp No (90555...)", type: "text" },
      ],
    },
    {
      title: "Çalışma Saatleri",
      fields: [
        { key: "work_start", label: "Açılış Saati", type: "time" },
        { key: "work_end", label: "Kapanış Saati", type: "time" },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-heading font-bold">Genel Ayarlar</h1>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <FaSave /> Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {fieldGroups.map((group) => (
          <div key={group.title} className="card">
            <h2 className="text-lg font-semibold mb-4">{group.title}</h2>
            <div className="space-y-4">
              {group.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-dark-700 mb-1">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      className="input-field"
                      rows={3}
                      value={settings[field.key] || ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                    />
                  ) : (
                    <input
                      type={field.type}
                      className="input-field"
                      value={settings[field.key] || ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Password Section */}
      <div className="mt-8 card max-w-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaKey /> Admin Şifresini Değiştir
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Yeni Şifre</label>
            <input
              type="password"
              className="input-field"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              className="input-field"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
            />
          </div>
          <button onClick={handlePasswordChange} className="btn-primary">
            Şifreyi Güncelle
          </button>
        </div>
      </div>
    </div>
  );
}