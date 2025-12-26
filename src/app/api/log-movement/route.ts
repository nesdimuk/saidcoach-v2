import { NextResponse } from "next/server";
import {
  ensureDailyLog,
  getMembership,
  requireActiveChallengeForToday,
  requireAuth,
} from "@/lib/challenge/helpers";
import { getCurrentDateTime } from "@/lib/challenge/time";
import { MOVEMENT_TOP_BONUS } from "@/lib/challenge/config";
import { AppError, isAppError } from "@/lib/challenge/errors";
import { recalculateUserStreaks } from "@/lib/challenge/streaks";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    const payload = await request.json().catch(() => ({}));
    const companyId = typeof payload.companyId === "string" ? payload.companyId : undefined;
    const repsValue =
      typeof payload.reps === "number" && Number.isFinite(payload.reps)
        ? Math.floor(payload.reps)
        : NaN;

    if (!Number.isFinite(repsValue) || repsValue <= 0) {
      throw new AppError(400, "Ingresa repeticiones válidas.");
    }

    const { isoDate: today } = getCurrentDateTime();
    const membership = await getMembership(supabase, user.id, companyId);
    const challenge = await requireActiveChallengeForToday(supabase, membership.company_id, today);
    const dailyLog = await ensureDailyLog(supabase, user.id, membership.company_id, today);

    const previousReps = dailyLog.movement_reps ?? 0;
    const cappedTotal = Math.min(challenge.movement_goal, previousReps + repsValue);

    if (cappedTotal === previousReps) {
      throw new AppError(400, "Daily limit reached for this task.");
    }

    let movementBonus = dailyLog.movement_bonus_points ?? 0;
    let awardedPosition: 1 | 2 | 3 | null = null;

    if (previousReps === 0 && cappedTotal > 0) {
      const { data: position, error: claimError } = await supabase.rpc("claim_first_completion", {
        company_id: membership.company_id,
        user_id: user.id,
        log_date: today,
      });

      if (claimError) {
        throw new AppError(500, "No se pudo asignar el bonus.");
      }

      const validPosition: 1 | 2 | 3 | undefined =
        position === 1 || position === 2 || position === 3 ? position : undefined;

      if (validPosition !== undefined) {
        movementBonus = MOVEMENT_TOP_BONUS[validPosition];
        awardedPosition = validPosition;
      }
    }

    const { data: updatedLog, error: updateError } = await supabase
      .from("daily_log")
      .update({
        movement_reps: cappedTotal,
        movement_points: cappedTotal,
        movement_bonus_points: movementBonus,
      })
      .eq("id", dailyLog.id)
      .select("*")
      .single();

    if (updateError || !updatedLog) {
      throw new AppError(500, "No se pudo actualizar el registro.");
    }

    const streaks = await recalculateUserStreaks(supabase, user.id, membership.company_id, today);

    return NextResponse.json({
      log: updatedLog,
      streaks,
      bonus:
        awardedPosition !== null
          ? {
              position: awardedPosition,
              points: MOVEMENT_TOP_BONUS[awardedPosition],
            }
          : null,
    });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("log-movement error", error);
    return NextResponse.json({ error: "Ocurrió un error inesperado." }, { status: 500 });
  }
}
