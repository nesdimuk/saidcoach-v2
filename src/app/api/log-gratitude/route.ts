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
    const text = typeof payload.text === "string" ? payload.text.trim() : "";
    const { isoDate: today } = getCurrentDateTime();

    if (!text) {
      throw new AppError(400, "Comparte un mensaje breve de gratitud.");
    }

    const membership = await getMembership(supabase, user.id, companyId);
    await requireActiveChallengeForToday(supabase, membership.company_id, today);
    const dailyLog = await ensureDailyLog(supabase, user.id, membership.company_id, today);

    if (dailyLog.gratitude_points > 0) {
      throw new AppError(400, "You already completed this task today.");
    }

    const { data: updatedLog, error: updateError } = await supabase
      .from("daily_log")
      .update({
        gratitude_text: text,
        gratitude_points: 2,
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
    console.error("log-gratitude error", error);
    return NextResponse.json({ error: "Ocurrió un error inesperado." }, { status: 500 });
  }
}
