"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaPhone } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/hizmetler", label: "Hizmetler" },
    { href: "/berberler", label: "Berberler" },
    { href: "/randevu", label: "Randevu Al" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-heading font-bold text-primary-500">
            {settings.site_name || "Royal Barber"}
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-medium transition-colors ${
                scrolled ? "text-dark-800 hover:text-primary-500" : "text-white hover:text-primary-200"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {settings.phone && (
            <a
              href={`tel:${settings.phone.replace(/\s/g, "")}`}
              className={`flex items-center gap-2 font-medium transition-colors ${
                scrolled ? "text-primary-500" : "text-white"
              }`}
            >
              <FaPhone className="text-sm" />
              {settings.phone}
            </a>
          )}
          <Link href="/admin" className="text-dark-400 hover:text-primary-500 transition-colors" title="Admin Panel">
            <FaSettings />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-2xl" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-xl border-t mx-4 mt-2 rounded-xl overflow-hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-6 py-4 font-medium hover:bg-dark-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="block px-6 py-4 font-medium hover:bg-dark-50 transition-colors border-t"
            onClick={() => setIsOpen(false)}
          >
            Admin Panel
          </Link>
        </div>
      )}
    </nav>
  );
}

function FaBars() {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}