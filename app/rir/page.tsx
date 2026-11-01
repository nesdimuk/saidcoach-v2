import { Suspense } from "react";
import RirApp from "./_components/RirApp";

export default function RirPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-brand-white/70">Cargando…</p>}>
      <RirApp />
    </Suspense>
  );
}
