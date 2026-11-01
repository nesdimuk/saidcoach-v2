"use client";

import { usePathname } from "next/navigation";

/** Oculta el chrome del sitio (menú, footer) en la pantalla de gimnasio `/rir`. */
export default function HideOnRir({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/rir" || pathname?.startsWith("/rir/")) return null;
  return <>{children}</>;
}
