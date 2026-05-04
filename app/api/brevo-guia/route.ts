import { NextRequest, NextResponse } from "next/server";

const BREVO_LIST_ID = 3;

export async function POST(req: NextRequest) {
  try {
    const { email, nombre } = await req.json();

    if (!email || !nombre) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const apiKey = process.env.BREVO_GUIA_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key no configurada" }, { status: 500 });
    }

    const parts = (nombre as string).trim().split(" ");
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

    const responseText = await brevoRes.text();
    console.log("Brevo response:", brevoRes.status, responseText);

    if (!brevoRes.ok) {
      return NextResponse.json(
        { error: "Brevo error", status: brevoRes.status, detail: responseText },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("brevo-guia error:", err);
    return NextResponse.json({ error: String(err) }, { status: 200 });
  }
}
