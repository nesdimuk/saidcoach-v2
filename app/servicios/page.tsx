export default function Services() {
  return (
    <section className="py-20 px-6">
      <h2 className="text-3xl font-bold mb-10 text-brand-orange">Servicios</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-brand-white text-brand-black p-6 rounded-lg shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Entrenamiento Online</h3>
          <p>
            Sesiones en vivo y planes personalizados para alcanzar tus metas,
            desde la comodidad de tu casa o gimnasio.
          </p>
        </div>

        <div className="bg-brand-white text-brand-black p-6 rounded-lg shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Coaching de Hábitos</h3>
          <p>
            Acompañamiento integral en nutrición, movimiento y estilo de vida
            para lograr cambios sostenibles.
          </p>
        </div>

        <div className="bg-brand-white text-brand-black p-6 rounded-lg shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Bienestar Corporativo</h3>
          <p>
            Programas gamificados de salud y ejercicio para aumentar la
            motivación y el rendimiento de tus equipos.
          </p>
        </div>
      </div>
    </section>
  );
}
