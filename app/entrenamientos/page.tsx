"use client";

import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
type AltLink = { name: string; url: string };
type Exercise = { name: string; url: string; reps: string; alt?: AltLink[] };
type Workout  = { cat: "completo" | "superior" | "inferior"; time: number; desc: string; exercises: Exercise[] };

// ── Data ───────────────────────────────────────────────────────────────────
const workouts: Workout[] = [
  // CUERPO COMPLETO
  { cat:"completo", time:10, desc:"Ejecuta cada ejercicio por 1 min. Descansa 15 seg. entre ejercicios. Completa el circuito dos veces.", exercises:[
    { name:"Sentadillas + estocadas atrás", url:"https://www.youtube.com/watch?v=wchZCrfSYlQ", reps:"1 min" },
    { name:"Escaladores de montaña lentos", url:"https://www.youtube.com/watch?v=e8vhC0Pie6E", reps:"1 min" },
    { name:"Puente supino", url:"https://www.youtube.com/watch?v=RMUEdpaJJEw", reps:"1 min" },
    { name:"Bird-dog", url:"https://www.youtube.com/watch?v=6SQaCSBdt3k", reps:"1 min" },
  ]},
  { cat:"completo", time:15, desc:"Timer 15 min. Tantas series como sea posible. Descansa 15 seg. entre ejercicios y 30–60 seg. entre series.", exercises:[
    { name:"Estocadas split", url:"https://www.youtube.com/watch?v=I6DjEJ8S5Yc", reps:"10 c/lado" },
    { name:"Puente lateral", url:"https://www.youtube.com/watch?v=Yw9fFFvH-Ng", reps:"20 seg c/lado" },
    { name:"Plancha a push-up alternando", url:"https://www.youtube.com/watch?v=e077Xo5Ttjs", reps:"10 reps" },
    { name:"Puente supino pies elevados", url:"https://www.youtube.com/watch?v=_b1WZGqW8o8", reps:"20 reps" },
  ]},
  { cat:"completo", time:20, desc:"Timer 20 min. Tantas series como sea posible. Descansa 15 seg. entre ejercicios y 30–60 seg. entre series.", exercises:[
    { name:"Push ups", url:"https://www.youtube.com/watch?v=teweekNaae0", reps:"10 reps", alt:[{name:"con apoyo de rodillas",url:"https://www.youtube.com/watch?v=7ap9Goku7QM"}] },
    { name:"Sentadillas con peso corporal", url:"https://www.youtube.com/watch?v=9Pm4bGY0M44", reps:"10 reps", alt:[{name:"con salto",url:"https://www.youtube.com/watch?v=A8T5Ng0jhf0"}] },
    { name:"Caminatas de oso", url:"https://www.youtube.com/watch?v=P1cmqOGX4S4", reps:"10 reps" },
    { name:"Jumping jacks", url:"https://www.youtube.com/watch?v=89fw6XmqiuA", reps:"10 reps" },
  ]},
  { cat:"completo", time:25, desc:"Timer 25 min. Tantas series como sea posible. Descansa 15 seg. entre ejercicios y 30–60 seg. entre series.", exercises:[
    { name:"Sentadillas con peso corporal", url:"https://www.youtube.com/watch?v=9Pm4bGY0M44", reps:"10 reps" },
    { name:"Caminata de oso", url:"https://www.youtube.com/watch?v=P1cmqOGX4S4", reps:"10 mt" },
    { name:"Estocadas atrás", url:"https://www.youtube.com/watch?v=iBhkbXRGvew", reps:"10 c/lado" },
    { name:"Escaladores de montaña lentos", url:"https://www.youtube.com/watch?v=e8vhC0Pie6E", reps:"10 c/lado" },
  ]},
  { cat:"completo", time:30, desc:"Timer 30 min. Tantas series como sea posible. Descansa 15 seg. entre ejercicios y 30–60 seg. entre series.", exercises:[
    { name:"Walk-outs (+ push-up opcional)", url:"https://www.youtube.com/watch?v=Kre2sZeFvS4", reps:"10 reps" },
    { name:"Peso muerto rumano a una pierna", url:"https://www.youtube.com/watch?v=kc98A0tVPU8", reps:"10 c/lado" },
    { name:"Bicho muerto", url:"https://www.youtube.com/watch?v=WhM4qGzWhMY", reps:"10 c/lado" },
    { name:"Deslizamientos en pared", url:"https://www.youtube.com/watch?v=CMD5DboRzRk", reps:"10 reps" },
    { name:"Estocadas laterales", url:"https://www.youtube.com/watch?v=YajxinsG5WU", reps:"10 c/lado" },
  ]},
  // TREN SUPERIOR
  { cat:"superior", time:10, desc:"Timer 10 min. Tantas series como sea posible. Descansa 15 seg. entre ejercicios y 30–60 seg. entre series.", exercises:[
    { name:"Push-ups", url:"https://www.youtube.com/watch?v=teweekNaae0", reps:"8 reps", alt:[{name:"con apoyo de rodillas",url:"https://www.youtube.com/watch?v=7ap9Goku7QM"}] },
    { name:"Plancha", url:"https://www.youtube.com/watch?v=0qxJZYpbU1c", reps:"30 seg" },
    { name:"Toque de hombros", url:"https://www.youtube.com/watch?v=c75uBDzZi00", reps:"8 c/lado" },
  ]},
  { cat:"superior", time:15, desc:"Timer 15 min. Tantas series como sea posible. Descansa 15 seg. entre ejercicios y 30–60 seg. entre series.", exercises:[
    { name:"Plancha + push up", url:"https://www.youtube.com/watch?v=e077Xo5Ttjs", reps:"10 reps" },
    { name:"Burpees sin impacto", url:"https://www.youtube.com/watch?v=XS6TITfLDSc", reps:"10 reps" },
    { name:"Escaladores de montaña", url:"https://www.youtube.com/watch?v=Otq8D2tr5Y0", reps:"20 reps" },
  ]},
  { cat:"superior", time:20, desc:"Timer 20 min. Tantas series como sea posible. Descansa 15 seg. entre ejercicios y 60–90 seg. entre series.", exercises:[
    { name:"Walkouts + push-ups", url:"https://www.youtube.com/watch?v=EtCuOaX6wM0", reps:"8 reps" },
    { name:"Burpees sin impacto", url:"https://www.youtube.com/watch?v=XS6TITfLDSc", reps:"8 reps" },
    { name:"Escaladores de montaña lentos", url:"https://www.youtube.com/watch?v=e8vhC0Pie6E", reps:"8 c/pierna" },
    { name:"Puente lateral", url:"https://www.youtube.com/watch?v=Yw9fFFvH-Ng", reps:"3×10 seg c/lado" },
  ]},
  { cat:"superior", time:25, desc:"Timer 25 min. Tantas series como sea posible. Descansa 15 seg. entre ejercicios y 60 seg. entre series.", exercises:[
    { name:"Push up excéntrico", url:"https://www.youtube.com/watch?v=ynLyW-5yeE4", reps:"8 reps" },
    { name:"Escaladores de montaña lentos", url:"https://www.youtube.com/watch?v=e8vhC0Pie6E", reps:"8 c/lado" },
    { name:"Plancha con extensión de cadera", url:"https://www.youtube.com/watch?v=kK5yUPMRhgg", reps:"8 c/lado" },
  ]},
  { cat:"superior", time:30, desc:"Timer 30 min. De 4 a 6 series. Descansa 15–20 seg. entre ejercicios y 1–2 min. entre series.", exercises:[
    { name:"Bird dog alto alternado", url:"https://www.youtube.com/watch?v=vHT3EnICaVY", reps:"8 reps (−1 c/serie)" },
    { name:"Posición perro boca abajo", url:"https://www.youtube.com/watch?v=uh4DN7gxrjY", reps:"15 seg" },
    { name:"Caminata de oso", url:"https://www.youtube.com/watch?v=P1cmqOGX4S4", reps:"12 pasos" },
    { name:"Plancha con extensión de cadera", url:"https://www.youtube.com/watch?v=kK5yUPMRhgg", reps:"6 c/lado" },
  ]},
  // TREN INFERIOR
  { cat:"inferior", time:10, desc:"Timer 10 min. Tantas series como sea posible. Descansa 15–30 seg. entre ejercicios y 30–60 seg. entre series.", exercises:[
    { name:"Sentadillas con salto", url:"https://www.youtube.com/watch?v=A8T5Ng0jhf0", reps:"12 reps" },
    { name:"Estocadas curtsy", url:"https://www.youtube.com/watch?v=t-5oiZ18EF0", reps:"12 c/lado" },
    { name:"Frog pumps", url:"https://www.youtube.com/watch?v=b_DO6TPpM5Y", reps:"12 reps" },
  ]},
  { cat:"inferior", time:15, desc:"Timer 15 min. Pirámide: empieza con 6 reps y baja a 1. Descansa 5–10 seg. entre ejercicios.", exercises:[
    { name:"Sentadillas con salto", url:"https://www.youtube.com/watch?v=A8T5Ng0jhf0", reps:"pirámide 6→1", alt:[{name:"con peso corporal",url:"https://www.youtube.com/watch?v=9Pm4bGY0M44"}] },
    { name:"Peso muerto rumano a una pierna", url:"https://www.youtube.com/watch?v=kc98A0tVPU8", reps:"pirámide 6→1" },
    { name:"Estocadas caminando", url:"https://www.youtube.com/watch?v=mAgbXQdd4LM", reps:"pirámide 6→1" },
    { name:"Marcha de glúteos", url:"https://youtu.be/GhbQDAZRirk", reps:"pirámide 6→1" },
  ]},
  { cat:"inferior", time:20, desc:"Timer 20 min. De 4 a 6 series. Realiza 8–10 reps. Descansa 5–10 seg. entre ejercicios.", exercises:[
    { name:"Sentadillas", url:"https://www.youtube.com/watch?v=9Pm4bGY0M44", reps:"8–10 reps" },
    { name:"Subidas al banco", url:"https://www.youtube.com/watch?v=0UNUyN5IbNw", reps:"8–10 reps" },
    { name:"Puente supino", url:"https://www.youtube.com/watch?v=RMUEdpaJJEw", reps:"8–10 reps" },
    { name:"Estocada lateral", url:"https://www.youtube.com/watch?v=YajxinsG5WU", reps:"8–10 c/lado" },
    { name:"Burpees sin impacto", url:"https://www.youtube.com/watch?v=XS6TITfLDSc", reps:"8–10 reps" },
  ]},
  { cat:"inferior", time:25, desc:"Timer 25 min. De 4 a 6 series. Realiza 10–12 reps. Descansa 10–15 seg. entre ejercicios.", exercises:[
    { name:"Estocadas caminando", url:"https://www.youtube.com/watch?v=mAgbXQdd4LM", reps:"10–12 reps" },
    { name:"Puente supino a una pierna", url:"https://youtu.be/V88zak3mAGU", reps:"10–12 reps" },
    { name:"Sentadilla cosaco", url:"https://www.youtube.com/watch?v=AiTq4DyshUY", reps:"10–12 reps" },
    { name:"Frog pumps", url:"https://www.youtube.com/watch?v=b_DO6TPpM5Y", reps:"10–12 reps" },
    { name:"Sentadilla con salto", url:"https://www.youtube.com/watch?v=A8T5Ng0jhf0", reps:"10–12 reps" },
  ]},
  { cat:"inferior", time:30, desc:"Timer 30 min. De 4 a 6 series con 12 reps. Descansa 15–20 seg. entre ejercicios.", exercises:[
    { name:"1.5 rep sentadilla", url:"https://www.youtube.com/watch?v=D1M7vUO-x3E", reps:"12 reps" },
    { name:"Peso muerto rumano a una pierna", url:"https://www.youtube.com/watch?v=kc98A0tVPU8", reps:"12 c/lado" },
    { name:"Estocada caminando", url:"https://www.youtube.com/watch?v=mAgbXQdd4LM", reps:"12 reps" },
    { name:"Puente supino a una pierna", url:"https://youtu.be/V88zak3mAGU", reps:"12 c/lado" },
  ]},
];

