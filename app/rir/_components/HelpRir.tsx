export default function HelpRir() {
  return (
    <details className="rounded-xl border border-white/20 bg-white/5 p-4 text-base">
      <summary className="cursor-pointer font-semibold text-brand-orange">
        ¿Cómo sé cuántas me quedaban?
      </summary>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-brand-white/90">
        <li>La última rep sale claramente más lenta.</li>
        <li>La técnica no se rompe.</li>
        <li>Sientes que quedan un par más, no muchas.</li>
      </ul>
      <p className="mt-3 text-sm text-brand-white/70">
        Ante la duda, elige la opción con menos reps de reserva: preferimos quedarnos cortos.
      </p>
    </details>
  );
}
