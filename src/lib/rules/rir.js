export function evaluarRIR(rir, esCompuesto = true) {
  const valor = Number(rir);

  // RIR <0: fallo técnico
  if (valor < 0) {
    return {
      recomendacion: "bajarCarga",
      motivo: "Fallo técnico o forma comprometida",
      intensidad: "excesiva",
    };
  }

  // RIR 0
  if (valor === 0) {
    if (esCompuesto) {
      return {
        recomendacion: "bajarCarga",
        motivo: "Fallo técnico no recomendado en compuestos",
        intensidad: "excesiva",
      };
    }
    return {
      recomendacion: "subirPeso",
      motivo: "Fallo permitido ocasionalmente en accesorios",
      intensidad: "excesiva",
    };
  }

  // RIR 1
  if (valor === 1) {
    return {
      recomendacion: "mantener",
      motivo: "Buena intensidad si es última serie",
      intensidad: "óptima",
    };
  }

  // RIR 2
  if (valor === 2) {
    return {
      recomendacion: "mantener",
      motivo: "Zona óptima para progreso",
      intensidad: "óptima",
    };
  }

  // RIR 3
  if (valor === 3) {
    return {
      recomendacion: "mantener",
      motivo: "Buena intensidad para series iniciales",
      intensidad: "óptima",
    };
  }

  // RIR >=4
  if (valor >= 4) {
    const motivo =
      valor > 5
        ? "Muy fácil, claramente insuficiente"
        : "Estímulo bajo, RIR demasiado alto";
    return {
      recomendacion: "subirReps",
      motivo,
      intensidad: "insuficiente",
    };
  }

  // Fallback para valores decimales entre tramos
  if (valor > 3 && valor < 4) {
    return {
      recomendacion: "subirReps",
      motivo: "Estímulo bajo, RIR demasiado alto",
      intensidad: "insuficiente",
    };
  }

  if (valor > 2 && valor < 3) {
    return {
      recomendacion: "mantener",
      motivo: "Intensidad cercana a óptima",
      intensidad: "óptima",
    };
  }

  if (valor > 1 && valor < 2) {
    return {
      recomendacion: "mantener",
      motivo: "Intensidad efectiva para progreso",
      intensidad: "óptima",
    };
  }

  // valor entre 0 y 1 no capturado explícitamente
  if (valor > 0 && valor < 1) {
    return {
      recomendacion: "mantener",
      motivo: "Alta intensidad; vigila técnica si te acercas al fallo",
      intensidad: "óptima",
    };
  }

  return {
    recomendacion: "mantener",
    motivo: "Valor fuera de los umbrales típicos, revisar entrada",
    intensidad: "óptima",
  };
}

export function esRIRValido(rir) {
  const valor = Number(rir);
  return valor >= -1 && valor <= 6;
}
