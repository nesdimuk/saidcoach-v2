const resources = [
  { icon: '📘', label: 'Guías especializadas para cada área de OCCIM' },
  { icon: '🎥', label: 'Videos de movilidad para pausas inteligentes' },
  { icon: '⏸️', label: 'Pausas activas guiadas para tus jornadas' },
  { icon: '🥗', label: 'Herramientas de nutrición práctica' },
  { icon: '🏋️', label: 'Protocolos simples de entrenamiento' },
];

export default function OccimRecursosPage() {
  return (
    <section className="occim-card">
      <h1 className="occim-section-title">Recursos OCCIM</h1>
      <p>
        Aquí encontrarás contenido exclusivo para los equipos de OCCIM: piezas
        diseñadas para mantener tu energía, tomar mejores decisiones y construir
        hábitos saludables sin salir de la oficina.
      </p>

      <ul className="occim-list">
        {resources.map(({ icon, label }) => (
          <li key={label}>
            <span className="occim-list-icon">{icon}</span>
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
