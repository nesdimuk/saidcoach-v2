import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
