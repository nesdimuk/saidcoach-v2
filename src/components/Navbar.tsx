"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/quien-soy", label: "Quién soy" },
  { href: "/servicios", label: "Servicios" },
  { href: "/contacto", label: "Contacto" },
  { href: "/test-riesgo", label: "Test de Riesgo" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-brand-black text-brand-white relative">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image src="/logo3.png" alt="SaidCoach Logo" width={120} height={60} priority />
      </Link>

      {/* Botón hamburguesa (solo móvil) */}
      <button
        className="md:hidden flex flex-col justify-between w-8 h-6 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="w-full h-1 bg-brand-white"></span>
        <span className="w-full h-1 bg-brand-white"></span>
        <span className="w-full h-1 bg-brand-white"></span>
      </button>

      {/* Links (desktop) */}
      <ul className="hidden md:flex gap-6 text-lg font-medium">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-brand-orange">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Menú desplegable (móvil) */}
      {isOpen && (
        <ul className="absolute top-16 left-0 w-full bg-brand-black flex flex-col items-center gap-6 py-6 text-lg font-medium md:hidden z-50">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={() => setIsOpen(false)} className="hover:text-brand-orange">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
