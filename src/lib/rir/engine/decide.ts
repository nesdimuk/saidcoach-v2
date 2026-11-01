import {
  clamp,
  correctedRir,
  isValidSet,
  rawLoadFor,
  sessionEstimate,
} from "./estimate";
import { ladderFor, nextLevel } from "./intensify";
import { floorIndex, indexOfLoad } from "./load-scheme";
import type {
  Decision,
  DecisionColor,
  DecisionRule,
  LadderKind,
  LadderState,
  Prescription,
  SetEntry,
} from "./types";

const EPS = 1e-9;

export interface DecideInput {
  prescription: Prescription;
  /** Cargas disponibles (ya expandidas, sin las que el alumno marcó inexistentes). */
  loads: number[];
  bias: number;
  /** Todas las series de la sesión; la última es la recién hecha. */
  sets: SetEntry[];
  /** Escalera activa tras la serie anterior, si la hay. */
  ladder?: LadderState | null;
}

interface Recalc {
  idxNext: number;
  raw: number | null;
  e1rm: number | null;
  rule: DecisionRule;
}

/** Sección 3.4: prescripción con tope de cambio y redondeo hacia abajo. */
function recalc(
  p: Prescription,
  loads: number[],
  idx: number,
  bias: number,
  sets: SetEntry[],
): Recalc {
  const top = loads.length - 1;
  const load = loads[idx];
  const cap = sets.length === 1 ? 0.15 : 0.1;
  const est = sessionEstimate(sets.filter(isValidSet), bias);

  if (est.unreliable || est.e1rm === null) {
    // rtf > 20: la fórmula no es confiable → salto máximo permitido, mínimo un escalón.
    const jump = Math.max(floorIndex(loads, load * (1 + cap)), Math.min(idx + 1, top));
    return { idxNext: jump, raw: null, e1rm: null, rule: "salto_maximo" };
  }

  const repTarget = Math.round((p.repMin + p.repMax) / 2);
  const raw = rawLoadFor(est.e1rm, repTarget, p.rirTarget);
  const clamped = clamp(raw, load * (1 - cap), load * (1 + cap));
  let idxNext = Math.max(0, floorIndex(loads, clamped));
  // Con escalones más grandes que el tope, igual se permite un escalón si la estimación lo pide.
  if (raw > load && idxNext <= idx && idx < top && raw >= loads[idx + 1] - EPS) {
    idxNext = idx + 1;
  }
  return { idxNext, raw, e1rm: est.e1rm, rule: "recalculo" };
}

const fmt = (kg: number) => `${String(kg).replace(".", ",")} kg`;

function colorFor(delta: number): DecisionColor {
  if (delta < 0) return "bajar";
  if (delta === 0) return "mantener";
  return delta === 1 ? "subir" : "subir2";
}

function loadMessage(color: DecisionColor, load: number): string {
  switch (color) {
    case "bajar":
      return `Baja a ${fmt(load)}.`;
    case "subir":
      return `Sube a ${fmt(load)}.`;
    case "subir2":
      return `Sube a ${fmt(load)} (salta 2 escalones).`;
    default:
      return `Mantén ${fmt(load)}.`;
  }
}

