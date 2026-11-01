import type { SetEntry } from "./types";

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Una serie cuenta para estimar si no hubo dolor ni técnica rota. */
export const isValidSet = (s: SetEntry) => !s.pain && !s.techniqueBroken;

/** RIR corregido por el sesgo personal (sección 3.2). */
export const correctedRir = (rirReported: number, bias: number) =>
  clamp(rirReported + bias, 0, 8);

/** Epley (sección 3.3). */
export const epley = (load: number, rtf: number) => load * (1 + rtf / 30);

export const MAX_RELIABLE_RTF = 20;

export interface SessionEstimate {
  e1rm: number | null;
  /** true si la última serie tiene rtf > 20: no se puede usar la fórmula. */
  unreliable: boolean;
}

/**
 * Estimación de sesión: última serie 0.6, promedio de las anteriores 0.4.
 * `validSets` en orden cronológico; la última es la recién hecha.
 */
export function sessionEstimate(validSets: SetEntry[], bias: number): SessionEstimate {
  if (validSets.length === 0) return { e1rm: null, unreliable: false };

  const rtfOf = (s: SetEntry) => s.reps + correctedRir(s.rirReported, bias);
  const last = validSets[validSets.length - 1];
  if (rtfOf(last) > MAX_RELIABLE_RTF) return { e1rm: null, unreliable: true };

  const lastE = epley(last.load, rtfOf(last));
  const prev = validSets
    .slice(0, -1)
    .filter((s) => rtfOf(s) <= MAX_RELIABLE_RTF)
    .map((s) => epley(s.load, rtfOf(s)));

  if (prev.length === 0) return { e1rm: lastE, unreliable: false };
  const avg = prev.reduce((a, b) => a + b, 0) / prev.length;
  return { e1rm: 0.6 * lastE + 0.4 * avg, unreliable: false };
}

/** Carga que da `targetRtf` reps al fallo, dado un e1RM (sección 3.4). */
export const rawLoadFor = (e1rm: number, repTarget: number, rirTarget: number) =>
  e1rm / (1 + (repTarget + rirTarget) / 30);
