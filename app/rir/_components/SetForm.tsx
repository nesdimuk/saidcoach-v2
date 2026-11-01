"use client";

import { useState } from "react";
import type { Prescription, RirReported, SetEntry } from "@/lib/rir/engine";
import AddLoad from "./AddLoad";
import HelpRir from "./HelpRir";
import { Big, Screen, fmtKg } from "./ui";

type Step = "reps" | "rir" | "dolor" | "tecnica";

export default function SetForm({
  prescription: p,
  setIndex,
  load,
  ladderText,
  onSubmit,
  onLoadMissing,
  onAddHeavier,
}: {
  prescription: Prescription;
  setIndex: number;
  load: number;
  ladderText?: string;
  onSubmit: (e: SetEntry) => void;
  onLoadMissing: () => void;
  /** Solo si la carga actual es la máxima conocida. */
  onAddHeavier?: (kg: number) => string | null;
}) {
  const [step, setStep] = useState<Step>("reps");
  const [reps, setReps] = useState(p.repMin);
  const [rir, setRir] = useState<RirReported | null>(null);
  const [pain, setPain] = useState<boolean | null>(null);

  const header = (
    <div>
      <p className="text-sm uppercase tracking-wide text-brand-white/60">
        {p.exerciseName} · serie {setIndex} de {p.sets}
      </p>
      <p className="text-3xl font-bold text-brand-orange">{fmtKg(load)}</p>
      {ladderText && (
        <p className="mt-2 rounded-lg bg-purple-600 px-3 py-2 font-semibold text-white">🟣 {ladderText}</p>
      )}
    </div>
  );

  const finish = (techniqueBroken: boolean) =>
    onSubmit({ setIndex, load, reps, rirReported: rir ?? 6, pain: pain ?? false, techniqueBroken });

  if (step === "reps") {
    return (
      <Screen
        footer={
          <>
            <Big variant="primary" onClick={() => setStep("rir")}>
              Siguiente
            </Big>
            <Big variant="ghost" onClick={onLoadMissing}>
              Mi equipo no tiene este peso
            </Big>
            {onAddHeavier && <AddLoad onAdd={onAddHeavier} />}
          </>
        }
      >
        {header}
        <h1 className="text-2xl font-bold">¿Cuántas reps hiciste?</h1>
        <div className="flex items-center gap-4">
          <Big onClick={() => setReps((r) => Math.max(1, r - 1))} className="!w-20 !text-3xl" aria-label="menos">
            −
          </Big>
          <p className="flex-1 text-center text-7xl font-bold tabular-nums" aria-live="polite">
            {reps}
          </p>
          <Big onClick={() => setReps((r) => Math.min(60, r + 1))} className="!w-20 !text-3xl" aria-label="más">
            +
          </Big>
        </div>
        <p className="text-center text-brand-white/60">
          Objetivo: {p.repMin}–{p.repMax} reps
        </p>
      </Screen>
    );
  }

  if (step === "rir") {
    const opts: { v: RirReported; label: string }[] = [
      { v: 0, label: "0" },
      { v: 1, label: "1" },
      { v: 2, label: "2" },
      { v: 3, label: "3" },
      { v: 4, label: "4" },
      { v: 6, label: "5+" },
    ];
    return (
      <Screen footer={<Big variant="ghost" onClick={() => setStep("reps")}>Atrás</Big>}>
        {header}
        <h1 className="text-2xl font-bold">¿Cuántas reps más podrías haber hecho con buena técnica?</h1>
        <div className="grid grid-cols-3 gap-3">
          {opts.map((o) => (
            <Big
              key={o.v}
              selected={rir === o.v}
              onClick={() => {
                setRir(o.v);
                setStep("dolor");
              }}
              className="!min-h-16 !text-2xl"
            >
              {o.label}
            </Big>
          ))}
        </div>
        <HelpRir />
      </Screen>
    );
  }

  if (step === "dolor") {
    return (
      <Screen footer={<Big variant="ghost" onClick={() => setStep("rir")}>Atrás</Big>}>
        {header}
        <h1 className="text-2xl font-bold">¿Sentiste dolor? (no esfuerzo)</h1>
        <div className="grid grid-cols-2 gap-3">
          <Big
            onClick={() => {
              setPain(false);
              setStep("tecnica");
            }}
            className="!min-h-20 !text-2xl"
          >
            No
          </Big>
          <Big
            onClick={() => {
              setPain(true);
              setStep("tecnica");
            }}
            className="!min-h-20 !text-2xl"
          >
            Sí
          </Big>
        </div>
      </Screen>
    );
  }

  return (
    <Screen footer={<Big variant="ghost" onClick={() => setStep("dolor")}>Atrás</Big>}>
      {header}
      <h1 className="text-2xl font-bold">¿Se rompió la técnica?</h1>
      <div className="grid grid-cols-2 gap-3">
        <Big onClick={() => finish(false)} className="!min-h-20 !text-2xl">
          No
        </Big>
        <Big onClick={() => finish(true)} className="!min-h-20 !text-2xl">
          Sí
        </Big>
      </div>
    </Screen>
  );
}
