import { clamp } from "./estimate";
import type { Prescription } from "./types";

const DAY_MS = 86_400_000;

export interface OfferCalibrationInput {
  prescription: Prescription;
  isLastSet: boolean;
  firstSessionAt: Date;
  lastCalibrationAt?: Date | null;
  now: Date;
}

/** Sección 6: cuándo ofrecer el test de calibración. */
export function shouldOfferCalibration(i: OfferCalibrationInput): boolean {
  const { prescription: p } = i;
  if (!p.allowCalibration) return false;
  if (p.type === "compuesto_libre") return false;
  if (!i.isLastSet) return false;
  if (i.now.getTime() - i.firstSessionAt.getTime() < 14 * DAY_MS) return false;
  if (i.lastCalibrationAt && i.now.getTime() - i.lastCalibrationAt.getTime() < 14 * DAY_MS) {
    return false;
  }
  return true;
}

/** error = actual − predicho; bias = clamp(0.5·bias + 0.5·error, −2, +5). */
export function updateBias(bias: number, predicted: number, actual: number): number {
  const error = actual - predicted;
  return clamp(0.5 * bias + 0.5 * error, -2, 5);
}

export type Confidence = "alta" | "media" | "baja";

export function calibrationConfidence(predicted: number, actual: number): Confidence {
  const e = Math.abs(actual - predicted);
  if (e > 3) return "baja";
  if (e > 1) return "media";
  return "alta";
}
