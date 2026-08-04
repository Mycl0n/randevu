"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaArrowRight, FaCheck, FaPhone, FaEnvelope, FaUser } from "react-icons/fa";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatShortDate } from "@/lib/utils";

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

interface Barber {
  id: number;
  name: string;
  title: string | null;
}

interface TimeSlotItem {
  time: string;
}

type Step = "select" | "datetime" | "info" | "done";
const steps: Step[] = ["select", "datetime", "info"];

export default function AppointmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectService = searchParams.get("service");

  const [step, setStep] = useState<Step>("select");
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(preselectService ? Number(preselectService) : null);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlotItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/barbers").then((r) => r.json()),
    ]).then(([srv, brb]) => { setServices(srv); setBarbers(brb); });
  }, []);

  useEffect(() => {
    if (selectedDate && selectedService && services.length > 0) {
      loadTimeSlots();
    }
  }, [selectedDate, selectedService, selectedBarber, services]);

  const loadTimeSlots = async () => {
    try {
      const params = new URLSearchParams();
      params.set("date", selectedDate);
      if (selectedBarber) params.set("barberId", String(selectedBarber));
      const res = await fetch(`/api/slots?${params}`);
      const data = await res.json();
      setTimeSlots(data.slots || []);
    } catch { setTimeSlots([]); }
  };

  const getNextDays = (): { value: string; label: string }[] => {
    const days: { value: string; label: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      days.push({ value: iso, label: formatShortDate(iso) });
    }
    return days;
  };

  const formatPrice = (p: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(p);

  const selectedServiceData = services.find((s) => s.id === selectedService);
  const selectedBarberData = barbers.find((b) => b.id === selectedBarber);

  const handleSubmit = async () => {
    if (!customerName || !customerPhone) { toast.error("Ad ve telefon zorunlu"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, customerPhone, customerEmail, date: selectedDate, startTime: selectedTime, serviceId: selectedService, barberId: selectedBarber || null }),
      });
      if (res.ok) { setStep("done"); toast.success("Randevunuz başarıyla oluşturuldu!"); }
      else { const err = await res.json(); toast.error(err.error || "Randevu oluşturulamadı"); }
    } catch { toast.error("Bir hata oluştu"); }
    finally { setSubmitting(false); }
  };

  const days = getNextDays();
  const currentIdx = steps.indexOf(step);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen bg-dark-50">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-center mb-2">Randevu Al</h1>
          <p className="text-center text-dark-500 mb-10">Birkaç adımda randevunuzu oluşturun</p>

          {/* Progress */}
          <div className="flex items-center justify-center mb-12">
            {steps.map((s, i) => {
              const current = step === s;
              const past = currentIdx > i;
              return (
                <div key={s} className="flex items-center">
                  {i > 0 && <div className={`w-12 md:w-20 h-0.5 ${past ? "bg-primary-500" : "bg-dark-200"}`} />}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${past || current ? "bg-primary-500 text-white" : "bg-dark-200 text-dark-500"}`}>
                    {past ? <FaCheck /> : i + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 1: Select */}
          {step === "select" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">1. Hizmet Seçin</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {services.map((s) => (
                  <button key={s.id} onClick={() => setSelectedService(s.id)}
                    className={`card text-left hover:shadow-md transition-all ${selectedService === s.id ? "ring-2 ring-primary-500 bg-primary-50" : ""}`}>
                    <div className="font-semibold text-lg">{s.name}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xl font-bold text-primary-500">{formatPrice(s.price)}</span>
                      <span className="text-sm text-dark-500">{s.duration} dk</span>
                    </div>
                  </button>
                ))}
              </div>
              <h2 className="text-xl font-semibold mb-4">2. Tercih Edilen Berber (Opsiyonel)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button onClick={() => setSelectedBarber(null)}
                  className={`card text-center transition-all ${selectedBarber === null ? "ring-2 ring-primary-500 bg-primary-50" : ""}`}>
                  <div className="font-medium">Herhangi Biri</div>
                  <div className="text-sm text-dark-400">İlk müsait berber</div>
                </button>
                {barbers.map((b) => (
                  <button key={b.id} onClick={() => setSelectedBarber(b.id)}
                    className={`card text-center transition-all ${selectedBarber === b.id ? "ring-2 ring-primary-500 bg-primary-50" : ""}`}>
                    <div className="font-medium">{b.name}</div>
                    {b.title && <div className="text-sm text-dark-400">{b.title}</div>}
                  </button>
                ))}
              </div>
              {selectedService && (
                <div className="mt-8 text-right">
                  <button onClick={() => setStep("datetime")} className="btn-primary flex items-center gap-2 ml-auto">
                    Devam Et <FaArrowRight />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === "datetime" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">2. Tarih ve Saat Seçin</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-dark-700 mb-2">Tarih</label>
                <select className="input-field" value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(""); }}>
                  <option value="">Tarih seçin...</option>
                  {days.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-dark-700 mb-2">Saat</label>
                  {timeSlots.length === 0 ? (
                    <div className="text-dark-500 text-center py-12 bg-white rounded-xl">Bu tarihte uygun saat yok.</div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {timeSlots.map((t) => (
                        <button key={t.time} onClick={() => setSelectedTime(t.time)}
                          className={`py-3 rounded-lg font-medium transition-all ${selectedTime === t.time ? "bg-primary-500 text-white" : "bg-white hover:bg-primary-50 border border-dark-200"}`}>
                          {t.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {selectedServiceData && (
                <div className="card mb-6 bg-primary-50 border-primary-200">
                  <div className="flex justify-between">
                    <span className="font-medium">{selectedServiceData.name}</span>
                    <span className="font-bold text-primary-500">{formatPrice(selectedServiceData.price)}</span>
                  </div>
                  <div className="text-sm text-dark-500 mt-1">{selectedServiceData.duration} dakika</div>
                </div>
              )}
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep("select")} className="btn-secondary flex items-center gap-2">
                  <FaArrowLeft /> Geri
                </button>
                {selectedTime && (
                  <button onClick={() => setStep("info")} className="btn-primary flex items-center gap-2">
                    Devam Et <FaArrowRight />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Info */}
          {step === "info" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">3. Bilgileriniz</h2>
              <div className="card mb-6 bg-primary-50">
                <div className="space-y-2 text-sm">
                  <div><strong>Hizmet:</strong> {selectedServiceData?.name} - {selectedServiceData ? formatPrice(selectedServiceData.price) : ""}</div>
                  <div><strong>Tarih:</strong> {selectedDate ? formatShortDate(selectedDate) : ""}</div>
                  <div><strong>Saat:</strong> {selectedTime}</div>
                  {selectedBarberData && <div><strong>Berber:</strong> {selectedBarberData.name}</div>}
                </div>
              </div>
              <div className="space-y-4 card">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">Ad Soyad *</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input className="input-field pl-10" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Adınız Soyadınız" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">Telefon *</label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input className="input-field pl-10" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="05XX XXX XX XX" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">E-posta</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input className="input-field pl-10" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="ornek@email.com" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep("datetime")} className="btn-secondary flex items-center gap-2">
                  <FaArrowLeft /> Geri
                </button>
                <button onClick={handleSubmit} className="btn-primary" disabled={submitting}>
                  {submitting ? "Oluşturuluyor..." : "Randevuyu Onayla"}
                </button>
              </div>
            </div>
          )}

          {/* Done */}
          {step === "done" && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheck className="text-3xl text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Randevunuz Oluşturuldu!</h2>
              <p className="text-dark-500 mb-8">
                {selectedDate && formatShortDate(selectedDate)} tarihinde, {selectedTime} saatinde randevunuz alınmıştır.
              </p>
              <button onClick={() => router.push("/")} className="btn-primary">Ana Sayfaya Dön</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}