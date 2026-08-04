"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaUser, FaStar, FaPhone } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Barber {
  id: number;
  name: string;
  title: string | null;
  bio: string | null;
  imageUrl: string | null;
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/barbers")
      .then((r) => r.json())
      .then((data) => { setBarbers(data); setLoading(false); });
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <section className="pt-32 pb-20 bg-dark-950 text-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Berberlerimiz</h1>
            <p className="text-dark-300 text-lg max-w-2xl mx-auto">
              Deneyimli ve profesyonel ekibimizle tanışın
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
              </div>
            ) : barbers.length === 0 ? (
              <div className="text-center py-12 text-dark-400">Henüz berber eklenmemiş.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {barbers.map((b) => (
                  <div key={b.id} className="card hover:shadow-xl transition-all text-center">
                    <div className="w-24 h-24 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUser className="text-3xl text-dark-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">{b.name}</h3>
                    {b.title && <p className="text-primary-500 font-medium mb-2">{b.title}</p>}
                    {b.bio && <p className="text-dark-500 text-sm">{b.bio}</p>}
                    <Link href={`/randevu?service=0`} className="mt-4 btn-primary w-full inline-flex items-center justify-center gap-2">
                      <FaPhone /> Randevu Al
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