"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SupabaseProvider } from "./SupabaseProvider";

/** `/rir` funciona sin cuenta ni red: no levanta el cliente de Supabase. */
export function SupabaseUnlessRir({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/rir" || pathname?.startsWith("/rir/")) return <>{children}</>;
  return <SupabaseProvider>{children}</SupabaseProvider>;
}
