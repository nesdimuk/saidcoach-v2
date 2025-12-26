import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import {
  ensureDailyLog,
  getMembership,
  requireActiveChallengeForToday,
  requireAuth,
} from "@/lib/challenge/helpers";
import { getCurrentDateTime, isBeforeNutritionCutoff } from "@/lib/challenge/time";
import { NUTRITION_BASE_POINTS, NUTRITION_BONUS_POINTS } from "@/lib/challenge/config";
import { AppError, isAppError } from "@/lib/challenge/errors";
import { recalculateUserStreaks } from "@/lib/challenge/streaks";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    const formData = await request.formData();
    const file = formData.get("file");
    const companyField = formData.get("companyId");
    const companyId =
      typeof companyField === "string" && companyField.trim().length > 0
        ? companyField.trim()
        : undefined;

    if (!(file instanceof File)) {
      throw new AppError(400, "Adjunta una foto tomada ahora.");
    }

    const { isoDate: today, now } = getCurrentDateTime();
    const membership = await getMembership(supabase, user.id, companyId);
    const challenge = await requireActiveChallengeForToday(supabase, membership.company_id, today);
    const dailyLog = await ensureDailyLog(supabase, user.id, membership.company_id, today);

    const { count: photoCount, error: photoCountError } = await supabase
      .from("nutrition_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("date", today);

    if (photoCountError) {
      throw new AppError(500, "No se pudo validar la foto de hoy.");
    }

    const submittedToday = photoCount ?? 0;

    if (submittedToday >= challenge.photos_per_day || dailyLog.nutrition_photo_url) {
      throw new AppError(400, "You already completed this task today.");
    }

    const path = `${user.id}/${today}/${randomUUID()}-${file.name.replace(/\s+/g, "_")}`;
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("nutrition_photos")
      .upload(path, fileBuffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      throw new AppError(500, "No se pudo guardar la foto.");
    }

    const basePoints = NUTRITION_BASE_POINTS;
    const bonusPoints = isBeforeNutritionCutoff(now) ? NUTRITION_BONUS_POINTS : 0;

    const { data: updatedLog, error: updateError } = await supabase
      .from("daily_log")
      .update({
        nutrition_photo_url: path,
        nutrition_points: basePoints,
        nutrition_bonus_points: bonusPoints,
      })
      .eq("id", dailyLog.id)
      .select("*")
      .single();

    if (updateError || !updatedLog) {
      throw new AppError(500, "No se pudo actualizar el registro.");
    }

    const { error: insertNutritionError } = await supabase.from("nutrition_log").insert({
      user_id: user.id,
      company_id: membership.company_id,
      date: today,
      photo_url: path,
      points: basePoints,
      bonus_points: bonusPoints,
    });

    if (insertNutritionError) {
      throw new AppError(500, "No se pudo registrar la foto.");
    }

    const streaks = await recalculateUserStreaks(supabase, user.id, membership.company_id, today);

    return NextResponse.json({
      log: updatedLog,
      streaks,
      bonus: bonusPoints > 0 ? bonusPoints : 0,
    });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("log-nutrition error", error);
    return NextResponse.json({ error: "Ocurrió un error inesperado." }, { status: 500 });
  }
}
