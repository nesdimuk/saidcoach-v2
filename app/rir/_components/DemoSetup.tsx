"use client";

import { useState } from "react";
import type { ExerciseType, LoadScheme, Prescription } from "@/lib/rir/engine";
import { cleanPhone } from "@/lib/rir/report";
import { encodePayload } from "@/lib/rir/prescription-url";
import { Big, Screen } from "./ui";

const field =
  "min-h-12 w-full rounded-lg border border-white/20 bg-white/10 px-3 text-lg text-brand-white";

export default function DemoSetup({ onStart }: { onStart: (p: Prescription, trainerPhone?: string) => void }) {
  const [name, setName] = useState("Sentadilla goblet");
  const [type, setType] = useState<ExerciseType>("compuesto_libre");
  const [rir, setRir] = useState(2);
  const [repMin, setRepMin] = useState(8);
  const [repMax, setRepMax] = useState(12);
  const [sets, setSets] = useState(3);
  const [rest, setRest] = useState(90);
  const [mode, setMode] = useState<"pasos" | "lista">("pasos");
  const [min, setMin] = useState(4);
  const [max, setMax] = useState(24);
  const [step, setStep] = useState(2);
  const [lista, setLista] = useState("5, 7.5, 10, 12.5, 15");
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);

  const build = (): Prescription => {
    const scheme: LoadScheme =
      mode === "pasos"
        ? { kind: "pasos", min, max, step }
        : {
            kind: "lista",
            loads: lista
              .split(/[,\s;]+/)
              .map((x) => parseFloat(x.replace(",", ".")))
              .filter((n) => Number.isFinite(n) && n > 0),
          };
    return {
      exerciseId: name.toLowerCase().replace(/\W+/g, "-") || "ejercicio",
      exerciseName: name || "Ejercicio",
      type,
      rirTarget: rir,
      repMin,
      repMax: Math.max(repMin, repMax),
      sets,
      restSec: rest,
      scheme,
      allowCalibration: type !== "compuesto_libre",
    };
  };

  const num = (set: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(parseFloat(e.target.value.replace(",", ".")) || 0);

  const copyLink = async () => {
    const url = `${location.origin}/rir?p=${encodePayload({ prescription: build(), trainerPhone: cleanPhone(phone) ?? undefined })}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia este link", url);
    }
  };

  return (
    <Screen
      footer={
        <>
          <Big variant="primary" onClick={() => onStart(build(), cleanPhone(phone) ?? undefined)}>
            Empezar
          </Big>
          <Big onClick={copyLink}>{copied ? "¡Link copiado!" : "Copiar link para el alumno"}</Big>
        </>
      }
    >
      <div>
        <h1 className="text-3xl font-bold text-brand-orange">Encuentra tu peso</h1>
        <p className="mt-1 text-brand-white/70">
          Modo demo: configura el ejercicio. Tu entrenador normalmente te envía un link ya listo.
        </p>
      </div>
      <label className="block space-y-1">
        <span>Ejercicio</span>
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block space-y-1">
        <span>Tipo</span>
        <select className={field} value={type} onChange={(e) => setType(e.target.value as ExerciseType)}>
          <option value="compuesto_libre">Compuesto libre</option>
          <option value="maquina">Máquina</option>
          <option value="aislado">Aislado</option>
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span>RIR objetivo</span>
          <input className={field} type="number" inputMode="numeric" min={0} max={4} value={rir} onChange={num(setRir)} />
        </label>
        <label className="space-y-1">
          <span>Series</span>
          <input className={field} type="number" inputMode="numeric" min={1} max={12} value={sets} onChange={num(setSets)} />
        </label>
        <label className="space-y-1">
          <span>Reps mín</span>
          <input className={field} type="number" inputMode="numeric" value={repMin} onChange={num(setRepMin)} />
        </label>
        <label className="space-y-1">
          <span>Reps máx</span>
          <input className={field} type="number" inputMode="numeric" value={repMax} onChange={num(setRepMax)} />
        </label>
        <label className="col-span-2 space-y-1">
          <span>Descanso (seg)</span>
          <input className={field} type="number" inputMode="numeric" value={rest} onChange={num(setRest)} />
        </label>
      </div>
      <label className="block space-y-1">
        <span>WhatsApp del entrenador (opcional)</span>
        <input
          className={field}
          type="tel"
          inputMode="tel"
          placeholder="+56 9 1234 5678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      <fieldset className="space-y-3">
        <legend className="mb-1">Pesos disponibles (kg)</legend>
        <div className="grid grid-cols-2 gap-3">
          <Big selected={mode === "pasos"} onClick={() => setMode("pasos")}>De a pasos</Big>
          <Big selected={mode === "lista"} onClick={() => setMode("lista")}>Lista</Big>
        </div>
        {mode === "pasos" ? (
          <div className="grid grid-cols-3 gap-3">
            <label className="space-y-1"><span>Mín</span><input className={field} type="number" inputMode="decimal" value={min} onChange={num(setMin)} /></label>
            <label className="space-y-1"><span>Máx</span><input className={field} type="number" inputMode="decimal" value={max} onChange={num(setMax)} /></label>
            <label className="space-y-1"><span>Paso</span><input className={field} type="number" inputMode="decimal" step="0.25" value={step} onChange={num(setStep)} /></label>
          </div>
        ) : (
          <input className={field} value={lista} onChange={(e) => setLista(e.target.value)} aria-label="Lista de pesos" />
        )}
      </fieldset>
    </Screen>
  );
}
