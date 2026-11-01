export type ExerciseType = "compuesto_libre" | "maquina" | "aislado";

/** Cómo se arma la lista de cargas disponibles de un equipo. */
export type LoadScheme =
  | { kind: "lista"; loads: number[] }
  | { kind: "pasos"; min: number; max: number; step: number }
  | { kind: "tramos"; tramos: { from: number; to: number; step: number }[] }
  | {
      kind: "discos";
      barra: number;
      /** Discos disponibles; `cantidad` = unidades por lado. */
      discos: { peso: number; cantidad: number }[];
    };

export interface Prescription {
  exerciseId: string;
  exerciseName: string;
  type: ExerciseType;
  rirTarget: number; // 0-4
  repMin: number;
  repMax: number;
  sets: number;
  restSec: number;
  scheme: LoadScheme;
  allowCalibration: boolean;
  harderVariant?: string;
  easierVariant?: string;
  /** false si el ejercicio no admite versión unilateral (se omite ese nivel). */
  unilateral?: boolean;
  startLoad?: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  level: "principiante" | "intermedio" | "avanzado";
  initialBias?: number;
}

export type RirReported = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 6 = "5+"

/** Lo que el alumno informa de una serie. */
export interface SetEntry {
  setIndex: number;
  load: number;
  reps: number;
  rirReported: RirReported;
  pain: boolean;
  techniqueBroken: boolean;
}

export interface SetLog extends SetEntry {
  intensifier?: number;
  valid: boolean;
  timestamp: string;
}

export type LadderKind = "up" | "down";
export interface LadderState {
  kind: LadderKind;
  /** 1-based dentro de la escalera de ese ejercicio. */
  level: number;
}

export type DecisionColor =
  | "bajar"
  | "mantener"
  | "subir"
  | "subir2"
  | "tecnica"
  | "detener";

export type DecisionRule =
  | "dolor"
  | "tecnica"
  | "reps_minimas"
  | "histeresis"
  | "recalculo"
  | "salto_maximo"
  | "anti_estancamiento"
  | "escalera";

export interface Decision {
  action: "continuar" | "detener";
  color: DecisionColor;
  rule: DecisionRule;
  /** null cuando se detiene o cuando la escalera reemplaza la carga. */
  nextLoad: number | null;
  ladder: LadderState | null;
  ladderText?: string;
  message: string;
  alertCoach?: string;
  setValid: boolean;
  rirCorr: number;
  e1rm?: number;
  trace: string[];
}
