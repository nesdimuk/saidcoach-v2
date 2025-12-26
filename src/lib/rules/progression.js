function parseRange(rango) {
  if (!rango || typeof rango !== "string") return { min: 8, max: 12 };
  const [minStr, maxStr] = rango.split("-").map((v) => Number(v.trim()));
  const min = Number.isFinite(minStr) ? minStr : 8;
  const max = Number.isFinite(maxStr) ? maxStr : Math.max(min, 12);
  return { min, max: Math.max(max, min) };
}

function adjustForObjetivo(range, objetivo) {
  if ((objetivo || "").toLowerCase() === "fuerza") return range;
  // Evita rangos 3-6 o 5-6 cuando el objetivo no es fuerza
  if (range.max <= 6) return { min: 8, max: 12 };
  if (range.min < 7) return { min: 8, max: Math.max(range.max, 12) };
  return range;
}

export function applyProgression(ejercicio, datosContexto = {}) {
  const {
    nombre,
    series,
    repsObjetivo,
    repsLogradas = [],
    pesoUsado = 0,
    rirReal,
    dolor = 0,
  } = ejercicio || {};

  const {
    sueno,
    estres,
    semanaMala = false,
    objetivo,
    nivel,
    retornoPausa = false,
  } = datosContexto;

  const notas = [];
  let cambiarEjercicio = false;
  let nuevoPeso = Number(pesoUsado) || 0;

  // Dolor: sistema semáforo
  if (dolor >= 6) {
    notas.push(
      `Dolor ${dolor}/10 en ${nombre || "ejercicio"}: detener y cambiar ejercicio.`
    );
    return {
      nuevoPeso,
      nuevoRangoReps: repsObjetivo || "8-12",
      notas,
      cambiarEjercicio: true,
    };
  }

  if (dolor >= 4) {
    nuevoPeso = nuevoPeso * 0.75; // baja 25%
    notas.push(
      `Dolor moderado ${dolor}/10: reduce peso 20-30% o limita ROM para ${nombre || "ejercicio"}.`
    );
  }

  const rangoBase = parseRange(repsObjetivo);
  let rango = adjustForObjetivo(rangoBase, objetivo);

  // Retorno tras pausa prolongada
  if (retornoPausa) {
    nuevoPeso = nuevoPeso * 0.8; // baja 20%
    notas.push(
      "Retorno tras pausa >2 semanas: reducir cargas 15-30% y priorizar técnica durante 1-2 semanas."
    );
  }

  // Semana mala por contexto
  const suenoBajo = sueno !== undefined && Number(sueno) < 6;
  const estresAlto = (estres || "").toLowerCase() === "alto";
  const semanaDificil = semanaMala || suenoBajo || estresAlto;

  if (semanaDificil) {
    notas.push(
      "Semana mala (sueño <6h o estrés alto): reducir volumen 20-30%, mantener peso y trabajar a RIR 3-4."
    );
  } else {
    notas.push("Semana buena: puedes permitir RIR 1-2 en las últimas series.");
  }

  // Doble progresión
  const minLogrado = repsLogradas.length
    ? Math.min(...repsLogradas.map(Number))
    : null;
  const maxLogrado = repsLogradas.length
    ? Math.max(...repsLogradas.map(Number))
    : null;

  if (!semanaDificil) {
    if (minLogrado !== null && minLogrado >= rango.max) {
      const incremento = 1.05; // +5% dentro del rango 2.5-10%
      nuevoPeso = nuevoPeso * incremento;
      notas.push(
        `Doble progresión: alcanzaste el tope del rango (${rango.max} reps). Sube peso ~5%.`
      );
    } else if (maxLogrado !== null && maxLogrado < rango.max) {
      notas.push("No alcanzaste el tope de reps: mantiene el peso y busca mejorar técnica.");
    }

    if (Number(rirReal) > 4) {
      rango = { min: rango.min + 1, max: rango.max + 2 };
      notas.push("RIR >4 (muy fácil): sube el rango de reps para la próxima sesión.");
    }

    if (Number(rirReal) <= 1) {
      nuevoPeso = nuevoPeso * 0.93; // baja 7%
      notas.push("RIR ≤1 y posible técnica comprometida: baja 5-10% la carga y refuerza técnica.");
    }
  } else {
    // Semana difícil: mantener peso
    nuevoPeso = nuevoPeso; // explícito
  }

  // Asegura que no se violen rangos prohibidos si el objetivo no es fuerza
  rango = adjustForObjetivo(rango, objetivo);

  if (nivel && nivel.toLowerCase() === "principiante") {
    notas.push("Nivel principiante: prioriza técnica y control; incrementos pequeños.");
  }

  const nuevoRangoReps = `${rango.min}-${rango.max}`;

  return {
    nuevoPeso: Number(nuevoPeso.toFixed(2)),
    nuevoRangoReps,
    notas,
    cambiarEjercicio,
  };
}
