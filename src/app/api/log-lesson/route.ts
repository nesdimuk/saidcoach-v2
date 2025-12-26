import { NextResponse } from "next/server";
import {
  ensureDailyLog,
  getMembership,
  requireActiveChallengeForToday,
  requireAuth,
} from "@/lib/challenge/helpers";
import { getCurrentDateTime } from "@/lib/challenge/time";
import { recalculateUserStreaks } from "@/lib/challenge/streaks";
import { AppError, isAppError } from "@/lib/challenge/errors";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    const payload = await request.json().catch(() => ({}));
    const companyId = typeof payload.companyId === "string" ? payload.companyId : undefined;
    const { isoDate: today } = getCurrentDateTime();

    const membership = await getMembership(supabase, user.id, companyId);
    const challenge = await requireActiveChallengeForToday(supabase, membership.company_id, today);
    const dailyLog = await ensureDailyLog(supabase, user.id, membership.company_id, today);

    const lessonPoints = dailyLog.lesson_points ?? 0;
    const completedLessons = Math.floor(lessonPoints / 3);

    if (completedLessons >= challenge.lessons_per_day) {
      throw new AppError(400, "Daily limit reached for this task.");
    }

    const { data: updatedLog, error: updateError } = await supabase
      .from("daily_log")
      .update({
        lesson_points: lessonPoints + 3,
        lesson_completed: true,
      })
      .eq("id", dailyLog.id)
      .select("*")
      .single();

    if (updateError || !updatedLog) {
      throw new AppError(500, "No se pudo actualizar el registro.");
    }

    const streaks = await recalculateUserStreaks(supabase, user.id, membership.company_id, today);

    return NextResponse.json({ log: updatedLog, streaks });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("log-lesson error", error);
    return NextResponse.json({ error: "Ocurrió un error inesperado." }, { status: 500 });
  }
}
