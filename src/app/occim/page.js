import Link from 'next/link';

const benefits = [
  'Acompañamiento personalizado en bienestar integral',
  'Rutinas exclusivas que se adaptan a tus objetivos laborales y personales',
  'Alertas y recordatorios para mantener hábitos saludables en la oficina',
  'Mediciones periódicas para celebrar tus avances',
];

export default function OccimHomePage() {
  return (
    <section className="occim-card">
      <h1>Bienvenido al Programa de Bienestar OCCIM</h1>
      <p>
        Creamos este espacio con una sola misión: que cada colaborador de OCCIM
        cuente con un punto de encuentro exclusivo para planear su bienestar,
        mantenerse motivado y acceder a todo el respaldo de nuestro equipo.
      </p>

      <ul className="occim-list">
        {benefits.map((benefit) => (
          <li key={benefit}>
            <span className="occim-list-icon">✔</span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <p>
        ¿Listo para empezar? Crea tu cuenta y accede a la plataforma diseñada
        exclusivamente para ti.
      </p>

      <Link className="occim-button-primary" href="/occim/acceso_app">
        Ingresar al portal OCCIM
      </Link>
    </section>
  );
}
