export default function ChefProteicoPage() {
  // Simple, mobile-first landing with brand colors and centered content
  return (
    <main className="min-h-screen bg-white text-black/90 flex items-center justify-center p-6">
      <section className="w-full max-w-[600px] text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-[#004F59]">
            Chef Proteico — Descubre cuánta proteína necesitas y qué comer con lo que ya tienes
          </h1>
          <p className="text-lg">
            Tu asistente inteligente que te dice exactamente qué comer de proteína según lo que hay en tu refrigerador.
          </p>
        </div>

        <div className="space-y-2 text-left bg-[#003F87]/5 border border-[#003F87]/10 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-[#003F87]">¿Qué resuelve?</h2>
          <p>
            La mayoría de las personas no sabe cuánta proteína necesita, ni qué comer para llegar al mínimo del día.
          </p>
          <p>Chef Proteico lo hace fácil:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Te calcula tu requerimiento diario de proteína.</li>
            <li>Te dice cuánta proteína puedes sacar de lo que tienes en casa.</li>
            <li>Te arma un menú del día completo (desayuno, almuerzo, cena y snacks).</li>
            <li>Te da 3 opciones para dejar listas la noche anterior.</li>
            <li>Y si te falta proteína, te dice exactamente qué comprar.</li>
          </ul>
        </div>

        <div className="space-y-2 text-left bg-[#004F59]/5 border border-[#004F59]/10 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-[#004F59]">¿Para quién es?</h2>
          <p>Para personas que:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>No saben si están comiendo suficiente proteína.</li>
            <li>Siempre andan con hambre en la tarde.</li>
            <li>No tienen tiempo para pensar en menús.</li>
            <li>Quieren mejorar energía y controlar antojos.</li>
            <li>Quieren comer mejor sin complicarse.</li>
          </ul>
        </div>

        <div className="space-y-2 text-left bg-white border border-[#003F87]/10 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-[#003F87]">¿Cómo funciona?</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Le dices tu peso.</li>
            <li>Le dices qué tienes en el refrigerador (o le envías una foto).</li>
            <li>Te calcula todo automáticamente.</li>
          </ol>
        </div>

        <div className="pt-2">
          <a
            href="https://chatgpt.com/g/g-691f5e927c1c8191ac14deb9e07feb27-chef-proteico"
            className="inline-block w-full sm:w-auto px-6 py-3 text-white font-semibold bg-[#004F59] rounded-lg shadow-sm transition-transform duration-150 hover:scale-[1.01] hover:bg-[#004f59]/90"
          >
            Usar Chef Proteico ahora
          </a>
        </div>

        <p className="text-sm text-center text-black/70">
          100% gratis. Requiere cuenta gratuita de ChatGPT.
        </p>
      </section>
    </main>
  );
}
