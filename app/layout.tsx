import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HideOnRir from "@/components/HideOnRir";
import { SupabaseUnlessRir } from "@/providers/SupabaseUnlessRir";
import { Analytics } from "@vercel/analytics/react";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SaidCoach",
  description: "Entrenamiento personal online, coaching de hábitos y programas de bienestar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${montserrat.className} bg-brand-black text-brand-white flex flex-col min-h-screen`}
      >
        <SupabaseUnlessRir>
          <HideOnRir><Navbar /></HideOnRir>
          <main className="flex-grow">{children}</main>
          <HideOnRir><Footer /></HideOnRir>
        </SupabaseUnlessRir>
        <Analytics />
      </body>
    </html>
  );
}
