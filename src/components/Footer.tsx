"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaInstagram, FaFacebook, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";

export default function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, string> = {};
        data.forEach((s: { key: string; value: string }) => {
          map[s.key] = s.value;
        });
        setSettings(map);
      });
  }, []);

  return (
    <footer className="bg-dark-950 text-white pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-heading font-bold text-primary-400 mb-4">
              {settings.site_name || "Royal Barber"}
            </h3>
            <p className="text-dark-300 leading-relaxed">
              {settings.about_text || "Modern berber deneyimi"}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Hızlı Linkler</h4>
            <div className="flex flex-col gap-3">
              <Link href="/hizmetler" className="text-dark-300 hover:text-primary-400 transition-colors">
                Hizmetlerimiz
              </Link>
              <Link href="/berberler" className="text-dark-300 hover:text-primary-400 transition-colors">
                Berberlerimiz
              </Link>
              <Link href="/randevu" className="text-dark-300 hover:text-primary-400 transition-colors">
                Randevu Al
              </Link>
              <Link href="/admin" className="text-dark-300 hover:text-primary-400 transition-colors">
                Admin Panel
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">İletişim</h4>
            <div className="flex flex-col gap-3 text-dark-300">
              {settings.address && (
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-primary-400 flex-shrink-0" />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings.phone && (
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-primary-400 transition-colors">
                  <FaPhone className="text-primary-400 flex-shrink-0" />
                  <span>{settings.phone}</span>
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 hover:text-primary-400 transition-colors">
                  <FaEnvelope className="text-primary-400 flex-shrink-0" />
                  <span>{settings.email}</span>
                </a>
              )}
              <div className="flex items-center gap-3">
                <FaClock className="text-primary-400 flex-shrink-0" />
                <span>{settings.work_start || "09:00"} - {settings.work_end || "19:00"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-dark-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex gap-4">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-dark-400 hover:text-primary-400 transition-colors text-xl">
                  <FaInstagram />
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-dark-400 hover:text-primary-400 transition-colors text-xl">
                  <FaFacebook />
                </a>
              )}
              {settings.whatsapp && (
                <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-dark-400 hover:text-green-400 transition-colors text-xl">
                  <FaWhatsapp />
                </a>
              )}
            </div>
            <p className="text-dark-500 text-sm">
              &copy; {new Date().getFullYear()} {settings.site_name || "Royal Barber"}. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}