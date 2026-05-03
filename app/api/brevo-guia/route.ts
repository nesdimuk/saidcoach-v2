import { NextRequest, NextResponse } from "next/server";

const BREVO_LIST_ID = 3;

export async function POST(req: NextRequest) {
  const { email, nombre } = await req.json();

  if (!email || !nombre) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key no configurada" }, { status: 500 });
  }

  const parts = nombre.trim().split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: firstName, LASTNAME: lastName },
      listIds: [BREVO_LIST_ID],
      updateEnabled: true,
    }),
  });

  if (!brevoRes.ok) {
    const detail = await brevoRes.text();
    console.error("Brevo error:", brevoRes.status, detail);
    return NextResponse.json({ error: "Brevo error", status: brevoRes.status, detail }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
