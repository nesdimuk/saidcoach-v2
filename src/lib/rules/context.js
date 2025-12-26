function minFactor(current, next) {
  return Math.min(current, next);
}

export function evaluarContexto(datosContexto = {}) {
  const {
    sueno,
    estres,
    viajando = false,
    enfermedad = "ninguna",
    pausaSemanas = 0,
  } = datosContexto;

  let factorVolumen = 1;
  let factorIntensidad = 1;
  let tipoSemana = "buena";
  const notasContexto = [];
  let flagMala = false;
  let flagRegular = false;

  // Enfermedad (prioridad alta)
  if (enfermedad === "fiebre") {
    notasContexto.push("Enfermedad con fiebre: no entrenar. Prioridad recuperación.");
    return {
      tipoSemana: "mala",
      factorVolumen: 0,
      factorIntensidad: 0,
      notasContexto,
    };
  }

  if (enfermedad === "moderada") {
    factorVolumen = minFactor(factorVolumen, 0.5);
    factorIntensidad = minFactor(factorIntensidad, 0.7);
    notasContexto.push("Enfermedad moderada: semana mala, bajar volumen ~50% e intensidad ~30%.");
    flagMala = true;
  } else if (enfermedad === "leve") {
    factorVolumen = minFactor(factorVolumen, 0.6);
    factorIntensidad = minFactor(factorIntensidad, 0.8);
    notasContexto.push("Enfermedad leve: semana regular, reducir volumen ~40% e intensidad ligera.");
    flagRegular = true;
  }

  // Sueño
  if (sueno !== undefined && Number(sueno) < 6) {
    factorVolumen = minFactor(factorVolumen, 0.75);
    factorIntensidad = minFactor(factorIntensidad, 0.85);
    notasContexto.push("Sueño <6h: semana mala, reducir volumen 20-30% e intensidad ligera.");
    flagMala = true;
  }

  // Estrés
  if ((estres || "").toLowerCase() === "alto") {
    factorVolumen = minFactor(factorVolumen, 0.7);
    factorIntensidad = minFactor(factorIntensidad, 0.8);
    notasContexto.push("Estrés alto: semana mala, reducir volumen ~30% e intensidad moderada.");
    flagMala = true;
  }

  // Viajes
  if (viajando) {
    factorVolumen = minFactor(factorVolumen, 0.55);
    factorIntensidad = minFactor(factorIntensidad, 1);
    notasContexto.push("Viajando: enfoque mínimo efectivo, volumen 50-60%, intensidad mantenida.");
    flagRegular = true;
  }

  // Pausas largas
  if (Number(pausaSemanas) >= 4) {
    factorVolumen = minFactor(factorVolumen, 0.6);
    factorIntensidad = minFactor(factorIntensidad, 0.65);
    notasContexto.push("Pausa 4-8 semanas: reintegro gradual, volumen 50-70%, intensidad 60-70%.");
    flagRegular = true;
  } else if (Number(pausaSemanas) >= 2) {
    factorVolumen = minFactor(factorVolumen, 0.7);
    factorIntensidad = minFactor(factorIntensidad, 0.75);
    notasContexto.push("Pausa 2-4 semanas: reducir volumen 20-40% e intensidad 20-30%.");
    flagRegular = true;
  }

  // Determinar tipo de semana final
  if (flagMala) {
    tipoSemana = "mala";
  } else if (flagRegular || factorVolumen < 1 || factorIntensidad < 1) {
    tipoSemana = "regular";
  } else {
    tipoSemana = "buena";
    factorVolumen = 1;
    factorIntensidad = 1;
    notasContexto.push("Semana ideal: aplicar volumen e intensidad completos.");
  }

  return { tipoSemana, factorVolumen, factorIntensidad, notasContexto };
}

export function ajustarVolumenPorContexto(volumenBase, factorVolumen) {
  const ajustado = Math.round((volumenBase || 0) * (factorVolumen || 0));
  if (volumenBase > 1 && ajustado < 1) return 1;
  return ajustado;
}
