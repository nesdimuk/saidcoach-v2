const COMPOUND_REPS = "8-12";
const ACCESSORY_REPS = "10-15";

function hasEquip(material = "", keyword) {
  const normalized = Array.isArray(material)
    ? material.join(" ").toLowerCase()
    : String(material || "").toLowerCase();
  return normalized.includes(keyword);
}

function volumeFactor({ sueno, estres }) {
  let factor = 1;
  if (sueno !== undefined && Number(sueno) < 6) {
    factor *= 0.8; // reduce ~20% for low sleep
  }
  if ((estres || "").toLowerCase() === "alto") {
    factor *= 0.8; // reduce 20% for high stress
  }
  return factor;
}

function seriesCount(base, factor) {
  return Math.max(2, Math.round(base * factor));
}

function pickPress({ material, dolorHombro }) {
  const hasBarra = hasEquip(material, "barra");
  const hasMancuerna = hasEquip(material, "mancuerna") || hasEquip(material, "dumbbell");
  const hasLandmine = hasEquip(material, "landmine");

  if (dolorHombro) {
    if (hasLandmine) return "Landmine press";
    if (hasMancuerna) return "Press inclinado con mancuernas agarre neutro";
    return "Push-up con agarre neutro (paralelas/bandas)";
  }

  if (hasBarra) return "Press banca con barra";
  if (hasMancuerna) return "Press banca con mancuernas";
  return "Push-up con lastre/bandas";
}

function pickPull({ material }) {
  const hasBarra = hasEquip(material, "barra");
  const hasPolea = hasEquip(material, "polea") || hasEquip(material, "cable");
  const hasBandas = hasEquip(material, "banda");
  const hasMancuerna = hasEquip(material, "mancuerna") || hasEquip(material, "dumbbell");

  if (hasPolea) return "Jalón al pecho / dominada asistida en polea";
  if (hasBarra) return "Remo con barra";
  if (hasMancuerna) return "Remo con mancuernas apoyado";
  if (hasBandas) return "Remo con bandas ancladas";
  return "Inverted row con mesa o TRX";
}

function pickSquat({ material }) {
  const hasBarra = hasEquip(material, "barra");
  const hasMancuerna = hasEquip(material, "mancuerna") || hasEquip(material, "dumbbell");
  const hasBandas = hasEquip(material, "banda");

  if (hasBarra) return "Sentadilla trasera con barra";
  if (hasMancuerna) return "Goblet squat con mancuernas";
  if (hasBandas) return "Sentadilla con banda";
  return "Sentadilla aire con tempo";
}

function pickHinge({ material }) {
  const hasBarra = hasEquip(material, "barra");
  const hasMancuerna = hasEquip(material, "mancuerna") || hasEquip(material, "dumbbell");
  const hasBandas = hasEquip(material, "banda");

  if (hasBarra) return "Peso muerto rumano con barra";
  if (hasMancuerna) return "Peso muerto rumano con mancuernas";
  if (hasBandas) return "Peso muerto rumano con banda";
  return "Hip hinge con mochila cargada";
}

function pickVerticalPull({ material }) {
  const hasPolea = hasEquip(material, "polea") || hasEquip(material, "cable");
  const hasBarra = hasEquip(material, "barra");
  const hasBandas = hasEquip(material, "banda");

  if (hasPolea) return "Facepull en polea";
  if (hasBandas) return "Facepull con banda";
  if (hasBarra) return "Remo al mentón con barra ligera";
  return "YTWs con mochila/banda ligera";
}

function accessoryList({ dolorHombro, material }) {
  const hasPolea = hasEquip(material, "polea") || hasEquip(material, "cable");
  const hasBandas = hasEquip(material, "banda");
  const hasMancuerna = hasEquip(material, "mancuerna") || hasEquip(material, "dumbbell");

  const lateral = dolorHombro
    ? "Elevaciones laterales con banda agarre neutro"
    : hasMancuerna
    ? "Elevaciones laterales con mancuernas"
    : "Elevaciones laterales con banda";

  const curl = hasMancuerna ? "Curl martillo con mancuernas" : "Curl con banda";
  const triceps = hasPolea
    ? "Extensión de tríceps en polea"
    : hasBandas
    ? "Extensión de tríceps con banda"
    : "Fondos en banco";

  const core = "Plancha y anti-rotación (Pallof con banda si está disponible)";

  return [lateral, curl, triceps, core];
}

function ensureRepRange(objetivo, defaultRange) {
  const goal = (objetivo || "").toLowerCase();
  if (goal !== "fuerza") return defaultRange;
  return defaultRange === ACCESSORY_REPS ? "10-12" : "6-10";
}

function buildDay({ baseCompuestos, accesorios, factor, objetivo }) {
  const compoundReps = ensureRepRange(objetivo, COMPOUND_REPS);
  const accessoryReps = ensureRepRange(objetivo, ACCESSORY_REPS);

  const compuestos = baseCompuestos.map((nombre) => ({
    nombre,
    tipo: "compuesto",
    series: seriesCount(4, factor),
    reps: compoundReps,
  }));

  const accesoriosLista = accesorios.map((nombre) => ({
    nombre,
    tipo: "accesorio",
    series: seriesCount(3, factor),
    reps: accessoryReps,
  }));

  const total = compuestos.length + accesoriosLista.length;
  const targetCompuestos = Math.round(total * 0.7);

  const balanced = [
    ...compuestos.slice(0, targetCompuestos),
    ...accesoriosLista.slice(0, total - targetCompuestos),
  ];

  return balanced;
}

export function selectExercises({
  objetivo,
  nivel,
  material,
  lesiones,
  dolorHombro,
  sueno,
  estres,
}) {
  const factor = volumeFactor({ sueno, estres });
  const inicioSimple = (nivel || "").toLowerCase() === "principiante";
  const shoulderPain = Boolean(dolorHombro) || (lesiones || "").toLowerCase().includes("hombro");

  const diaACompuestos = [
    pickSquat({ material }),
    pickPress({ material, dolorHombro: shoulderPain }),
    pickPull({ material }),
  ];

  const diaBCompuestos = [
    pickHinge({ material }),
    pickPress({ material, dolorHombro: shoulderPain }),
    pickVerticalPull({ material }),
  ];

  const diaCCompuestos = [
    pickSquat({ material }),
    pickPull({ material }),
    pickHinge({ material }),
  ];

  const accesorios = accessoryList({ dolorHombro: shoulderPain, material });

  if (inicioSimple) {
    // Prioriza estabilidad y simplicidad
    diaACompuestos.push("Prensa de piernas / split squat estable");
    diaBCompuestos.push("Remo pecho apoyado / remo en polea sentado");
    diaCCompuestos.push("Puente de glúteo / hip thrust en banco");
  } else {
    diaACompuestos.push("Zancadas caminando / bulgarian split squat");
    diaBCompuestos.push("Peso muerto sumo / good morning ligero");
    diaCCompuestos.push("Press inclinado / dips asistidos");
  }

  return {
    diaA: buildDay({
      baseCompuestos: diaACompuestos,
      accesorios: accesorios.slice(0, 2),
      factor,
      objetivo,
    }),
    diaB: buildDay({
      baseCompuestos: diaBCompuestos,
      accesorios: accesorios.slice(1, 3),
      factor,
      objetivo,
    }),
    diaC: buildDay({
      baseCompuestos: diaCCompuestos,
      accesorios: accesorios.slice(2, 4),
      factor,
      objetivo,
    }),
  };
}