export function decideNext(input: DecideInput): Decision {
  const { prescription: p, loads, bias, sets } = input;
  const last = sets[sets.length - 1];
  const rirCorr = correctedRir(last.rirReported, bias);
  const setValid = isValidSet(last);
  const idx = indexOfLoad(loads, last.load);
  const top = loads.length - 1;
  const target = p.rirTarget;
  const trace: string[] = [`rirCorr=${rirCorr} (reportado ${last.rirReported}, sesgo ${bias})`];

  const base = { rirCorr, setValid, trace };

  const toLadder = (kind: LadderKind, level: number, rule: DecisionRule): Decision => {
    const steps = ladderFor(kind, p);
    const step = steps[level - 1];
    const load = loads[kind === "up" ? top : 0];
    trace.push(`escalera ${kind} nivel ${level}`);
    return {
      ...base,
      action: step.stop ? "detener" : "continuar",
      color: step.stop ? "detener" : "tecnica",
      rule,
      nextLoad: load,
      ladder: { kind, level },
      ladderText: step.text,
      message: step.stop ? step.text : `Con ${fmt(load)}: ${step.text}`,
      alertCoach: step.alert,
    };
  };

  const toLoad = (idxNext: number, rule: DecisionRule, extra: Partial<Decision> = {}): Decision => {
    const color = colorFor(idxNext - idx);
    return {
      ...base,
      action: "continuar",
      color,
      rule,
      nextLoad: loads[idxNext],
      ladder: null,
      message: loadMessage(color, loads[idxNext]),
      ...extra,
    };
  };

  // 3.1 — filtros de seguridad, en orden
  if (last.pain) {
    trace.push("dolor → detener");
    return {
      ...base,
      action: "detener",
      color: "detener",
      rule: "dolor",
      nextLoad: null,
      ladder: null,
      message: "Paramos acá. Avísale a tu entrenador.",
      alertCoach: "Dolor reportado",
    };
  }

  const tooHard =
    last.techniqueBroken || last.reps < p.repMin || rirCorr < target - 1;

  // Escalera activa: manda sobre el cálculo de carga
  if (input.ladder) {
    const { kind, level } = input.ladder;
    const steps = ladderFor(kind, p);
    const signal = tooHard ? "dificil" : rirCorr > target + 1 ? "facil" : "ok";
    const lvl = nextLevel(kind, level, steps.length, signal);
    if (lvl === 0) {
      trace.push("sale de la escalera");
      const exitIdx = kind === "up" ? top : 0;
      return toLoad(exitIdx, "escalera", {
        color: "mantener",
        message: `Vuelve al trabajo normal con ${fmt(loads[exitIdx])}.`,
      });
    }
    return toLadder(kind, lvl, "escalera");
  }

  if (last.techniqueBroken) {
    trace.push("técnica rota → serie inválida, 1 escalón abajo");
    return idx === 0 ? toLadder("down", 1, "tecnica") : toLoad(idx - 1, "tecnica");
  }

  const rc = recalc(p, loads, idx, bias, sets);
  const extra = { e1rm: rc.e1rm ?? undefined };

  if (last.reps < p.repMin) {
    trace.push(`reps ${last.reps} < repMin ${p.repMin} → máximo el cálculo, forzado ≤ 1 escalón abajo`);
    if (idx === 0) return toLadder("down", 1, "reps_minimas");
    return toLoad(Math.min(rc.idxNext, idx - 1), "reps_minimas", extra);
  }

  // 3.5 — histéresis por fatiga (desde la 3ª serie válida)
  const validSets = sets.filter(isValidSet);
  const inWindow = rirCorr >= target - 1 && rirCorr <= target + 1;
  if (validSets.length >= 3 && inWindow) {
    trace.push("dentro de la ventana de RIR → mantener (fatiga normal)");
    return toLoad(idx, "histeresis", extra);
  }

  // 3.6 — límites de equipamiento
  if (idx === top && rc.raw !== null && rc.raw > loads[top] + EPS && rirCorr > target + 1) {
    return toLadder("up", 1, "escalera");
  }
  if (idx === 0 && rc.raw !== null && rc.raw < loads[0] - EPS && rirCorr < target - 1) {
    return toLadder("down", 1, "escalera");
  }

  // 3.4 — anti-estancamiento
  if (rc.idxNext === idx && rirCorr > target + 1 && idx < top) {
    const prev = validSets[validSets.length - 2];
    if (
      prev &&
      Math.abs(prev.load - last.load) < EPS &&
      correctedRir(prev.rirReported, bias) > target + 1
    ) {
      trace.push("misma carga tras redondeo y RIR alto 2 veces → +1 escalón");
      return toLoad(idx + 1, "anti_estancamiento", extra);
    }
  }

  trace.push(`${rc.rule}: raw=${rc.raw?.toFixed(2) ?? "n/a"} → ${fmt(loads[rc.idxNext])}`);
  return toLoad(rc.idxNext, rc.rule, extra);
}
