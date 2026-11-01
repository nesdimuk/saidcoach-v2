import { roundDown } from "./load-scheme";
import type { Prescription, StudentProfile } from "./types";

export interface StartLoadInput {
  prescription: Prescription;
  loads: number[];
  /** Última carga válida del ejercicio, si hay historial. */
  lastValidLoad?: number | null;
  daysSinceLast?: number | null;
}

export type StartLoad =
  | { kind: "carga"; load: number; reducedBy: number }
  | { kind: "preguntar" };

/** Sección 7: carga inicial, con descuento por días sin entrenar. */
export function startingLoad(i: StartLoadInput): StartLoad {
  const base = i.lastValidLoad ?? i.prescription.startLoad;
  if (base == null) return { kind: "preguntar" };

  const days = i.lastValidLoad != null ? (i.daysSinceLast ?? 0) : 0;
  const reducedBy = days > 21 ? 0.15 : days > 10 ? 0.075 : 0;
  return { kind: "carga", load: roundDown(i.loads, base * (1 - reducedBy)), reducedBy };
}

/** Sesgo inicial sugerido: principiante +1, resto 0, salvo que el entrenador lo fije. */
export function initialBias(s: StudentProfile): number {
  if (s.initialBias !== undefined) return s.initialBias;
  return s.level === "principiante" ? 1 : 0;
}
