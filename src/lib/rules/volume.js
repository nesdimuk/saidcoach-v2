const BASE_RANGES = {
  principiante: { min: 9, max: 12 },
  intermedio: { min: 12, max: 15 },
};

function selectBaseRange(nivel, edad) {
  const levelKey = (nivel || "").toLowerCase();
  const base = BASE_RANGES[levelKey] || { min: 10, max: 14 };

  if (edad && Number(edad) > 45) {
    return { min: 9, max: 15 };
  }

  return base;
}

function applyReductions(range, sueno, estres, notas) {
  let factor = 1;

  if (sueno !== undefined && Number(sueno) < 6) {
    factor *= 0.75; // reduce 25% for low sleep quality
    notas.push("Sueño <6h: reducir volumen total 20-30%.");
  }

  if ((estres || "").toLowerCase() === "alto") {
    factor *= 0.8; // reduce 20% for high stress
    notas.push("Estrés alto: reducir volumen total 20%.");
  }

  return {
    min: Math.max(1, Math.round(range.min * factor)),
    max: Math.max(1, Math.round(range.max * factor)),
    factor,
  };
}

export function calculateWeeklyVolume({ edad, nivel, sueno, estres, objetivo }) {
  const notas = [];
  const baseRange = selectBaseRange(nivel, edad);

  if (nivel) {
    notas.push(`Nivel ${nivel}: aplicar rango base correspondiente.`);
  } else {
    notas.push("Nivel no especificado: usar rango base general.");
  }

  if (edad && Number(edad) > 45) {
    notas.push("Edad >45: rango objetivo 9–15 series.");
  }

  const adjusted = applyReductions(baseRange, sueno, estres, notas);

  if ((objetivo || "").toLowerCase() !== "fuerza") {
    notas.push(
      "Objetivo distinto a fuerza: evitar rangos de 3–6 y 5–6 repeticiones."
    );
  }

  const modificacionPorContexto =
    adjusted.factor !== 1
      ? `Volumen ajustado por factor ${adjusted.factor.toFixed(2)} según sueño/estrés.`
      : "Sin reducciones adicionales por sueño o estrés.";

  return {
    seriesPorGrupo: { min: adjusted.min, max: adjusted.max },
    modificacionPorContexto,
    notas,
  };
}
