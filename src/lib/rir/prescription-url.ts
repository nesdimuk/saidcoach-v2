import { cleanPhone } from "./report";
import type { ExerciseType, LoadScheme, Prescription, StudentProfile } from "./engine";

export interface RirPayload {
  prescription: Prescription;
  student?: StudentProfile;
  /** WhatsApp del entrenador (solo dígitos, formato internacional). */
  trainerPhone?: string;
}

const TYPES: ExerciseType[] = ["compuesto_libre", "maquina", "aislado"];

export function encodePayload(payload: RirPayload | Prescription): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export type DecodeResult = { ok: true; value: RirPayload } | { ok: false; error: string };

export function decodePayload(param: string): DecodeResult {
  let json: unknown;
  try {
    // acepta base64 estándar o base64url, con o sin relleno
    const b64 = param.trim().replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    json = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
  } catch {
    return { ok: false, error: "El link no se pudo leer. Pídele a tu entrenador que lo envíe de nuevo." };
  }
  if (!isObj(json)) return { ok: false, error: "El link no tiene una prescripción válida." };

  const rawP = isObj(json.prescription) ? json.prescription : json;
  const prescription = parsePrescription(rawP);
  if (typeof prescription === "string") return { ok: false, error: prescription };

  let student: StudentProfile | undefined;
  if (isObj(json.student) && typeof json.student.id === "string" && typeof json.student.name === "string") {
    const lvl = json.student.level;
    student = {
      id: json.student.id,
      name: json.student.name,
      level: lvl === "intermedio" || lvl === "avanzado" ? lvl : "principiante",
      initialBias: typeof json.student.initialBias === "number" ? json.student.initialBias : undefined,
    };
  }
  const trainerPhone = typeof json.trainerPhone === "string" ? cleanPhone(json.trainerPhone) ?? undefined : undefined;
  return { ok: true, value: { prescription, student, trainerPhone } };
}

// JSON externo: se valida campo por campo abajo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rec = Record<string, any>;
const isObj = (v: unknown): v is Rec =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function parseScheme(s: unknown): LoadScheme | null {
  if (!isObj(s)) return null;
  switch (s.kind) {
    case "lista":
      return Array.isArray(s.loads) && s.loads.length > 0 && s.loads.every((n: unknown) => num(n) && n > 0)
        ? { kind: "lista", loads: s.loads }
        : null;
    case "pasos":
      return num(s.min) && num(s.max) && num(s.step) && s.step > 0 && s.min > 0 && s.max >= s.min
        ? { kind: "pasos", min: s.min, max: s.max, step: s.step }
        : null;
    case "tramos":
      return Array.isArray(s.tramos) &&
        s.tramos.length > 0 &&
        s.tramos.every((t: Rec) => isObj(t) && num(t.from) && num(t.to) && num(t.step) && t.step > 0 && t.to >= t.from)
        ? { kind: "tramos", tramos: s.tramos }
        : null;
    case "discos":
      return num(s.barra) &&
        Array.isArray(s.discos) &&
        s.discos.every((d: Rec) => isObj(d) && num(d.peso) && d.peso > 0 && Number.isInteger(d.cantidad) && d.cantidad >= 0)
        ? { kind: "discos", barra: s.barra, discos: s.discos }
        : null;
    default:
      return null;
  }
}

function parsePrescription(p: Rec): Prescription | string {
  if (typeof p.exerciseName !== "string" || !p.exerciseName) return "Falta el nombre del ejercicio.";
  if (!TYPES.includes(p.type)) return "Tipo de ejercicio inválido.";
  if (!num(p.rirTarget) || p.rirTarget < 0 || p.rirTarget > 4) return "El RIR objetivo debe estar entre 0 y 4.";
  if (!num(p.repMin) || !num(p.repMax) || p.repMin < 1 || p.repMax < p.repMin) return "El rango de repeticiones es inválido.";
  if (!num(p.sets) || p.sets < 1 || p.sets > 12) return "Cantidad de series inválida.";
  // compatibilidad con el spec original: `loads: number[]`
  const scheme = parseScheme(p.scheme ?? (Array.isArray(p.loads) ? { kind: "lista", loads: p.loads } : null));
  if (!scheme) return "Las cargas disponibles son inválidas.";
  return {
    exerciseId: typeof p.exerciseId === "string" && p.exerciseId ? p.exerciseId : p.exerciseName.toLowerCase().replace(/\W+/g, "-"),
    exerciseName: p.exerciseName,
    type: p.type,
    rirTarget: p.rirTarget,
    repMin: p.repMin,
    repMax: p.repMax,
    sets: p.sets,
    restSec: num(p.restSec) && p.restSec >= 10 ? p.restSec : 90,
    scheme,
    allowCalibration: p.allowCalibration === true,
    harderVariant: typeof p.harderVariant === "string" ? p.harderVariant : undefined,
    easierVariant: typeof p.easierVariant === "string" ? p.easierVariant : undefined,
    unilateral: typeof p.unilateral === "boolean" ? p.unilateral : undefined,
    startLoad: num(p.startLoad) ? p.startLoad : undefined,
  };
}
