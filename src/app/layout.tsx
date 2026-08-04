import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Royal Barber - Modern Berber Deneyimi",
  description: "Modern erkek kuaförü ve berber hizmetleri",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen flex flex-col">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}