const GPT_FORM_URL =
  "https://chatgpt.com/g/g-68f7dfc26e048191a90cd85ad846efd6-encuentra-tu-por-que";

export default function PorQuePage() {
  return (
    <section
      className="w-full bg-[#f9f9f9] flex items-center justify-center py-16 px-6"
      style={{ minHeight: "calc(100vh - 160px)" }}
    >
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-10 flex flex-col items-center text-center gap-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#E79C00]">
          Encuentra tu “Por Qué” con SaidCoach
        </h1>

        <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl">
          Descubre la verdadera razón que te impulsará a mejorar tu salud.{" "}
          Responde las preguntas del coach SaidCoach y conecta con tu propósito.
        </p>

        <a
          href={GPT_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full max-w-sm px-6 py-3 bg-[#E79C00] text-white font-semibold rounded-full shadow transition hover:brightness-110"
        >
          Abrir herramienta en una nueva pestaña
        </a>
      </div>
    </section>
  );
}
