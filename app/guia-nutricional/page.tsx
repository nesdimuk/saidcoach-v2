const FORM_URL = "https://forms.gle/ds9cZFQyWLnQSUHD8";
const EMBED_URL = `${FORM_URL}?embedded=true`;

export default function GuiaNutricionalPage() {
  return (
    <section className="bg-brand-white text-brand-black py-16 px-4">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-orange">
            Guía Nutricional SaidCoach
          </h1>
          <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto">
            Completa el formulario para recibir recursos personalizados y recomendaciones
            nutricionales adaptadas a tus objetivos.
          </p>
        </header>

        <div className="rounded-xl border border-brand-light-gray bg-white shadow-lg overflow-hidden">
          <iframe
            src={EMBED_URL}
            title="Formulario Guía Nutricional"
            width="100%"
            height="920"
            className="w-full min-h-[720px]"
            loading="lazy"
          />
        </div>

        <p className="text-sm text-gray-600 text-center">
          Si tienes problemas para visualizar el formulario,{" "}
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-orange font-semibold underline"
          >
            ábrelo en una nueva pestaña
          </a>
          .
        </p>
      </div>
    </section>
  );
}
