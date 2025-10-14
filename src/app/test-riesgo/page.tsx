"use client";

import Image from "next/image";

const FORM_SECTION_ID = "risk-form";
const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeRLpzGq3D6QIfwShGP5GVtf72MyKvarMkJVzlUbUtP7avJHA/viewform?embedded=true";
const LOGO_URL = "/logo3.png";

// Componente principal de la Landing Page
export default function TestRiskLanding() {
  const handleCtaClick = () => {
    const formSection = document.getElementById(FORM_SECTION_ID);

    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.hash = FORM_SECTION_ID;
    }
  };

  return (
    <>
      {/* Logo y Navegación */}
      <nav className="bg-brand-white shadow-md p-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Image
            src={LOGO_URL}
            alt="Logo Said Coach"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
          <div className="text-sm font-semibold text-brand-black hidden sm:block">
            Evaluación de Riesgo Pre-Ejercicio
          </div>
        </div>
      </nav>

      {/* Sección Principal (Héroe) */}
      <header className="bg-brand-black text-brand-white py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            ¿Estás listo para{" "}
            <span className="text-brand-orange">empezar a entrenar</span>?
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 max-w-3xl mx-auto">
            Descubre tu nivel de riesgo antes de iniciar o retomar el ejercicio
            físico. Tu seguridad es lo primero.
          </p>
          <button
            onClick={handleCtaClick}
            className="inline-block bg-brand-orange text-brand-black font-bold text-lg md:text-xl py-4 px-10 rounded-full shadow-lg hover:bg-orange-400 transition duration-300 transform hover:scale-105 hover:-translate-y-0.5"
          >
            HAZ TU TEST GRATIS AHORA
          </button>
          <p className="mt-4 text-sm font-light italic">
            Recibe tu informe de riesgo personalizado por correo.
          </p>
        </div>
      </header>

      {/* Sección de Beneficios */}
      <section className="py-16 bg-brand-white text-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por Qué Tomar Este Test?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tarjeta 1: Seguridad */}
            <div className="bg-brand-light-gray p-6 rounded-xl shadow-md border-t-4 border-brand-orange">
              <div className="text-3xl mb-4 text-brand-orange" aria-hidden="true">
                🔒
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Máxima Seguridad
              </h3>
              <p className="text-gray-600">
                Identifica si necesitas una consulta médica previa (Derivar) o
                si puedes empezar inmediatamente. Evita riesgos innecesarios.
              </p>
            </div>

            {/* Tarjeta 2: Guía Profesional */}
            <div className="bg-brand-light-gray p-6 rounded-xl shadow-md border-t-4 border-brand-orange">
              <div className="text-3xl mb-4 text-brand-orange" aria-hidden="true">
                🩺
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Guía para tu Entrenador
              </h3>
              <p className="text-gray-600">
                Proporciona a tu futuro entrenador (o al gimnasio) información
                clara sobre las precauciones que deben tomar contigo
                (Supervisión).
              </p>
            </div>

            {/* Tarjeta 3: Claridad */}
            <div className="bg-brand-light-gray p-6 rounded-xl shadow-md border-t-4 border-brand-orange">
              <div className="text-3xl mb-4 text-brand-orange" aria-hidden="true">
                📄
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Reporte Claro y Simple
              </h3>
              <p className="text-gray-600">
                Recibe un PDF con un lenguaje sencillo, explicándote paso a paso
                qué hacer según tu nivel de riesgo (Bajo, Moderado, Alto).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section
        id={FORM_SECTION_ID}
        className="py-16 bg-brand-white text-brand-black"
      >
        <div className="container mx-auto px-6 max-w-4xl space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-orange">
              Completa el Formulario
            </h2>
            <p className="text-base md:text-lg text-gray-700">
              Responde las preguntas para conocer tu nivel de riesgo antes de
              comenzar cualquier programa de entrenamiento.
            </p>
          </div>

          <div className="bg-white border border-brand-light-gray rounded-xl shadow-lg overflow-hidden">
            <iframe
              src={GOOGLE_FORM_URL}
              title="Formulario de Evaluación de Riesgo"
              width="100%"
              height="900"
              className="w-full h-[70vh] min-h-[720px]"
              loading="lazy"
              allow="camera; microphone; autoplay"
            ></iframe>
          </div>

          <p className="text-sm text-gray-600 text-center">
            Si el formulario no se carga correctamente,{" "}
            <a
              href={GOOGLE_FORM_URL}
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

      {/* Sección CTA Baja */}
      <section className="py-16 bg-brand-orange text-brand-black">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            No te sientas inseguro: toma el control de tu entrenamiento.
          </h2>
          <p className="text-lg mb-8 max-w-4xl mx-auto">
            El test solo toma 3 minutos y te proporciona tranquilidad y una ruta
            clara.
          </p>
          <button
            onClick={handleCtaClick}
             className="inline-block bg-brand-black text-brand-white font-bold text-lg md:text-xl py-4 px-12 rounded-full shadow-lg hover:bg-gray-800 transition duration-300 transform hover:scale-105 hover:-translate-y-0.5"
          >
            EMPIEZA TU EVALUACIÓN AHORA
          </button>
        </div>
      </section>
    </>
  );
}
