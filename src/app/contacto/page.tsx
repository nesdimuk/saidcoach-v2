export default function Contact() {
  return (
    <section className="py-20 px-6 text-center">
      <h2 className="text-3xl font-bold mb-6 text-brand.orange">Contacto</h2>
      <p className="mb-8">Escríbeme directamente por WhatsApp:</p>

      <a
        href="https://wa.me/569995995678"
        target="_blank"
        rel="noopener noreferrer"
        className="px-8 py-4 bg-brand.orange text-brand.black text-lg font-semibold rounded-lg shadow hover:bg-orange-600 transition"
      >
        Enviar mensaje por WhatsApp
      </a>
    </section>
  );
}

