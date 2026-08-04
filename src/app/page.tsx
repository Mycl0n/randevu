"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaPhone, FaArrowRight } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string | null;
}

export default function HomePage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [services, setServices] = useState<Service[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<number>(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([settingsData, servicesData]) => {
      const map: Record<string, string> = {};
      settingsData.forEach((s: { key: string; value: string }) => {
        map[s.key] = s.value;
      });
      setSettings(map);
      setServices(servicesData);
    });
  }, []);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(p);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(211,84,0,0.15),transparent_70%)]" />
          <div className="max-w-7xl mx-auto px-4 py-32 w-full relative">
            <div className="max-w-2xl">
              <span className="text-primary-400 font-medium text-sm tracking-widest uppercase mb-4 block">
                {settings.site_name || "Royal Barber"}
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 leading-tight">
                {settings.hero_title || "Modern Berber Deneyimi"}
              </h1>
              <p className="text-xl text-dark-300 mb-10 leading-relaxed">
                {settings.hero_subtitle || "Stilinizi tamamlamak için buradayız"}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/randevu" className="btn-primary text-lg px-8 py-4 flex items-center gap-3">
                  <FaCalendarAlt />
                  Hemen Randevu Al
                </Link>
                <Link href="/hizmetler" className="btn-secondary text-lg px-8 py-4 border-dark-600 text-dark-200 hover:bg-dark-800 hover:text-white">
                  Hizmetlerimiz
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="section-title">Hizmetlerimiz</h2>
            <p className="section-subtitle">Size en uygun hizmeti seçin, uzman berberlerimizle kaliteli sonuçlar elde edin.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <div key={s.id} className="card hover:shadow-lg transition-shadow group">
                  <div className="text-dark-900 font-bold text-lg mb-2 group-hover:text-primary-500 transition-colors">
                    {s.name}
                  </div>
                  <p className="text-dark-500 mb-3 text-sm">{s.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-dark-100">
                    <span className="text-2xl font-bold text-primary-500">
                      {formatPrice(s.price)}
                    </span>
                    <span className="text-dark-400 text-sm bg-dark-100 px-3 py-1 rounded-full">
                      {s.duration} dk
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/randevu" className="btn-primary inline-flex items-center gap-2">
                Randevu Al <FaCalendarAlt title="calendar-icon" />
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-dark-50">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title text-left">
                {settings.about_title || "Hakkımızda"}
              </h2>
              <p className="text-dark-600 text-lg leading-relaxed">
                {settings.about_text || "Royal Barber hakkında bilgi"}
              </p>
            </div>
            <div className="bg-dark-200 rounded-xl h-80 flex items-center justify-center text-dark-400">
              Fotoğraf Alanı
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-heading font-bold text-white mb-4">Randevunuzu Hemen Alın</h2>
            <p className="text-primary-100 text-lg mb-8">Birkaç tıkla kolayca randevunuzu oluşturun</p>
            <Link href="/randevu" className="inline-flex bg-white text-primary-600 font-bold px-10 py-4 rounded-xl hover:bg-primary-50 transition-all shadow-lg">
              Randevu Al
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}