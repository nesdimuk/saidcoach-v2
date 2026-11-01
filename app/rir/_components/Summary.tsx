"use client";

import { useState } from "react";
import type { SetEntry } from "@/lib/rir/engine";
import { buildReport, whatsappUrl } from "@/lib/rir/report";
import { Big, Screen, fmtKg } from "./ui";

export default function Summary({
  name,
  studentName,
  trainerPhone,
  sets,
  validFlags,
  nextLoad,
  stopped,
  alert,
  onRestart,
}: {
  name: string;
  studentName: string;
  trainerPhone?: string;
  sets: SetEntry[];
  validFlags: boolean[];
  nextLoad: number | null;
  stopped: boolean;
  alert?: string;
  onRestart: () => void;
}) {
  const [date] = useState(() => new Date());
  const [copied, setCopied] = useState(false);
  const report = buildReport({ studentName, exerciseName: name, date, sets, nextLoad, stopped, alertCoach: alert });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia el informe", report);
    }
  };

  return (
    <Screen
      footer={
        <>
          <a
            href={whatsappUrl(report, trainerPhone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 w-full items-center justify-center rounded-xl bg-green-600 px-4 text-lg font-semibold text-white active:scale-[0.98]"
          >
            Enviar a mi entrenador por WhatsApp
          </a>
          <Big onClick={copy}>{copied ? "¡Copiado!" : "Copiar informe"}</Big>
          <Big variant="ghost" onClick={onRestart}>
            Terminar
          </Big>
        </>
      }
    >
      <div>
        <p className="text-sm uppercase tracking-wide text-brand-white/60">Resumen</p>
        <h1 className="text-3xl font-bold">{name}</h1>
      </div>

      {(stopped || alert) && (
        <p className="rounded-xl bg-yellow-400 p-4 font-semibold text-black">
          ⚠️ {stopped ? "Paramos el ejercicio. " : ""}Avísale a tu entrenador{alert ? `: ${alert}.` : "."}
        </p>
      )}

      <ul className="divide-y divide-white/10 rounded-xl border border-white/20">
        {sets.map((s, i) => (
          <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-lg">
            <span className="font-semibold">Serie {s.setIndex}</span>
            <span className="tabular-nums">
              {fmtKg(s.load)} × {s.reps}
            </span>
            <span className="text-brand-white/70">RIR {s.rirReported === 6 ? "5+" : s.rirReported}</span>
            <span aria-label={validFlags[i] ? "válida" : "no cuenta"}>{validFlags[i] ? "✓" : "✗"}</span>
          </li>
        ))}
      </ul>

      {nextLoad != null && !stopped && (
        <div className="rounded-xl bg-brand-orange p-5 text-black">
          <p className="text-sm font-semibold uppercase">Próxima sesión empieza con</p>
          <p className="text-4xl font-bold">{fmtKg(nextLoad)}</p>
        </div>
      )}
      <p className="text-sm text-brand-white/60">Guardado en este dispositivo.</p>
    </Screen>
  );
}
