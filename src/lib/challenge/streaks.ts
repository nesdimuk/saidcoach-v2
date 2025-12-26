import type { SupabaseClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";
import { CHALLENGE_TIMEZONE, STREAK_TASKS_REQUIRED } from "./config";
import type { DailyLogRow, UserStreakRow } from "./types";

type SupabaseServerClient = SupabaseClient;

export function countCompletedTasks(log: DailyLogRow | null) {
  if (!log) {
    return 0;
  }

  let completed = 0;
  if (log.movement_points > 0) completed += 1;
  if (log.nutrition_points > 0) completed += 1;
  if (log.lesson_points > 0) completed += 1;
  if (log.meditation_points > 0) completed += 1;
  if (log.gratitude_points > 0) completed += 1;
  return completed;
}

export async function recalculateUserStreaks(
  supabase: SupabaseServerClient,
  userId: string,
  companyId: string,
  todayDate: string
): Promise<UserStreakRow> {
  const { data, error } = await supabase
    .from("daily_log")
    .select(
      "id, date, movement_points, nutrition_points, lesson_points, meditation_points, gratitude_points"
    )
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .order("date", { ascending: true })
    .limit(120);

  if (error) {
    throw error;
  }

  const logs = (data as DailyLogRow[]) ?? [];
  const today = DateTime.fromISO(todayDate, { zone: CHALLENGE_TIMEZONE });
  let current = 0;
  let longest = 0;
  let prevQualifying: DateTime | null = null;
  let lastQualifying: DateTime | null = null;

  for (const log of logs) {
    const qualifies = countCompletedTasks(log) >= STREAK_TASKS_REQUIRED;
    const logDate = DateTime.fromISO(log.date, { zone: CHALLENGE_TIMEZONE });

    if (!qualifies) {
      prevQualifying = null;
      continue;
    }

    if (prevQualifying && logDate.diff(prevQualifying, "days").days === 1) {
      current += 1;
    } else {
      current = 1;
    }

    prevQualifying = logDate;
    lastQualifying = logDate;
    if (current > longest) {
      longest = current;
    }
  }

  if (!lastQualifying) {
    current = 0;
  } else {
    const gap = Math.floor(today.diff(lastQualifying, "days").days);
    if (gap > 1) {
      current = 0;
    }
  }

  if (longest < current) {
    longest = current;
  }

  const { data: upserted, error: upsertError } = await supabase
    .from("user_streaks")
    .upsert(
      {
        user_id: userId,
        current_streak: current,
        longest_streak: longest,
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();

  if (upsertError) {
    throw upsertError;
  }

  return upserted as UserStreakRow;
}
