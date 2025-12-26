import { DateTime } from "luxon";
import { CHALLENGE_TIMEZONE, NUTRITION_BONUS_CUTOFF } from "./config";

const [bonusHour, bonusMinute] = NUTRITION_BONUS_CUTOFF.split(":").map((value) => Number.parseInt(value, 10));

export function getCurrentDateTime() {
  const now = DateTime.now().setZone(CHALLENGE_TIMEZONE);

  return {
    now,
    isoDate: now.toISODate()!,
    startOfDay: now.startOf("day"),
    timezone: CHALLENGE_TIMEZONE,
  };
}

export function getTodayDate() {
  return getCurrentDateTime().isoDate;
}

export function getYesterdayDate() {
  const { now } = getCurrentDateTime();
  return now.minus({ days: 1 }).toISODate()!;
}

export function isBeforeNutritionCutoff(reference = DateTime.now().setZone(CHALLENGE_TIMEZONE)) {
  const cutoff = reference.startOf("day").plus({ hours: bonusHour, minutes: bonusMinute || 0 });
  return reference < cutoff;
}
