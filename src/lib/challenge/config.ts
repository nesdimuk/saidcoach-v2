export const CHALLENGE_TIMEZONE = process.env.CHALLENGE_TIMEZONE || "America/Santiago";

export const NUTRITION_BONUS_CUTOFF = process.env.NUTRITION_BONUS_CUTOFF || "09:00";
export const NUTRITION_BASE_POINTS = 5;
export const NUTRITION_BONUS_POINTS = 5;

export const MOVEMENT_TOP_BONUS: Record<1 | 2 | 3, number> = {
  1: 5,
  2: 3,
  3: 1,
};

export const STREAK_TASKS_REQUIRED = Number(process.env.STREAK_TASKS_REQUIRED || 4);

export const MAX_CHALLENGE_DURATION_DAYS = 90;
