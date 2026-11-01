"use client";

import { useEffect, useRef, useState } from "react";
import { Big } from "./ui";

/** El tiempo se calcula desde `endsAt` (hora absoluta): sigue correcto con la pantalla bloqueada. */
export default function RestTimer({
  endsAt,
  onExtend,
}: {
  endsAt: number;
  onExtend: (ms: number) => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [sound, setSound] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    fired.current = false;
  }, [endsAt]);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const done = remaining === 0;

  useEffect(() => {
    if (!done || fired.current) return;
    fired.current = true;
    try {
      navigator.vibrate?.([300, 120, 300]);
    } catch {}
    if (sound) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.frequency.value = 880;
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch {}
    }
  }, [done, sound]);

  const mm = String(Math.floor(remaining / 60));
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="rounded-xl border border-white/20 bg-white/5 p-4 text-center" role="timer" aria-live="off">
      <p className="text-sm text-brand-white/70">{done ? "¡Descanso listo!" : "Descansa"}</p>
      <p className={`text-5xl font-bold tabular-nums ${done ? "text-green-400" : "text-brand-white"}`}>
        {mm}:{ss}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <Big onClick={() => onExtend(30_000)} className="!min-h-12 !text-base">
          +30 s
        </Big>
        <label className="flex min-h-12 w-full items-center justify-center gap-2 text-base">
          <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} className="h-5 w-5" />
          Sonido
        </label>
      </div>
    </div>
  );
}
