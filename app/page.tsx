import Image from "next/image";
import { WHATSAPP_LINK } from "@/lib/constants";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center text-center min-h-[80vh] px-4 bg-brand-black text-brand-white">
      <Image
        src="/logo3.png"
        alt="SaidCoach Logo"
        width={160}
        height={80}
        priority
        className="mb-8"
      />

      <h1 className="text-5xl font-bold mb-6 text-brand-orange">
        Bienvenido a SaidCoach
      </h1>

      <p className="text-lg mb-8 max-w-2xl text-brand-white">
        <span className="text-brand-orange font-semibold">
          Entrenamiento personal online
        </span>
        , coaching de hábitos y programas de bienestar para empresas.
      </p>

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="px-8 py-4 bg-brand-orange text-brand-black text-lg font-semibold rounded-lg shadow hover:bg-orange-600 transition"
      >
        Escríbeme por WhatsApp
      </a>
    </section>
  );
}
