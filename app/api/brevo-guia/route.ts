import { NextRequest, NextResponse } from "next/server";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const BREVO_LIST_ID = 3;

export async function POST(req: NextRequest) {
  const { email, nombre } = await req.json();

  if (!email || !nombre) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        attributes: { FIRSTNAME: nombre.split(" ")[0], LASTNAME: nombre.split(" ").slice(1).join(" ") },
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Brevo error:", res.status, data);
      return NextResponse.json({ error: "Brevo rechazó el contacto", detail: data }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error llamando a Brevo:", e);
    return NextResponse.json({ error: "Error de red" }, { status: 500 });
  }
}
