import type { LoadScheme } from "./types";

const EPS = 1e-9;

export const round3 = (n: number) => Math.round(n * 1000) / 1000;

function uniqueSorted(values: number[]): number[] {
  const rounded = values.map(round3).filter((v) => v > 0 && Number.isFinite(v));
  return [...new Set(rounded)].sort((a, b) => a - b);
}

/** Convierte un esquema en la lista ordenada de cargas posibles (kg totales). */
export function expandScheme(scheme: LoadScheme, excluded: number[] = []): number[] {
  let loads: number[] = [];

  switch (scheme.kind) {
    case "lista":
      loads = scheme.loads;
      break;
    case "pasos": {
      const { min, max, step } = scheme;
      if (step <= 0) throw new Error("step debe ser > 0");
      for (let i = 0; min + i * step <= max + EPS; i++) loads.push(min + i * step);
      break;
    }
    case "tramos":
      for (const t of scheme.tramos) {
        if (t.step <= 0) throw new Error("step debe ser > 0");
        for (let i = 0; t.from + i * t.step <= t.to + EPS; i++) loads.push(t.from + i * t.step);
      }
      break;
    case "discos": {
      let sums = new Set<number>([0]);
      for (const d of scheme.discos) {
        const next = new Set<number>();
        for (const s of sums) for (let k = 0; k <= d.cantidad; k++) next.add(round3(s + k * d.peso));
        sums = next;
      }
      loads = [...sums].map((porLado) => scheme.barra + 2 * porLado);
      break;
    }
  }

  const skip = new Set(excluded.map(round3));
  const result = uniqueSorted(loads).filter((l) => !skip.has(l));
  if (result.length === 0) throw new Error("El esquema no produce cargas");
  return result;
}

/** Índice de la mayor carga ≤ x, o -1 si x está bajo el mínimo. */
export function floorIndex(loads: number[], x: number): number {
  let idx = -1;
  for (let i = 0; i < loads.length; i++) if (loads[i] <= x + EPS) idx = i;
  return idx;
}

/** Redondea hacia abajo al valor disponible más cercano (mínimo: el menor). */
export function roundDown(loads: number[], x: number): number {
  return loads[Math.max(0, floorIndex(loads, x))];
}

/** Índice de la carga actual; si no está en la lista, la inmediata inferior. */
export function indexOfLoad(loads: number[], load: number): number {
  return Math.max(0, floorIndex(loads, load));
}

/** Desglose de discos por lado para una carga total, o null si no es posible. */
export function plateBreakdown(
  scheme: Extract<LoadScheme, { kind: "discos" }>,
  total: number,
): { barra: number; porLado: number[] } | null {
  const target = round3((total - scheme.barra) / 2);
  if (target < -EPS) return null;
  const discos = [...scheme.discos].sort((a, b) => b.peso - a.peso);

  const solve = (i: number, rest: number): number[] | null => {
    if (Math.abs(rest) < EPS) return [];
    if (i >= discos.length) return null;
    const d = discos[i];
    for (let k = Math.min(d.cantidad, Math.floor(rest / d.peso + EPS)); k >= 0; k--) {
      const sub = solve(i + 1, round3(rest - k * d.peso));
      if (sub) return [...Array(k).fill(d.peso), ...sub];
    }
    return null;
  };

  const porLado = solve(0, target);
  return porLado ? { barra: scheme.barra, porLado } : null;
}
