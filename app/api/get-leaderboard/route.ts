import { NextResponse } from "next/server";
import { getMembership, requireAuth } from "@/lib/challenge/helpers";
import { CHALLENGE_TIMEZONE } from "@/lib/challenge/config";
import { AppError, isAppError } from "@/lib/challenge/errors";

const PERIOD_TO_FUNCTION = {
  daily: "get_daily_leaderboard",
  weekly: "get_weekly_leaderboard",
  monthly: "get_monthly_leaderboard",
} as const;

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    const { searchParams } = new URL(request.url);
    const requestedPeriod = (searchParams.get("period") ?? "daily").toLowerCase();
    const period = requestedPeriod in PERIOD_TO_FUNCTION ? (requestedPeriod as keyof typeof PERIOD_TO_FUNCTION) : "daily";
    const requestedCompanyId = searchParams.get("companyId") ?? undefined;

    const membership = await getMembership(supabase, user.id, requestedCompanyId);
    const fnName = PERIOD_TO_FUNCTION[period];

    const { data, error } = await supabase.rpc(fnName, {
      target_company_id: membership.company_id,
      tz: CHALLENGE_TIMEZONE,
    });

    if (error) {
      throw new AppError(500, "No se pudo obtener el ranking.");
    }

    return NextResponse.json({
      period,
      companyId: membership.company_id,
      leaderboard: data ?? [],
    });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("get-leaderboard error", error);
    return NextResponse.json({ error: "Ocurrió un error inesperado." }, { status: 500 });
  }
}
