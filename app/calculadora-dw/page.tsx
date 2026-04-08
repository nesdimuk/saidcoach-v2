export const metadata = {
  title: 'Calculadora Composición Corporal — @assist.trainer',
  description: 'Herramienta gratuita para entrenadores. Calcula % grasa con Durnin & Womersley.',
};

export default function CalculadoraDW() {
  return (
    <main style={{ margin: 0, padding: 0 }}>
      <iframe
        src="/calculadora-dw.html"
        style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
      />
    </main>
  );
}