const CAT_LABELS = { completo: "Cuerpo Completo", superior: "Tren Superior", inferior: "Tren Inferior" } as const;
const CAT_COLORS = {
  completo: { bg: "rgba(231,156,0,0.12)", text: "#e79c00" },
  superior: { bg: "rgba(255,107,53,0.12)", text: "#ff8c5a" },
  inferior: { bg: "rgba(99,179,237,0.12)", text: "#63b3ed" },
} as const;

// ── Icon ───────────────────────────────────────────────────────────────────
function ExternalIcon() {
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0, opacity: 0.4 }}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function EntrenamientosPage() {
  const [activeCat, setActiveCat] = useState<"all" | "completo" | "superior" | "inferior">("all");
  const [activeTime, setActiveTime] = useState<"all" | 10 | 15 | 20 | 25 | 30>("all");

  const filtered = workouts.filter(w =>
    (activeCat === "all" || w.cat === activeCat) &&
    (activeTime === "all" || w.time === activeTime)
  );

  return (
    <main style={{ background: "#0f0f0f", minHeight: "100vh", color: "#f5f5f5", fontFamily: "var(--font-inter, Inter, sans-serif)" }}>

      {/* ── Hero ── */}
      <section style={{ position: "relative", padding: "72px 24px 56px", textAlign: "center", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
          width: 560, height: 320,
          background: "radial-gradient(ellipse, rgba(231,156,0,.13) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <img
          src="/logo3.png"
          alt="Said Coach"
          style={{ height: 64, width: "auto", display: "block", margin: "0 auto 24px" }}
        />

        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase", color: "#e79c00", marginBottom: 24, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background:"#e79c00", display:"inline-block" }} />
          Said Coach · Biblioteca de Entrenamientos
          <span style={{ width:5, height:5, borderRadius:"50%", background:"#e79c00", display:"inline-block" }} />
        </p>

        <h1 style={{
          fontFamily: "var(--font-montserrat, Montserrat, sans-serif)",
          fontWeight: 900,
          fontSize: "clamp(52px, 9vw, 100px)",
          lineHeight: 0.93,
          letterSpacing: -2,
          color: "#f5f5f5",
          marginBottom: 24,
        }}>
          PESO<br />
          <span style={{ color: "#e79c00" }}>CORPORAL</span>
        </h1>

        <p style={{ fontSize: 15, color: "#888", maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>
          15 entrenamientos clasificados por zona muscular y duración. Todos con video demostrativo.
        </p>
        <div style={{ width: 48, height: 3, background: "#e79c00", margin: "28px auto 0", borderRadius: 2 }} />
      </section>

      {/* ── Filters ── */}
      <div style={{ maxWidth: 920, margin: "48px auto 0", padding: "0 24px" }}>
        <FilterGroup label="Zona muscular">
          {(["all", "completo", "superior", "inferior"] as const).map(v => (
            <Chip key={v} active={activeCat === v} onClick={() => setActiveCat(v)}>
              {v === "all" ? "Todos" : CAT_LABELS[v]}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Duración">
          {(["all", 10, 15, 20, 25, 30] as const).map(v => (
            <Chip key={v} active={activeTime === v} onClick={() => setActiveTime(v)}>
              {v === "all" ? "Todas" : `${v} min`}
            </Chip>
          ))}
        </FilterGroup>
      </div>

      {/* ── Count bar ── */}
      <div style={{ maxWidth: 1100, margin: "36px auto 0", padding: "0 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 12, color: "#888", whiteSpace: "nowrap" }}>
          Mostrando <strong style={{ color: "#e79c00" }}>{filtered.length}</strong> de {workouts.length} entrenamientos
        </span>
        <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
      </div>

      {/* ── Grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
        gap: 18,
        maxWidth: 1100,
        margin: "24px auto 80px",
        padding: "0 24px",
      }}>
        {filtered.length === 0 ? (
          <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 24px", color: "#888" }}>
            Sin entrenamientos para estos filtros.
          </p>
        ) : (
          filtered.map((w, i) => <WorkoutCard key={i} workout={w} />)
        )}
      </div>

      {/* ── Footer ── */}
      <footer style={{ textAlign: "center", padding: "36px 24px", borderTop: "1px solid #2a2a2a", color: "#888", fontSize: 13 }}>
        Creado por{" "}
        <a href="https://saidcoach.com" style={{ color: "#e79c00", textDecoration: "none" }}>Said Coach</a>
        {" · "}Todos los videos son demostrativos de técnica.
      </footer>
    </main>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase" as const, color: "#888", marginBottom: 10, display: "block" }}>
        {label}
      </span>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 20px",
        borderRadius: 100,
        background: active ? "#e79c00" : "transparent",
        border: `1px solid ${active ? "#e79c00" : "#2a2a2a"}`,
        color: active ? "#0f0f0f" : "#888",
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        transition: "all 0.16s ease",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function WorkoutCard({ workout: w }: { workout: Workout }) {
  const catColor = CAT_COLORS[w.cat];
  return (
    <div style={{
      background: "#1a1a1a",
      border: "1px solid #2a2a2a",
      borderRadius: 14,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.2s ease, border-color 0.2s ease",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(231,156,0,.35)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#2a2a2a";
      }}
    >
      {/* Header */}
      <div style={{ padding: "22px 22px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase" as const, padding: "4px 10px", borderRadius: 6, background: catColor.bg, color: catColor.text }}>
          {CAT_LABELS[w.cat]}
        </span>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-montserrat, Montserrat, sans-serif)", fontWeight: 900, fontSize: 44, color: "#f5f5f5", lineHeight: 1, display: "block" }}>
            {w.time}
          </span>
          <span style={{ fontSize: 11, color: "#888", letterSpacing: 1, display: "block" }}>minutos</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 22px 20px", flex: 1 }}>
        <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6, marginBottom: 16, fontStyle: "italic" }}>{w.desc}</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
          {w.exercises.map((ex, i) => (
            <li key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#252525", border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#888", fontWeight: 500, flexShrink: 0 }}>
                  {i + 1}
                </span>
                <a
                  href={ex.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#d0d0d0", textDecoration: "none", fontSize: 12.5, display: "flex", alignItems: "center", gap: 5, flex: 1 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#e79c00")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#d0d0d0")}
                >
                  {ex.name} <ExternalIcon />
                </a>
                <span style={{ fontSize: 11, color: "#888", whiteSpace: "nowrap" }}>{ex.reps}</span>
              </div>
              {ex.alt && (
                <div style={{ fontSize: 11, color: "#888", marginTop: 2, marginLeft: 29 }}>
                  o:{" "}
                  {ex.alt.map((a, j) => (
                    <a key={j} href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: "#888", textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#e79c00")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#888")}
                    >
                      {a.name}
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div style={{ margin: "0 22px", padding: "13px 0 20px", borderTop: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase" as const, color: "#888" }}>Ejercicios</span>
        <span style={{ fontFamily: "var(--font-montserrat, Montserrat, sans-serif)", fontWeight: 800, fontSize: 20, color: "#e79c00" }}>{w.exercises.length}</span>
      </div>
    </div>
  );
}
