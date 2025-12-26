import { calculateWeeklyVolume } from "@/lib/rules/volume";
import { selectExercises } from "@/lib/rules/selectExercises";
import { applyProgression } from "@/lib/rules/progression";
import { evaluarContexto } from "@/lib/rules/context";
import { evaluarRIR } from "@/lib/rules/rir";
import { evaluarDolor } from "@/lib/rules/semaforo";

const REQUIRED_FIELDS = [
  "objetivo",
  "edad",
  "nivel",
  "anosEntrenando",
  "material",
  "frecuencia",
  "tiempoSesion",
  "lesiones",
  "preferencias",
  "sueno",
  "estres",
  "actividadReciente",
];

function validatePayload(payload) {
  const missing = REQUIRED_FIELDS.filter(
    (field) => payload[field] === undefined || payload[field] === null
  );
  if (missing.length) {
    return `Faltan campos requeridos: ${missing.join(", ")}`;
  }

  const empty = REQUIRED_FIELDS.filter(
    (field) => String(payload[field]).trim() === ""
  );
  if (empty.length) {
    return `Hay campos vacíos: ${empty.join(", ")}`;
  }

  return null;
}

function serieObjetivo(volumen, factorVolumen) {
  const base =
    volumen && volumen.seriesPorGrupo
      ? Math.round(
          (Number(volumen.seriesPorGrupo.min) + Number(volumen.seriesPorGrupo.max)) / 2
        ) || 10
      : 10;
  const ajustado = Math.round(base * (factorVolumen || 1));
  if (base > 1 && ajustado < 1) return 1;
  return Math.max(1, ajustado);
}

function enriquecerEjercicio(ejercicio, seriesMeta, contexto) {
  const esCompuesto = (ejercicio.tipo || "").toLowerCase() === "compuesto";
  const rirObjetivo = 2;
  const rirInfo = evaluarRIR(rirObjetivo, esCompuesto);
  const dolorInfo = evaluarDolor(0);

  const descanso = esCompuesto ? "2-3 min" : "90-120s";
  const notasBase = [
    `Mantén RIR ${rirObjetivo} (1-3) salvo indicación contraria.`,
    rirInfo.motivo,
    dolorInfo.recomendacion,
  ];

  if (contexto?.tipoSemana === "mala") {
    notasBase.push("Semana mala: prioriza técnica, evita fallo, reduce estrés de entrenamiento.");
  } else if (contexto?.tipoSemana === "regular") {
    notasBase.push("Semana regular: mantén consistencia, evita acercarte demasiado al fallo.");
  } else {
    notasBase.push("Semana buena: aplica técnica sólida y progresión controlada.");
  }

  return {
    nombre: ejercicio.nombre,
    tipo: ejercicio.tipo,
    series: seriesMeta,
    reps: ejercicio.reps,
    rir: rirObjetivo,
    descanso,
    notas: notasBase,
  };
}

export async function POST(req) {
  try {
    const payload = await req.json();
    const validationError = validatePayload(payload);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    const {
      objetivo,
      edad,
      nivel,
      anosEntrenando,
      material,
      frecuencia,
      tiempoSesion,
      lesiones,
      preferencias,
      sueno,
      estres,
      actividadReciente,
    } = payload;

    const datosUsuario = {
      objetivo,
      edad,
      nivel,
      anosEntrenando,
      material,
      frecuencia,
      tiempoSesion,
      lesiones,
      preferencias,
      sueno,
      estres,
      actividadReciente,
    };

    const contexto = evaluarContexto({
      sueno,
      estres,
      viajando: false,
      enfermedad: "ninguna",
      pausaSemanas: 0,
    });

    const volumen = calculateWeeklyVolume({
      edad,
      nivel,
      sueno,
      estres,
      objetivo,
    });

    const ejercicios = selectExercises({
      objetivo,
      nivel,
      material,
      lesiones,
      sueno,
      estres,
    });

    const seriesMeta = serieObjetivo(volumen, contexto.factorVolumen);

    const sesiones = [
      { dia: "A", ejercicios: ejercicios.diaA || [] },
      { dia: "B", ejercicios: ejercicios.diaB || [] },
      { dia: "C", ejercicios: ejercicios.diaC || [] },
    ].map((sesion) => ({
      dia: sesion.dia,
      ejercicios: (sesion.ejercicios || []).map((ej) =>
        enriquecerEjercicio(ej, seriesMeta, contexto)
      ),
    }));

    const diagnostico = `Objetivo ${objetivo}, nivel ${nivel}, contexto ${contexto.tipoSemana}. Volumen base ${
      volumen.seriesPorGrupo
        ? `${volumen.seriesPorGrupo.min}-${volumen.seriesPorGrupo.max}`
        : "n/a"
    } series, ajustado por sueño/estrés a factor ${contexto.factorVolumen || 1}.`;

    const resultado = {
      usuario: datosUsuario,
      diagnostico,
      lineamientos: [
        "Volumen semanal según nivel",
        "RIR 1–3 para la mayoría de series",
        "Evitar rangos 3–6 si objetivo no es fuerza",
        "Progresión doble reps → peso",
        "Adaptación por sueño y estrés",
      ],
      programa: {
        semana: 1,
        sesiones,
      },
      reglasProgresion: [
        "Aumenta reps hasta el límite superior",
        "Cuando completes el rango objetivo, incrementa peso 2.5–10%",
        "RIR 1–3 = estímulo óptimo",
        "Evita fallo muscular excepto en accesorios seguros",
        "Si sueño bajo o estrés alto: -20% volumen",
      ],
      alternativas: [
        "Si dolor hombro: evitar press militar",
        "Usar agarre neutro para evitar molestias",
        "Sustituir compuestos por variantes más amigables si hay dolor",
      ],
      recomendaciones: [
        "Dormir 7–9 horas",
        "Entrenar 3 veces por semana",
        "Registrar pesos y repeticiones",
        "Seguir sistema semáforo ante molestias",
      ],
    };

    return Response.json(resultado);
  } catch (error) {
    console.error("Error generating program:", error);
    return Response.json(
      { error: "No se pudo generar el programa. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
