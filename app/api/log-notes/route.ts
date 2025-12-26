import { NextResponse } from "next/server";
import { ensureDailyLog, getMembership, requireAuth } from "@/lib/challenge/helpers";
import { getCurrentDateTime } from "@/lib/challenge/time";
import { AppError, isAppError } from "@/lib/challenge/errors";

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    const payload = await request.json().catch(() => ({}));
    const companyId = typeof payload.companyId === "string" ? payload.companyId : undefined;
    const text = typeof payload.text === "string" ? payload.text : "";
    const { isoDate: today } = getCurrentDateTime();

    const membership = await getMembership(supabase, user.id, companyId);
    const dailyLog = await ensureDailyLog(supabase, user.id, membership.company_id, today);

    const { data: updatedLog, error: updateError } = await supabase
      .from("daily_log")
      .update({ notes: text })
      .eq("id", dailyLog.id)
      .select("*")
      .single();

    if (updateError || !updatedLog) {
      throw new AppError(500, "No se pudo actualizar la nota.");
    }

    return NextResponse.json({ log: updatedLog });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("log-notes error", error);
    return NextResponse.json({ error: "Ocurrió un error inesperado." }, { status: 500 });
  }
}
