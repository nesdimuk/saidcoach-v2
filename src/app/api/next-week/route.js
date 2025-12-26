import { applyProgression } from "@/lib/rules/progression";
import { evaluarRIR } from "@/lib/rules/rir";
import { evaluarDolor } from "@/lib/rules/semaforo";
import { evaluarContexto } from "@/lib/rules/context";

function ajustarSeries(series, factorVolumen) {
  const base = Number(series) || 0;
  const factor = factorVolumen || 1;
  const ajustadas = Math.round(base * factor);
  if (base > 1 && ajustadas < 1) return 1;
  return ajustadas;
}

function validarPayload(programaAnterior, contextoActual) {
  if (!programaAnterior || !contextoActual) {
    return "Faltan programaAnterior o contextoActual en el payload.";
  }
  if (!Array.isArray(programaAnterior.sesiones)) {
    return "El programaAnterior debe incluir sesiones en formato de arreglo.";
  }
  return null;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { programaAnterior, contextoActual } = body || {};

    const validationError = validarPayload(programaAnterior, contextoActual);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    const contexto = evaluarContexto(contextoActual);
    const nuevaSemanaNumero = (programaAnterior.semana || 1) + 1;
    const nivelUsuario = programaAnterior.nivel || "intermedio";

    const sesiones = (programaAnterior.sesiones || []).map((sesion) => {
      const ejerciciosNuevos = (sesion.ejercicios || []).map((ejercicio) => {
        const {
          nombre,
          series,
          repsObjetivo,
          repsLogradas,
          pesoUsado,
          rirReal,
          dolor,
          esCompuesto = true,
        } = ejercicio;

        const dolorEval = evaluarDolor(dolor);
        const rirEval = evaluarRIR(rirReal, esCompuesto);

        const ejercicioContextualizado = {
          nombre,
          series,
          repsObjetivo,
          repsLogradas,
          pesoUsado,
          rirReal,
          dolor,
        };

        const progresion = applyProgression(ejercicioContextualizado, {
          sueno: contextoActual.sueno,
          estres: contextoActual.estres,
          semanaMala: contexto.tipoSemana === "mala",
          objetivo: "composicion corporal",
          nivel: nivelUsuario,
        });

        const seriesAjustadas = ajustarSeries(series, contexto.factorVolumen);
        const sugerirCambio = progresion.cambiarEjercicio || dolorEval.nivel === "rojo";

        const notas = [
          ...(progresion.notas || []),
          rirEval.motivo,
          dolorEval.recomendacion,
        ];

        return {
          nombre,
          series: seriesAjustadas,
          repsObjetivo: progresion.nuevoRangoReps,
          pesoSugerido: progresion.nuevoPeso,
          rirObjetivo: 2,
          notas,
          sugerirCambio,
        };
      });

      return {
        dia: sesion.dia,
        ejercicios: ejerciciosNuevos,
      };
    });

    const nuevaSemana = {
      semana: nuevaSemanaNumero,
      sesiones,
    };

    const respuesta = {
      contexto,
      programaAnterior,
      nuevaSemana,
      resumen: {
        tipoSemana: contexto.tipoSemana,
        mensaje: "Semana ajustada según sueño, estrés, RIR y dolor.",
        recomendaciones: [
          "Mantén un RIR 1–3 en la mayoría de series.",
          "Reduce el volumen si la semana es mala (sueño bajo o estrés alto).",
          "Sustituye ejercicios marcados con sugerirCambio = true.",
          "Registra pesos y repeticiones para seguir progresando.",
        ],
      },
    };

    return Response.json(respuesta, { status: 200 });
  } catch (error) {
    console.error("Error generando la siguiente semana:", error);
    return Response.json(
      { error: "Error generando la siguiente semana" },
      { status: 500 }
    );
  }
}
