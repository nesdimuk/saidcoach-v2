import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { AppError } from "./errors";
import type {
  ChallengeRow,
  CompanyMemberRow,
  CompanyRow,
  DailyLogRow,
  ProfileRow,
} from "./types";

type SupabaseServerClient = SupabaseClient;

export async function requireAuth() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AppError(401, "Inicia sesión para continuar.");
  }

  return { supabase, user: user as User };
}

export async function getMembership(
  supabase: SupabaseServerClient,
  userId: string,
  companyId?: string
): Promise<CompanyMemberRow> {
  let query = supabase
    .from("company_members")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new AppError(500, "No se pudo obtener tu empresa.");
  }

  if (!data) {
    throw new AppError(403, "Únete a una empresa para continuar.");
  }

  return data as CompanyMemberRow;
}

export async function getActiveChallengeForToday(
  supabase: SupabaseServerClient,
  companyId: string,
  today: string
): Promise<ChallengeRow | null> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("company_id", companyId)
    .lte("start_date", today)
    .gte("end_date", today)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new AppError(500, "No se pudo obtener el desafío activo.");
  }

  return (data as ChallengeRow | null) ?? null;
}

export async function requireActiveChallengeForToday(
  supabase: SupabaseServerClient,
  companyId: string,
  today: string
) {
  const challenge = await getActiveChallengeForToday(supabase, companyId, today);
  if (!challenge) {
    throw new AppError(400, "This action is not available right now.");
  }
  return challenge;
}

export async function ensureUserChallengeMembership(
  supabase: SupabaseServerClient,
  userId: string,
  challengeId: string
) {
  const { error } = await supabase
    .from("user_challenge")
    .upsert(
      {
        user_id: userId,
        challenge_id: challengeId,
      },
      {
        onConflict: "user_id,challenge_id",
      }
    );

  if (error) {
    throw new AppError(500, "No se pudo vincularte al desafío.");
  }
}

export async function ensureDailyLog(
  supabase: SupabaseServerClient,
  userId: string,
  companyId: string,
  targetDate: string
): Promise<DailyLogRow> {
  const { data, error } = await supabase
    .from("daily_log")
    .select("*")
    .eq("user_id", userId)
    .eq("date", targetDate)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new AppError(500, "No se pudo obtener el registro diario.");
  }

  if (data) {
    return data as DailyLogRow;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("daily_log")
    .insert({
      user_id: userId,
      company_id: companyId,
      date: targetDate,
    })
    .select("*")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: retry } = await supabase
        .from("daily_log")
        .select("*")
        .eq("user_id", userId)
        .eq("date", targetDate)
        .maybeSingle();
      if (retry) {
        return retry as DailyLogRow;
      }
    }
    throw new AppError(500, "No se pudo crear el registro diario.");
  }

  return inserted as DailyLogRow;
}

export async function getProfile(
  supabase: SupabaseServerClient,
  userId: string
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new AppError(500, "No se pudo obtener tu perfil.");
  }

  return (data as ProfileRow | null) ?? null;
}

export async function ensureProfile(
  supabase: SupabaseServerClient,
  userId: string,
  companyId: string
) {
  const existing = await getProfile(supabase, userId);
  if (existing) {
    if (!existing.company_id) {
      await supabase.from("profiles").update({ company_id: companyId }).eq("id", userId);
    }
    return existing;
  }

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    company_id: companyId,
  });

  if (error) {
    throw new AppError(500, "No se pudo crear tu perfil.");
  }
}

export async function getCompanyById(
  supabase: SupabaseServerClient,
  companyId: string
): Promise<CompanyRow> {
  const { data, error } = await supabase.from("companies").select("*").eq("id", companyId).single();

  if (error || !data) {
    throw new AppError(404, "Empresa no encontrada.");
  }

  return data as CompanyRow;
}

export type ProfilePayload = {
  name?: string;
  age?: number | null;
  sex?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  activity_level?: string | null;
  goal?: string | null;
  food_preferences?: Record<string, unknown> | null;
};

export async function saveProfile(
  supabase: SupabaseServerClient,
  userId: string,
  payload: ProfilePayload
) {
  const existing = await getProfile(supabase, userId);
  if (existing) {
    const { error } = await supabase.from("profiles").update(payload).eq("id", userId);
    if (error) {
      throw new AppError(500, "No se pudo actualizar tu perfil.");
    }
    return;
  }

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    ...payload,
  });

  if (error) {
    throw new AppError(500, "No se pudo guardar tu perfil.");
  }
}
