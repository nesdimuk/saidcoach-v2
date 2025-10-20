import { WHATSAPP_LINK } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-brand-black text-brand-white text-center py-6 mt-12 border-t border-brand-orange/30">
      <p className="mb-2">
        © {new Date().getFullYear()} SaidCoach. Todos los derechos reservados.
      </p>
      <p>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-orange hover:underline"
        >
          Escríbeme por WhatsApp
        </a>
      </p>
    </footer>
  );
}
