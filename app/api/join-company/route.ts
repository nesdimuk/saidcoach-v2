import { NextResponse } from "next/server";
import {
  ensureProfile,
  ensureUserChallengeMembership,
  getActiveChallengeForToday,
  requireAuth,
} from "@/lib/challenge/helpers";
import { getCurrentDateTime } from "@/lib/challenge/time";
import { AppError, isAppError } from "@/lib/challenge/errors";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    const payload = await request.json().catch(() => null);
    const companySlug =
      typeof payload?.companySlug === "string" ? payload.companySlug.trim().toLowerCase() : "";

    if (!companySlug) {
      throw new AppError(400, "Indica el código de empresa.");
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", companySlug)
      .single();

    if (companyError || !company) {
      throw new AppError(404, "Empresa no encontrada.");
    }

    const { data: membership, error: membershipError } = await supabase
      .from("company_members")
      .upsert(
        {
          user_id: user.id,
          company_id: company.id,
        },
        { onConflict: "user_id,company_id" }
      )
      .select("*")
      .single();

    if (membershipError || !membership) {
      throw new AppError(500, "No se pudo unir al equipo.");
    }

    await ensureProfile(supabase, user.id, company.id);

    const { isoDate: today } = getCurrentDateTime();
    const challenge = await getActiveChallengeForToday(supabase, company.id, today);

    if (challenge) {
      await ensureUserChallengeMembership(supabase, user.id, challenge.id);
    }

    return NextResponse.json({
      company,
      membership,
      challenge: challenge ?? null,
    });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("join-company error", error);
    return NextResponse.json({ error: "Ocurrió un error inesperado." }, { status: 500 });
  }
}
