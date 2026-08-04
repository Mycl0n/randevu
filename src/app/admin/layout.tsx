"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  FaThLarge,
  FaCut,
  FaCalendarAlt,
  FaCog,
  FaClock,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserFriends,
} from "react-icons/fa";
import toast from "react-hot-toast";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: FaThLarge },
  { href: "/admin/hizmetler", label: "Hizmetler", icon: FaCut },
  { href: "/admin/randevular", label: "Randevular", icon: FaCalendarAlt },
  { href: "/admin/berberler", label: "Berberler", icon: FaUserFriends },
  { href: "/admin/mesai", label: "Mesai Saatleri", icon: FaClock },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: FaCog },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/giris";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/admin/giris");
        } else {
          setLoading(false);
        }
      });
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    toast.success("Çıkış yapıldı");
    router.push("/admin/giris");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  // Bu sayfa için layout wrapper kullanma
  // (login sayfası hariç wrapper'a sar)
  return (
    <div className="min-h-screen bg-dark-50 flex">
      {!isLoginPage && (
        <>
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:flex flex-col w-64 bg-dark-950 text-white fixed h-full z-30">
            <div className="p-6 border-b border-dark-800">
              <Link href="/admin" className="text-xl font-heading font-bold text-primary-400">
                Admin Panel
              </Link>
            </div>
            <nav className="flex-1 py-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                      isActive
                        ? "bg-primary-500 text-white"
                        : "text-dark-300 hover:text-white hover:bg-dark-800"
                    }`}
                  >
                    <item.icon className="text-lg" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-dark-800">
              <Link href="/" className="text-dark-400 hover:text-white text-sm block mb-2 transition-colors">
                ← Siteye Dön
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-dark-400 hover:text-red-400 transition-colors"
              >
                <FaSignOutAlt />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </aside>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <>
              <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
              <aside className="fixed inset-y-0 left-0 w-64 bg-dark-950 text-white z-50 lg:hidden">
                <div className="p-6 border-b border-dark-800 flex justify-between items-center">
                  <Link href="/admin" className="text-lg font-bold text-primary-400">Admin Panel</Link>
                  <button onClick={() => setSidebarOpen(false)}><FaTimes /></button>
                </div>
                <nav className="py-4">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-6 py-3 ${
                        pathname === item.href ? "bg-primary-500 text-white" : "text-dark-300 hover:bg-dark-800"
                      }`}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t border-dark-800">
                  <button onClick={handleLogout} className="flex items-center gap-2 text-dark-400 hover:text-red-400">
                    <FaSignOutAlt /><span>Çıkış Yap</span>
                  </button>
                </div>
              </aside>
            </>
          )}
        </>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${!isLoginPage ? "lg:ml-64" : ""}`}>
        {!isLoginPage && (
          <header className="bg-white border-b border-dark-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <button className="lg:hidden text-xl" onClick={() => setSidebarOpen(true)}>
              <FaBars />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <Link href="/" className="text-sm text-dark-500 hover:text-primary-500 hidden sm:block">
                Siteyi Görüntüle
              </Link>
              <button onClick={handleLogout} className="text-sm text-dark-500 hover:text-red-500 hidden sm:block">
                Çıkış Yap
              </button>
            </div>
          </header>
        )}
        <main>{children}</main>
      </div>
    </div>
  );
}