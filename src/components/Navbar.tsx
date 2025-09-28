"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-brand.black text-brand.white relative">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image
          src="/saidcoach-logo.svg"
          alt="SaidCoach Logo"
          width={120}
          height={60}
          priority
        />
      </Link>

      {/* Botón hamburguesa (solo móvil) */}
      <button
        className="md:hidden flex flex-col justify-between w-8 h-6 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="w-full h-1 bg-brand.white"></span>
        <span className="w-full h-1 bg-brand.white"></span>
        <span className="w-full h-1 bg-brand.white"></span>
      </button>

      {/* Links (desktop) */}
      <ul className="hidden md:flex gap-6 text-lg font-medium">
        <li><Link href="/" className="hover:text-brand.orange">Inicio</Link></li>
        <li><Link href="/quien-soy" className="hover:text-brand.orange">Quién soy</Link></li>
        <li><Link href="/servicios" className="hover:text-brand.orange">Servicios</Link></li>
        <li><Link href="/contacto" className="hover:text-brand.orange">Contacto</Link></li>
      </ul>

      {/* Menú desplegable (móvil) */}
      {isOpen && (
        <ul className="absolute top-16 left-0 w-full bg-brand.black flex flex-col items-center gap-6 py-6 text-lg font-medium md:hidden z-50">
          <li><Link href="/" onClick={() => setIsOpen(false)} className="hover:text-brand.orange">Inicio</Link></li>
          <li><Link href="/quien-soy" onClick={() => setIsOpen(false)} className="hover:text-brand.orange">Quién soy</Link></li>
          <li><Link href="/servicios" onClick={() => setIsOpen(false)} className="hover:text-brand.orange">Servicios</Link></li>
          <li><Link href="/contacto" onClick={() => setIsOpen(false)} className="hover:text-brand.orange">Contacto</Link></li>
        </ul>
      )}
    </nav>
  );
}


