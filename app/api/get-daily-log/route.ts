import { NextResponse } from "next/server";
import {
  ensureDailyLog,
  getActiveChallengeForToday,
  getCompanyById,
  getMembership,
  requireAuth,
} from "@/lib/challenge/helpers";
import { getCurrentDateTime } from "@/lib/challenge/time";
import { recalculateUserStreaks } from "@/lib/challenge/streaks";
import { isAppError } from "@/lib/challenge/errors";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") ?? undefined;
    const { isoDate: today } = getCurrentDateTime();

    const membership = await getMembership(supabase, user.id, companyId);
    const dailyLog = await ensureDailyLog(supabase, user.id, membership.company_id, today);
    const challenge = await getActiveChallengeForToday(supabase, membership.company_id, today);
    const company = await getCompanyById(supabase, membership.company_id);
    const streaks = await recalculateUserStreaks(supabase, user.id, membership.company_id, today);

    return NextResponse.json({
      date: today,
      company,
      challenge,
      log: dailyLog,
      streaks,
    });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("get-daily-log error", error);
    return NextResponse.json({ error: "Ocurrió un error inesperado." }, { status: 500 });
  }
}
