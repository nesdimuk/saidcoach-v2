import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

type AuthChangePayload = {
  event: string;
  session: unknown;
};

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  let payload: AuthChangePayload;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const { event, session } = payload;

  if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
    const { error } = await supabase.auth.setSession(session as any);
    if (error) {
      return NextResponse.json({ error: "No se pudo establecer la sesión." }, { status: 500 });
    }
  }

  if (event === "SIGNED_OUT") {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return NextResponse.json({ error: "No se pudo cerrar sesión." }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
