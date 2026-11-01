"use client";

import { useState } from "react";
import { Big } from "./ui";

/** El alumno informa un peso mayor al máximo prescrito. `onAdd` devuelve un error o null. */
export default function AddLoad({
  label = "Mi equipo tiene más peso",
  onAdd,
}: {
  label?: string;
  onAdd: (kg: number) => string | null;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open)
    return (
      <Big variant="ghost" onClick={() => setOpen(true)}>
        {label}
      </Big>
    );

  const submit = () => {
    const kg = parseFloat(value.replace(",", "."));
    if (!Number.isFinite(kg) || kg <= 0) return setError("Escribe un peso válido en kg.");
    const err = onAdd(kg);
    if (err) setError(err);
    else {
      setOpen(false);
      setValue("");
      setError(null);
    }
  };

  return (
    <div className="space-y-2 rounded-xl border border-white/20 bg-white/5 p-3">
      <label className="block text-base">
        ¿Cuál es el siguiente peso disponible? (kg)
        <input
          className="mt-1 min-h-12 w-full rounded-lg border border-white/20 bg-white/10 px-3 text-lg text-brand-white"
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
      </label>
      {error && <p className="text-yellow-300">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Big onClick={() => setOpen(false)}>Cancelar</Big>
        <Big variant="primary" onClick={submit}>
          Usar este peso
        </Big>
      </div>
    </div>
  );
}
