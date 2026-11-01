import type { LadderKind, Prescription } from "./types";

export interface LadderStep {
  text: string;
  /** Llegar a este peldaño avisa al entrenador. */
  alert?: string;
  /** Peldaño final de la escalera inversa: se detiene el ejercicio. */
  stop?: boolean;
}

/** Escalera de intensificación (sección 4): no hay más peso. */
export function upLadder(p: Prescription): LadderStep[] {
  const steps: LadderStep[] = [
    { text: `Sube hasta ${p.repMax + 3} reps.` },
    { text: "Baja en 3-4 segundos cada rep." },
    { text: "Pausa 2 s en el punto más difícil." },
    { text: "Media rep + rep completa = 1." },
  ];
  if (p.unilateral !== false) steps.push({ text: "Hazlo a un brazo / una pierna." });
  steps.push({ text: "Descanso: 60 s." });
  steps.push({
    text: p.harderVariant ? `Cambia a: ${p.harderVariant}.` : "Avisa a tu entrenador.",
    alert: "Necesita más carga o progresión",
  });
  return steps;
}

/** Escalera inversa (sección 5): ni el peso mínimo alcanza. */
export function downLadder(p: Prescription): LadderStep[] {
  return [
    { text: `Baja a ${Math.max(5, p.repMin - 2)} reps.` },
    { text: "Reduce el rango de movimiento." },
    {
      text: p.easierVariant
        ? `Cambia a: ${p.easierVariant}.`
        : "Usa una variante más fácil (asistida o con apoyo).",
    },
    {
      text: "Detén el ejercicio y avisa a tu entrenador.",
      stop: true,
      alert: "No alcanza ni el peso mínimo: detener y revisar",
    },
  ];
}

export const ladderFor = (kind: LadderKind, p: Prescription) =>
  kind === "up" ? upLadder(p) : downLadder(p);

/**
 * Nuevo nivel (1-based; 0 = sale de la escalera).
 * `tooEasy` → en la de subida sube de nivel; en la inversa baja.
 */
export function nextLevel(
  kind: LadderKind,
  level: number,
  steps: number,
  signal: "facil" | "dificil" | "ok",
): number {
  if (signal === "ok") return level;
  const goesUp = (kind === "up") === (signal === "facil");
  return goesUp ? Math.min(steps, level + 1) : level - 1;
}
