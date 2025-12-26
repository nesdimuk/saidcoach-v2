import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

type PostPayload = {
  reps?: unknown;
};

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return NextResponse.json({ error: "No se pudo validar el usuario." }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let payload: PostPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const reps = typeof payload.reps === "number" ? Math.floor(payload.reps) : NaN;
  if (!Number.isFinite(reps) || reps <= 0) {
    return NextResponse.json({ error: "Cantidad de repeticiones inválida." }, { status: 400 });
  }

  const { error } = await supabase.from("squat_sessions").insert({
    user_id: user.id,
    reps,
  });

  if (error) {
    return NextResponse.json({ error: "No se pudo registrar la sesión." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_weekly_squat_leaderboard");

  if (error) {
    return NextResponse.json({ error: "No se pudo obtener el leaderboard." }, { status: 500 });
  }

  if (!data?.length) {
    return NextResponse.json({ data: [] });
  }

  const serviceClient = getSupabaseServiceClient();
  const userIds = data.map((entry: { user_id: string }) => entry.user_id);

  const perPage = Math.min(1000, Math.max(userIds.length, 100));
  const { data: usersData, error: usersError } = await serviceClient.auth.admin.listUsers({
    page: 1,
    perPage,
  });

  if (usersError) {
    return NextResponse.json({ error: "No se pudieron obtener los usuarios." }, { status: 500 });
  }

  const relevantUsers = (usersData.users ?? []).filter((user) => userIds.includes(user.id));

  const emailById = new Map(relevantUsers.map((user) => [user.id, user.email ?? "Participante"]));

  const enriched = data.map((entry: { user_id: string; total_reps: number }) => ({
    ...entry,
    email: emailById.get(entry.user_id) ?? "Participante",
  }));

  return NextResponse.json({ data: enriched });
}
