import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || typeof email !== "string" || !name || typeof name !== "string") {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    const { error } = await supabase.from("sc_pn_users").upsert({
      phone: body.phone ?? email,
      email,
      name,
      gender: body.gender ?? null,
      edad: body.edad ?? null,
      peso_kg: body.peso_kg ?? null,
      altura_cm: body.altura_cm ?? null,
      objetivo: body.objetivo ?? null,
      actividad: body.actividad ?? null,
      ejercicio: body.ejercicio ?? null,
      dieta: body.dieta ?? null,
      comidas: body.comidas ?? null,
      calorias_objetivo: body.calorias_objetivo ?? null,
      palmas_objetivo: body.palmas_objetivo ?? null,
      punados_objetivo: body.punados_objetivo ?? null,
      pulgares_objetivo: body.pulgares_objetivo ?? null,
      punos_verdura_objetivo: body.punos_verdura_objetivo ?? null,
    });

    if (error) {
      console.error("guia-supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("guia-supabase error:", err);
    return NextResponse.json({ error: String(err) }, { status: 200 });
  }
}
