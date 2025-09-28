import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand.black text-brand.white text-center py-6 mt-12 border-t border-brand.orange/30">
      <p className="mb-2">
        © {new Date().getFullYear()} SaidCoach. Todos los derechos reservados.
      </p>
      <p>
        <Link
          href="https://wa.me/56995995678"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand.orange hover:underline"
        >
          Escríbeme por WhatsApp
        </Link>
      </p>
    </footer>
  );
}

