import { NextRequest, NextResponse } from "next/server";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const BREVO_LIST_ID = 3;
const SENDER_EMAIL = "marcelo@saidcoach.com"; // cámbialo si usas otro remitente verificado en Brevo

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    email, pct, clasificacion,
    cunbae, navy, ymca, sexo,
    grupo_edad, rango_bajo, rango_normal, rango_alto, rango_muyalto,
  } = body;

  if (!email || !pct) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // Colores por clasificación
  const colores: Record<string, string> = {
    "Bajo":     "#185FA5",
    "Normal":   "#1a9e72",
    "Alto":     "#e79c00",
    "Muy alto": "#c0392b",
  };
  const colorClasificacion = colores[clasificacion] ?? "#e79c00";

  // 1. Agregar contacto a lista de Brevo
  await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      listIds: [BREVO_LIST_ID],
      updateEnabled: true,
      attributes: {
        CLASIFICACION_GRASA: clasificacion,
        PCT_GRASA: pct,
        SEXO: sexo,
      },
    }),
  });

  // 2. Enviar email con el informe
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Said Coach", email: SENDER_EMAIL },
      to: [{ email }],
      subject: `Tu % de grasa corporal: ${pct}% — ${clasificacion}`,
      htmlContent: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">

        <!-- HEADER -->
        <tr><td style="text-align:center;padding-bottom:28px;">
          <div style="display:inline-block;background:rgba(231,156,0,0.12);border:1px solid rgba(231,156,0,0.3);border-radius:99px;padding:6px 18px;margin-bottom:16px;">
            <span style="font-size:12px;font-weight:800;letter-spacing:0.1em;color:#e79c00;text-transform:uppercase;">SA✓D Coach</span>
          </div>
          <h1 style="font-size:28px;font-weight:800;color:#fff;margin:0 0 8px;letter-spacing:-0.01em;text-transform:uppercase;">
            Tu informe de <span style="color:#e79c00;">composición</span> corporal
          </h1>
          <p style="font-size:13px;color:rgba(255,255,255,0.4);margin:0;line-height:1.5;">
            US Navy · CUN-BAE · YMCA — Gallagher et al. 2000
          </p>
        </td></tr>

        <!-- RESULTADO PRINCIPAL -->
        <tr><td style="background:linear-gradient(135deg,#1a1200,#2a1f00);border-radius:12px;border:1px solid rgba(231,156,0,0.3);padding:32px 24px;text-align:center;margin-bottom:12px;">
          <p style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#e79c00;margin:0 0 12px;">Promedio · 3 métodos</p>
          <p style="font-size:72px;font-weight:800;color:#fff;margin:0;line-height:1;letter-spacing:-0.02em;">
            ${pct}<span style="font-size:40px;color:#e79c00;">%</span>
          </p>
          <p style="font-size:12px;color:rgba(255,255,255,0.45);margin:6px 0 16px;">grasa corporal estimada · ${sexo}</p>
          <span style="display:inline-block;padding:8px 22px;border-radius:99px;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;background:${colorClasificacion}22;color:${colorClasificacion};border:1px solid ${colorClasificacion}44;">
            ${clasificacion}
          </span>
        </td></tr>

        <tr><td style="height:12px;"></td></tr>

        <!-- MÉTODOS -->
        <tr><td style="background:#141414;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="33%" style="padding:16px 8px;text-align:center;border-right:1px solid rgba(255,255,255,0.08);">
                <p style="font-family:monospace;font-size:22px;font-weight:500;color:#fff;margin:0;">${cunbae}%</p>
                <p style="font-size:10px;color:rgba(255,255,255,0.3);margin:4px 0 0;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">CUN-BAE</p>
              </td>
              <td width="33%" style="padding:16px 8px;text-align:center;border-right:1px solid rgba(255,255,255,0.08);">
                <p style="font-family:monospace;font-size:22px;font-weight:500;color:#fff;margin:0;">${navy}%</p>
                <p style="font-size:10px;color:rgba(255,255,255,0.3);margin:4px 0 0;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">US Navy</p>
              </td>
              <td width="33%" style="padding:16px 8px;text-align:center;">
                <p style="font-family:monospace;font-size:22px;font-weight:500;color:#fff;margin:0;">${ymca}%</p>
                <p style="font-size:10px;color:rgba(255,255,255,0.3);margin:4px 0 0;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">YMCA</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="height:12px;"></td></tr>

        <!-- TABLA RANGOS -->
        <tr><td style="background:#141414;border-radius:12px;border:1px solid rgba(255,255,255,0.08);padding:20px;">
          <p style="font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#e79c00;margin:0 0 14px;">
            Tu rango · ${sexo} · ${grupo_edad} años
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;border-collapse:collapse;">
            <tr style="background:#1e1e1e;">
              <th style="padding:8px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.4);border-bottom:1px solid rgba(255,255,255,0.08);">Categoría</th>
              <th style="padding:8px;text-align:right;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.4);border-bottom:1px solid rgba(255,255,255,0.08);">Rango</th>
            </tr>
            <tr><td style="padding:9px 8px;color:#185FA5;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.06);">Bajo</td><td style="padding:9px 8px;font-family:monospace;color:rgba(255,255,255,0.45);text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);">${rango_bajo}</td></tr>
            <tr style="background:${clasificacion === 'Normal' ? 'rgba(26,158,114,0.08)' : 'transparent'}">
              <td style="padding:9px 8px;color:${clasificacion === 'Normal' ? '#1a9e72' : '#1a9e72'};font-weight:${clasificacion === 'Normal' ? '700' : '600'};border-bottom:1px solid rgba(255,255,255,0.06);">Normal ${clasificacion === 'Normal' ? '← tú' : ''}</td>
              <td style="padding:9px 8px;font-family:monospace;color:${clasificacion === 'Normal' ? 'rgba(26,158,114,0.9)' : 'rgba(255,255,255,0.45)'};text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);">${rango_normal}</td>
            </tr>
            <tr style="background:${clasificacion === 'Alto' ? 'rgba(231,156,0,0.08)' : 'transparent'}">
              <td style="padding:9px 8px;color:#e79c00;font-weight:${clasificacion === 'Alto' ? '700' : '600'};border-bottom:1px solid rgba(255,255,255,0.06);">Alto ${clasificacion === 'Alto' ? '← tú' : ''}</td>
              <td style="padding:9px 8px;font-family:monospace;color:${clasificacion === 'Alto' ? 'rgba(231,156,0,0.9)' : 'rgba(255,255,255,0.45)'};text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);">${rango_alto}</td>
            </tr>
            <tr style="background:${clasificacion === 'Muy alto' ? 'rgba(192,57,43,0.08)' : 'transparent'}">
              <td style="padding:9px 8px;color:#c0392b;font-weight:${clasificacion === 'Muy alto' ? '700' : '600'};">Muy alto ${clasificacion === 'Muy alto' ? '← tú' : ''}</td>
              <td style="padding:9px 8px;font-family:monospace;color:${clasificacion === 'Muy alto' ? 'rgba(192,57,43,0.9)' : 'rgba(255,255,255,0.45)'};text-align:right;">${rango_muyalto}</td>
            </tr>
          </table>
          <p style="font-size:10px;color:rgba(255,255,255,0.2);margin:12px 0 0;line-height:1.5;">
            Fuente: NIH/WHO Guidelines · Gallagher et al., Am. J. Clin. Nutrition, 2000
          </p>
        </td></tr>

        <tr><td style="height:12px;"></td></tr>

        <!-- CTA -->
        <tr><td style="background:#141414;border-radius:12px;border:1px solid rgba(231,156,0,0.2);padding:24px;text-align:center;">
          <p style="font-size:14px;color:rgba(255,255,255,0.7);margin:0 0 16px;line-height:1.6;">
            ¿Quieres saber exactamente qué hacer con estos resultados?<br>
            <strong style="color:#fff;">Agenda una consulta gratuita.</strong>
          </p>
          <a href="https://saidcoach.com" style="display:inline-block;background:#e79c00;color:#000;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">
            Hablar con Said Coach →
          </a>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="text-align:center;padding-top:28px;">
          <p style="font-size:11px;color:rgba(255,255,255,0.2);margin:0;line-height:1.7;">
            Herramienta de estimación. No reemplaza evaluación médica profesional.<br>
            <strong style="color:rgba(255,255,255,0.35);">saidcoach.com · @saidcoach_cl</strong><br>
            <a href="{{{unsubscribe}}}" style="color:rgba(255,255,255,0.2);font-size:10px;">Darse de baja</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    }),
  });

  return NextResponse.json({ ok: true });
}
