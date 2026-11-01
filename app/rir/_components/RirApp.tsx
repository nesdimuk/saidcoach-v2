"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  decideNext,
  expandScheme,
  initialBias,
  isValidSet,
  roundDown,
  startingLoad,
  type Decision,
  type LadderState,
  type Prescription,
  type SetEntry,
  type StudentProfile,
} from "@/lib/rir/engine";
import { decodePayload } from "@/lib/rir/prescription-url";
import {
  getBias,
  getExcluded,
  lastValidLoad,
  saveSession,
  setExcluded as persistExcluded,
} from "@/lib/rir/storage";
import DemoSetup from "./DemoSetup";
import RestTimer from "./RestTimer";
import SetForm from "./SetForm";
import Summary from "./Summary";
import { Big, DECISION_STYLE, Screen, fmtKg } from "./ui";

type Phase = "loading" | "error" | "setup" | "pickLoad" | "intro" | "set" | "result" | "summary";

const DEFAULT_STUDENT: StudentProfile = { id: "anon", name: "Alumno", level: "intermedio" };

export default function RirApp() {
  const params = useSearchParams();
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState("");
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [student, setStudent] = useState<StudentProfile>(DEFAULT_STUDENT);
  const [loads, setLoads] = useState<number[]>([]);
  const [excluded, setExcluded] = useState<number[]>([]);
  const [bias, setBias] = useState(0);
  const [load, setLoad] = useState(0);
  const [reducedBy, setReducedBy] = useState(0);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [ladder, setLadder] = useState<LadderState | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [restEndsAt, setRestEndsAt] = useState(0);
  const saved = useRef(false);
  const booted = useRef(false);

  const begin = useCallback(async (p: Prescription, s: StudentProfile = DEFAULT_STUDENT) => {
    try {
      const ex = await getExcluded(p.exerciseId);
      const l = expandScheme(p.scheme, ex);
      const b = (await getBias(s.id)) ?? initialBias(s);
      const last = await lastValidLoad(p.exerciseId, s.id);
      const days = last ? Math.floor((Date.now() - new Date(last.date).getTime()) / 86_400_000) : null;
      const start = startingLoad({ prescription: p, loads: l, lastValidLoad: last?.load, daysSinceLast: days });
      setPrescription(p);
      setStudent(s);
      setExcluded(ex);
      setLoads(l);
      setBias(b);
      setSets([]);
      setLadder(null);
      setDecision(null);
      saved.current = false;
      if (start.kind === "carga") {
        setLoad(roundDown(l, start.load));
        setReducedBy(start.reducedBy);
        setPhase("intro");
      } else {
        setPhase("pickLoad");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo preparar el ejercicio.");
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const p = params.get("p");
    if (!p) return setPhase("setup");
    const r = decodePayload(p);
    if (!r.ok) {
      setError(r.error);
      return setPhase("error");
    }
    void begin(r.value.prescription, r.value.student ?? DEFAULT_STUDENT);
  }, [params, begin]);

  // Guardar al llegar al resumen
  useEffect(() => {
    if (phase !== "summary" || saved.current || !prescription) return;
    saved.current = true;
    void saveSession({
      id: `${prescription.exerciseId}-${Date.now()}`,
      exerciseId: prescription.exerciseId,
      exerciseName: prescription.exerciseName,
      studentId: student.id,
      date: new Date().toISOString(),
      sets: sets.map((s) => ({ ...s, valid: isValidSet(s) })),
      nextLoad: decision?.nextLoad ?? null,
      stopped: decision?.action === "detener",
      alert: decision?.alertCoach,
    });
  }, [phase, prescription, student, sets, decision]);

  if (phase === "loading") return <p className="p-6 text-center text-brand-white/70">Cargando…</p>;

  if (phase === "error")
    return (
      <Screen>
        <h1 className="text-2xl font-bold">Ups, algo salió mal</h1>
        <p className="text-lg text-brand-white/80">{error}</p>
        <Big onClick={() => (window.location.href = "/rir")}>Usar modo demo</Big>
      </Screen>
    );

  if (phase === "setup") return <DemoSetup onStart={(p) => void begin(p)} />;

  const p = prescription!;
  const setIndex = sets.length + 1;

  if (phase === "pickLoad")
    return (
      <Screen>
        <h1 className="text-2xl font-bold">Elige tu peso inicial</h1>
        <p className="text-lg text-brand-white/80">
          Un peso con el que harías unas <b>15 reps fáciles</b>. Ante la duda, el más liviano.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {loads.map((l) => (
            <Big
              key={l}
              onClick={() => {
                setLoad(l);
                setReducedBy(0);
                setPhase("intro");
              }}
            >
              {String(l).replace(".", ",")}
            </Big>
          ))}
        </div>
      </Screen>
    );

  if (phase === "intro") {
    const warm = [0.5, 0.7]
      .map((f) => roundDown(loads, load * f))
      .filter((w, i, a) => w < load && a.indexOf(w) === i);
    return (
      <Screen
        footer={
          <>
            <Big variant="primary" onClick={() => setPhase("set")}>
              Empezar serie 1
            </Big>
            <Big variant="ghost" onClick={() => setPhase("pickLoad")}>
              Cambiar peso inicial
            </Big>
          </>
        }
      >
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-white/60">Hola {student.name}</p>
          <h1 className="text-3xl font-bold">{p.exerciseName}</h1>
        </div>
        <ul className="space-y-1 text-lg text-brand-white/90">
          <li>{p.sets} series de {p.repMin}–{p.repMax} reps</li>
          <li>Objetivo: terminar con {p.rirTarget} {p.rirTarget === 1 ? "rep" : "reps"} de reserva</li>
        </ul>
        <div className="rounded-xl bg-brand-orange p-5 text-black">
          <p className="text-sm font-semibold uppercase">Peso para la primera serie</p>
          <p className="text-5xl font-bold">{fmtKg(load)}</p>
          {reducedBy > 0 && (
            <p className="mt-1 text-sm">Bajamos {Math.round(reducedBy * 1000) / 10}% por los días sin entrenar.</p>
          )}
        </div>
        {warm.length > 0 && (
          <p className="rounded-xl border border-white/20 p-4 text-brand-white/80">
            Calentamiento opcional (no cuenta): {warm.map(fmtKg).join(" y ")}, unas 5–6 reps cada una.
          </p>
        )}
        <p className="text-brand-white/70">Si te duele algo, paramos. Si dudas, vamos más livianos.</p>
      </Screen>
    );
  }

  if (phase === "set")
    return (
      <SetForm
        key={setIndex}
        prescription={p}
        setIndex={setIndex}
        load={load}
        ladderText={ladder ? decision?.ladderText : undefined}
        onSubmit={(entry) => {
          const next = [...sets, entry];
          const d = decideNext({ prescription: p, loads, bias, sets: next, ladder });
          setSets(next);
          setDecision(d);
          setLadder(d.ladder);
          setRestEndsAt(Date.now() + p.restSec * 1000);
          setPhase("result");
        }}
        onLoadMissing={() => {
          const ex = [...excluded, load];
          try {
            const l = expandScheme(p.scheme, ex);
            setExcluded(ex);
            setLoads(l);
            setLoad(roundDown(l, load));
            void persistExcluded(p.exerciseId, ex);
          } catch {
            /* es la única carga: no se puede quitar */
          }
        }}
      />
    );

  if (phase === "result" && decision) {
    const st = DECISION_STYLE[decision.color];
    const finished = decision.action === "detener" || sets.length >= p.sets;
    return (
      <Screen
        footer={
          finished ? (
            <Big variant="primary" onClick={() => setPhase("summary")}>
              Ver resumen
            </Big>
          ) : (
            <Big
              variant="primary"
              onClick={() => {
                setLoad(decision.nextLoad ?? load);
                setPhase("set");
              }}
            >
              Siguiente serie
            </Big>
          )
        }
      >
        <div className={`rounded-2xl p-6 ${st.box}`} role="status">
          <p className="text-lg font-semibold">
            {st.emoji} {st.label}
          </p>
          <p className="mt-2 text-3xl font-bold leading-tight">{decision.message}</p>
          {decision.nextLoad != null && decision.action === "continuar" && decision.color !== "tecnica" && (
            <p className="mt-2 text-lg opacity-80">Siguiente serie: {fmtKg(decision.nextLoad)}</p>
          )}
        </div>
        {!decision.setValid && (
          <p className="rounded-xl border border-white/20 p-3 text-brand-white/80">
            Esta serie no cuenta para calcular tu peso.
          </p>
        )}
        {decision.alertCoach && (
          <p className="rounded-xl bg-yellow-400 p-3 font-semibold text-black">
            ⚠️ Avísale a tu entrenador: {decision.alertCoach}.
          </p>
        )}
        {!finished && <RestTimer endsAt={restEndsAt} onExtend={(ms) => setRestEndsAt((t) => t + ms)} />}
      </Screen>
    );
  }

  return (
    <Summary
      name={p.exerciseName}
      sets={sets}
      validFlags={sets.map(isValidSet)}
      nextLoad={decision?.nextLoad ?? null}
      stopped={decision?.action === "detener"}
      alert={decision?.alertCoach}
      onRestart={() => (window.location.href = window.location.pathname + window.location.search)}
    />
  );
}
