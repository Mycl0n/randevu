"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaClock, FaCalendarAlt } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string | null;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      });
  }, []);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(p);

  return (
    <>
      <Navbar />
      <main>
        <section className="pt-32 pb-20 bg-dark-950 text-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Hizmetlerimiz</h1>
            <p className="text-dark-300 text-lg max-w-2xl mx-auto">
              Modern erkek kuaförlüğünün tüm inceliklerini sizin için sunuyoruz.
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 text-dark-400">Henüz hizmet eklenmemiş.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((s) => (
                  <div key={s.id} className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-primary-50 text-primary-500 p-3 rounded-xl">
                        <FaClock className="text-xl" />
                      </div>
                      <h3 className="text-xl font-bold">{s.name}</h3>
                    </div>
                    <p className="text-dark-500 mb-6">{s.description || "Profesyonel hizmet"}</p>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-3xl font-bold text-primary-500">{formatPrice(s.price)}</span>
                      <span className="text-dark-400 bg-dark-50 px-3 py-1 rounded-full text-sm">{s.duration} dk</span>
                    </div>
                    <Link
                      href={`/randevu?service=${s.id}`}
                      className="mt-4 btn-primary w-full text-center flex items-center justify-center gap-2"
                    >
                      <FaCalendarAlt /> Hemen Randevu Al
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}