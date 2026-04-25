"use client";

import { useState } from "react";

const RANGOS = {
  0: [
    { edad: "20 – 39", lowMax: 8,  normalMax: 20, highMax: 25 },
    { edad: "40 – 59", lowMax: 11, normalMax: 22, highMax: 28 },
    { edad: "60 – 79", lowMax: 13, normalMax: 25, highMax: 30 },
  ],
  1: [
    { edad: "20 – 39", lowMax: 21, normalMax: 33, highMax: 39 },
    { edad: "40 – 59", lowMax: 23, normalMax: 34, highMax: 40 },
    { edad: "60 – 79", lowMax: 24, normalMax: 36, highMax: 42 },
  ],
};

function getAgeGroup(edad: number) {
  if (edad <= 39) return 0;
  if (edad <= 59) return 1;
  return 2;
}

function getCategory(pct: number, edad: number, sexo: number) {
  const gi = getAgeGroup(edad);
  const r = RANGOS[sexo as 0 | 1][gi];
  if (pct < r.lowMax)    return { cat: "Bajo",     color: "#185FA5", bg: "rgba(24,95,165,0.15)" };
  if (pct < r.normalMax) return { cat: "Normal",   color: "#1a9e72", bg: "rgba(26,158,114,0.15)" };
  if (pct < r.highMax)   return { cat: "Alto",     color: "#e79c00", bg: "rgba(231,156,0,0.18)" };
  return                          { cat: "Muy alto", color: "#c0392b", bg: "rgba(192,57,43,0.15)" };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CalculadoraGrasa() {
  const [sexo, setSexo] = useState(0);
  const [edad, setEdad] = useState("");
  const [peso, setPeso] = useState("");
  const [estatura, setEstatura] = useState("");
  const [cintura, setCintura] = useState("");
  const [cuello, setCuello] = useState("");
  const [cadera, setCadera] = useState("");
  const [resultado, setResultado] = useState<null | {
    promedio: number;
    cunbae: number;
    navy: number;
    ymca: number;
    cat: { cat: string; color: string; bg: string };
    gi: number;
  }>(null);
  const [error, setError] = useState(false);

  // Lead capture state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [desbloqueado, setDesbloqueado] = useState(false);

  function calcular() {
    const e   = parseFloat(edad);
    const p   = parseFloat(peso);
    const alt = parseFloat(estatura);
    const cin = parseFloat(cintura);
    const cue = parseFloat(cuello);
    const cad = parseFloat(cadera);

    const campos = [e, p, alt, cin, cue];
    if (sexo === 1) campos.push(cad);
    if (campos.some((v) => isNaN(v) || v <= 0)) { setError(true); return; }
    setError(false);

    const imc = p / ((alt / 100) ** 2);

    const cunbae =
      -44.988 + 0.503 * e + 10.689 * sexo + 3.172 * imc
      - 0.026 * imc * imc + 0.181 * imc * sexo - 0.02 * imc * e
      - 0.005 * imc * imc * sexo + 0.00021 * imc * imc * e;

    const navy =
      sexo === 0
        ? 495 / (1.0324 - 0.19077 * Math.log10(cin - cue) + 0.15456 * Math.log10(alt)) - 450
        : 495 / (1.29579 - 0.35004 * Math.log10(cad + cin - cue) + 0.221 * Math.log10(alt)) - 450;

    const pesoLb      = p * 2.20462;
    const cinturaPulg = cin * 0.393701;
    const ymca =
      sexo === 0
        ? ((-98.42 + 4.15 * cinturaPulg - 0.082 * pesoLb) / pesoLb) * 100
        : ((-76.76 + 4.15 * cinturaPulg - 0.082 * pesoLb) / pesoLb) * 100;

    const promedio = (cunbae + navy + ymca) / 3;

    setResultado({
      promedio,
      cunbae,
      navy,
      ymca,
      cat: getCategory(promedio, e, sexo),
      gi: getAgeGroup(e),
    });

    // Reset gate when recalculating
    setDesbloqueado(false);
    setEmail("");
    setEmailError(false);
  }

  async function desbloquear() {
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setDesbloqueado(true);

    const rangosData = RANGOS[sexo as 0 | 1];
    const gi = resultado?.gi ?? 0;
    const r = rangosData[gi];

    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        pct: resultado?.promedio.toFixed(1),
        clasificacion: resultado?.cat.cat,
        cunbae: resultado?.cunbae.toFixed(1),
        navy: resultado?.navy.toFixed(1),
        ymca: resultado?.ymca.toFixed(1),
        sexo: sexo === 0 ? "Hombre" : "Mujer",
        grupo_edad: rangosData[gi].edad,
        rango_bajo: `< ${r.lowMax}%`,
        rango_normal: `${r.lowMax} – ${r.normalMax - 0.1}%`,
        rango_alto: `${r.normalMax} – ${r.highMax - 0.1}%`,
        rango_muyalto: `≥ ${r.highMax}%`,
      }),
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 44,
    padding: "0 12px",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    background: "#1e1e1e",
    color: "#fff",
    fontFamily: "monospace",
    fontSize: 16,
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 5,
    display: "block",
  };

  const cardStyle: React.CSSProperties = {
    background: "#141414",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "1.25rem",
    marginBottom: 10,
  };

  const rangos = RANGOS[sexo as 0 | 1];

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", padding: "2rem 1rem 5rem", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(231,156,0,0.12)",
            border: "1px solid rgba(231,156,0,0.3)",
            borderRadius: 99,
            padding: "6px 16px",
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: "#e79c00",
            textTransform: "uppercase",
          }}>
            SA✓D Coach
          </div>
          <h1 style={{
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            color: "#fff",
            lineHeight: 1.05,
            marginBottom: 10,
          }}>
            % de <span style={{ color: "#e79c00" }}>grasa</span><br />corporal
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
            Estimación por perímetros · US Navy + CUN-BAE + YMCA<br />
            Basado en NIH/WHO Guidelines · Gallagher et al. 2000
          </p>
        </div>

        {/* IMAGEN INSTRUCCIONES */}
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <img
            src="/medicion_perimetros.png"
            alt="Cómo tomar tus medidas"
            style={{ width: "100%", display: "block" }}
          />
        </div>

        {/* SEXO */}
        <div style={cardStyle}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#e79c00", marginBottom: "1rem" }}>
            Sexo biológico
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[{ label: "♂  Hombre", val: 0 }, { label: "♀  Mujer", val: 1 }].map(({ label, val }) => (
              <button
                key={val}
                onClick={() => { setSexo(val); setResultado(null); }}
                style={{
                  padding: "11px 8px",
                  borderRadius: 8,
                  border: sexo === val ? "1px solid #e79c00" : "1px solid rgba(255,255,255,0.08)",
                  background: sexo === val ? "rgba(231,156,0,0.12)" : "#1e1e1e",
                  color: sexo === val ? "#e79c00" : "rgba(255,255,255,0.45)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.18s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* DATOS GENERALES */}
        <div style={cardStyle}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#e79c00", marginBottom: "1rem" }}>
            Datos generales
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Edad (años)", val: edad, set: setEdad, ph: "35" },
              { label: "Peso (kg)",   val: peso, set: setPeso, ph: "80.0" },
              { label: "Estatura (cm)", val: estatura, set: setEstatura, ph: "175" },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <input
                  type="number"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder={ph}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </div>

        {/* PERÍMETROS */}
        <div style={cardStyle}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#e79c00", marginBottom: "1rem" }}>
            Perímetros corporales
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Cintura (cm)</label>
              <input type="number" value={cintura} onChange={(e) => setCintura(e.target.value)} placeholder="85.0" style={inputStyle} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4, display: "block" }}>Parte más estrecha · ombligo</span>
            </div>
            <div>
              <label style={labelStyle}>Cuello (cm)</label>
              <input type="number" value={cuello} onChange={(e) => setCuello(e.target.value)} placeholder="38.0" style={inputStyle} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4, display: "block" }}>Parte más ancha</span>
            </div>
            {sexo === 1 && (
              <div>
                <label style={labelStyle}>Cadera (cm)</label>
                <input type="number" value={cadera} onChange={(e) => setCadera(e.target.value)} placeholder="95.0" style={inputStyle} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4, display: "block" }}>Parte más ancha</span>
              </div>
            )}
          </div>
        </div>

        {/* BOTÓN */}
        <button
          onClick={calcular}
          style={{
            width: "100%",
            padding: 15,
            background: "#e79c00",
            color: "#000",
            border: "none",
            borderRadius: 8,
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginTop: 4,
          }}
        >
          Calcular % de grasa
        </button>

        {error && (
          <p style={{ color: "#e05555", fontSize: 13, textAlign: "center", marginTop: 10, fontWeight: 500 }}>
            Completa todos los campos antes de calcular.
          </p>
        )}

        {/* RESULTADO */}
        {resultado && (
          <>
            {/* HERO — SIEMPRE VISIBLE */}
            <div style={{ ...cardStyle, border: "1px solid rgba(231,156,0,0.3)", marginTop: 10, overflow: "hidden", padding: 0 }}>
              <div style={{ background: "linear-gradient(135deg,#1a1200,#2a1f00)", padding: "2rem 1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#e79c00", marginBottom: 10 }}>
                  Resultado — promedio 3 métodos
                </div>
                <div style={{ fontSize: 72, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {resultado.promedio.toFixed(1)}<span style={{ fontSize: 40, color: "#e79c00" }}>%</span>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>grasa corporal estimada</div>
                <div style={{
                  display: "inline-block",
                  marginTop: 14,
                  padding: "7px 20px",
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: resultado.cat.bg,
                  color: resultado.cat.color,
                }}>
                  {resultado.cat.cat}
                </div>
              </div>
            </div>

            {/* GATE DE EMAIL */}
            {!desbloqueado && (
              <div style={{
                ...cardStyle,
                marginTop: 10,
                border: "1px solid rgba(231,156,0,0.25)",
                background: "linear-gradient(135deg, #141414, #1a1200)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 8,
                    background: "#e79c00",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 18 }}>📊</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>¿En qué rango estás?</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Ingresa tu email para ver el detalle completo</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                  {[
                    "Tu rango exacto por edad según NIH/WHO",
                    "Resultados por método (Navy, CUN-BAE, YMCA)",
                    "Tabla de referencia completa",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                      <span style={{ color: "#e79c00", fontWeight: 700 }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && desbloquear()}
                    placeholder="tucorreo@email.com"
                    style={{
                      flex: 1,
                      minWidth: 180,
                      height: 44,
                      padding: "0 14px",
                      border: emailError ? "1px solid #e05555" : "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      background: "#1e1e1e",
                      color: "#fff",
                      fontSize: 14,
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                  <button
                    onClick={desbloquear}
                    style={{
                      padding: "0 18px",
                      height: 44,
                      background: "#e79c00",
                      color: "#000",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Ver detalle →
                  </button>
                </div>

                {emailError && (
                  <p style={{ color: "#e05555", fontSize: 12, marginTop: 8 }}>
                    Ingresa un email válido para continuar.
                  </p>
                )}

                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 10, lineHeight: 1.5 }}>
                  📬 Si no ves el email en 2 minutos, revisa tu carpeta de <strong>spam o correo no deseado</strong> y márcanos como remitente seguro.<br /><br />Sin spam. Solo tu informe. Puedes darte de baja cuando quieras.
                </p>
              </div>
            )}

            {/* CONTENIDO DESBLOQUEADO */}
            {desbloqueado && (
              <>
                {/* Métodos individuales */}
                <div style={{ ...cardStyle, border: "1px solid rgba(231,156,0,0.3)", marginTop: 10, overflow: "hidden", padding: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    {[
                      { label: "CUN-BAE", val: resultado.cunbae },
                      { label: "US Navy", val: resultado.navy },
                      { label: "YMCA",    val: resultado.ymca },
                    ].map(({ label, val }, i) => (
                      <div key={label} style={{
                        padding: "1rem 0.5rem",
                        textAlign: "center",
                        borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
                      }}>
                        <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 500, color: "#fff" }}>{val.toFixed(1)}%</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabla rangos */}
                <div style={{ ...cardStyle, marginTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#e79c00" }}>
                      Rangos de referencia
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                      {sexo === 0 ? "Hombre" : "Mujer"} · % grasa
                    </div>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#1e1e1e" }}>
                        {["Edad", "Bajo", "Normal", "Alto", "Muy alto"].map((h) => (
                          <th key={h} style={{ padding: "8px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", borderBottom: "1px solid rgba(255,255,255,0.08)", textAlign: h === "Edad" ? "left" : "center", whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rangos.map((r, i) => {
                        const isActive = i === resultado.gi;
                        return (
                          <tr key={r.edad} style={{ background: isActive ? "rgba(231,156,0,0.08)" : "transparent" }}>
                            <td style={{ padding: "9px 8px", fontWeight: 600, fontSize: 13, color: isActive ? "#e79c00" : "#fff", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none", whiteSpace: "nowrap" }}>{r.edad}</td>
                            {[
                              `< ${r.lowMax}`,
                              `${r.lowMax} – ${r.normalMax - 0.1}`,
                              `${r.normalMax} – ${r.highMax - 0.1}`,
                              `≥ ${r.highMax}`,
                            ].map((val, j) => (
                              <td key={j} style={{ padding: "9px 8px", fontFamily: "monospace", fontSize: 12, color: isActive ? "rgba(231,156,0,0.8)" : "rgba(255,255,255,0.45)", textAlign: "center", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none", whiteSpace: "nowrap" }}>
                                {val}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 10, lineHeight: 1.5 }}>
                    Fuente: NIH/WHO Guidelines for BMI · Gallagher et al., Am. J. Clinical Nutrition, Vol. 72, 2000
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* FOOTER */}
        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.7 }}>
          <p>Herramienta de estimación basada en ecuaciones validadas.<br />
          No reemplaza la evaluación de un profesional de la salud.<br />
          <strong style={{ color: "rgba(255,255,255,0.35)" }}>saidcoach.com · @saidcoach_cl</strong></p>
        </div>

      </div>
    </div>
  );
}
