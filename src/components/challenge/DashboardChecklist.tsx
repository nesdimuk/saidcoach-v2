"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChallengeRow, DailyLogRow, UserStreakRow } from "@/lib/challenge/types";
import { MOVEMENT_TOP_BONUS } from "@/lib/challenge/config";

type DailyLogResponse = {
  date: string;
  log: DailyLogRow;
  streaks: UserStreakRow;
  challenge: ChallengeRow | null;
};

type Props = {
  companyId: string;
  challenge: ChallengeRow | null;
};

export default function DashboardChecklist({ companyId, challenge }: Props) {
  const [data, setData] = useState<DailyLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [movementInput, setMovementInput] = useState("");
  const [gratitudeText, setGratitudeText] = useState("");
  const [notesText, setNotesText] = useState("");
  const [nutritionUploading, setNutritionUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchDailyLog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/get-daily-log?companyId=${companyId}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "No se pudo cargar el día.");
      }
      const payload = await response.json();
      setData(payload);
      setGratitudeText(payload?.log?.gratitude_text ?? "");
      setNotesText(payload?.log?.notes ?? "");
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "No se pudo cargar el día.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchDailyLog();
  }, [fetchDailyLog]);

  const handleAction = useCallback(
    async (path: string, body?: Record<string, unknown>) => {
      setActionMessage(null);
      try {
        const response = await fetch(path, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...body, companyId }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || "No se pudo guardar.");
        }
        await fetchDailyLog();
        return payload;
      } catch (actionError) {
        const message =
          actionError && typeof actionError === "object" && "message" in actionError
            ? String((actionError as Error).message)
            : "No se pudo guardar.";
        setActionMessage(message);
        throw actionError;
      }
    },
    [companyId, fetchDailyLog]
  );

  const handleMovement = async () => {
    if (!movementInput) {
      setActionMessage("Ingresa repeticiones válidas.");
      return;
    }
    const reps = Number(movementInput);
    if (!Number.isFinite(reps) || reps <= 0) {
      setActionMessage("Ingresa repeticiones válidas.");
      return;
    }
    await handleAction("/api/log-movement", { reps });
    setMovementInput("");
  };

  const handleNutritionUpload = async (file: File) => {
    setNutritionUploading(true);
    setActionMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyId", companyId);
      const response = await fetch("/api/log-nutrition", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "No se pudo guardar la foto.");
      }
      await fetchDailyLog();
    } catch (uploadError) {
      const message =
        uploadError && typeof uploadError === "object" && "message" in uploadError
          ? String((uploadError as Error).message)
          : "No se pudo guardar la foto.";
      setActionMessage(message);
    } finally {
      setNutritionUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleGratitude = async () => {
    if (!gratitudeText.trim()) {
      setActionMessage("Comparte un mensaje breve de gratitud.");
      return;
    }
    await handleAction("/api/log-gratitude", { text: gratitudeText.trim() });
  };

  const handleNotes = async () => {
    try {
      const response = await fetch("/api/log-notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notesText, companyId }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "No se pudo guardar la nota.");
      }
      await fetchDailyLog();
      setActionMessage("Nota actualizada.");
    } catch (notesError) {
      const message =
        notesError && typeof notesError === "object" && "message" in notesError
          ? String((notesError as Error).message)
          : "No se pudo guardar la nota.";
      setActionMessage(message);
    }
  };

  const completedLessons = useMemo(() => {
    return data ? Math.floor((data.log.lesson_points ?? 0) / 3) : 0;
  }, [data]);

  const maxMovementGoal = challenge?.movement_goal ?? data?.challenge?.movement_goal ?? 0;
  const maxLessons = challenge?.lessons_per_day ?? data?.challenge?.lessons_per_day ?? 1;

  const topBonusLabel = useMemo(() => {
    if (!data?.log.movement_bonus_points) return null;
    const entry = Object.entries(MOVEMENT_TOP_BONUS).find(
      ([, points]) => points === data.log.movement_bonus_points
    );
    if (!entry) return null;
    return `Top ${entry[0]} movimiento (+${entry[1]} pts)`;
  }, [data]);

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando checklist...</p>;
  }

  if (error || !data) {
    return <p className="text-sm text-red-600">{error ?? "No se pudo cargar la información."}</p>;
  }

  const { log, streaks } = data;
  const totalPoints = log.total_points ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-3xl border border-black/10 bg-white p-6 shadow md:grid-cols-3">
        <div>
          <p className="text-xs uppercase text-gray-500">Hoy</p>
          <p className="text-2xl font-semibold">{totalPoints} pts</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Racha actual</p>
          <p className="text-2xl font-semibold">{streaks?.current_streak ?? 0} días</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Mejor racha</p>
          <p className="text-2xl font-semibold">{streaks?.longest_streak ?? 0} días</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Movimiento</h3>
            <span className="text-sm text-gray-600">
              {log.movement_reps}/{maxMovementGoal} reps
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              type="number"
              min={1}
              value={movementInput}
              onChange={(event) => setMovementInput(event.target.value)}
              placeholder="Repeticiones"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
            />
            <button
              type="button"
              onClick={handleMovement}
              className="rounded-md bg-black px-4 py-2 font-semibold text-white transition hover:bg-gray-800"
            >
              Cargar
            </button>
            <button
              type="button"
              onClick={() => window.open("/calculadora.html", "_blank")}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-50"
            >
              Abrir contador
            </button>
          </div>
          {topBonusLabel && <p className="mt-2 text-sm text-green-600">{topBonusLabel}</p>}
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Nutrición</h3>
            <span className="text-sm text-gray-600">
              {log.nutrition_photo_url ? "Foto enviada" : "Pendiente"}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Toma una foto directa de la cámara.</p>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={nutritionUploading}
              className="rounded-md bg-black px-4 py-2 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {nutritionUploading ? "Subiendo..." : "Tomar foto"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleNutritionUpload(file);
                }
              }}
            />
          </div>
          {log.nutrition_bonus_points > 0 && (
            <p className="mt-2 text-sm text-green-600">
              Bonus temprano +{log.nutrition_bonus_points} pts
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Lección</h3>
            <span className="text-sm text-gray-600">
              {completedLessons}/{maxLessons}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Suma +3 pts por lección completada.</p>
          <button
            type="button"
            disabled={completedLessons >= maxLessons}
            onClick={() => handleAction("/api/log-lesson")}
            className="mt-4 w-full rounded-md bg-black px-4 py-2 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {completedLessons >= maxLessons ? "Completado" : "Registrar lección"}
          </button>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow">
          <h3 className="text-lg font-semibold">Meditación</h3>
          <p className="mt-2 text-sm text-gray-500">Completa 5 minutos y confirma.</p>
          <button
            type="button"
            disabled={log.meditation_points > 0}
            onClick={() => handleAction("/api/log-meditation", { completed: true })}
            className="mt-4 w-full rounded-md bg-black px-4 py-2 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {log.meditation_points > 0 ? "Completado" : "Marcar como hecho"}
          </button>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow md:col-span-2">
          <h3 className="text-lg font-semibold">Gratitud</h3>
          <p className="mt-1 text-sm text-gray-500">Escribe una frase corta.</p>
          <textarea
            value={gratitudeText}
            onChange={(event) => setGratitudeText(event.target.value)}
            disabled={log.gratitude_points > 0}
            rows={3}
            className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none disabled:bg-gray-100"
            placeholder="Hoy agradezco por..."
          />
          <button
            type="button"
            disabled={log.gratitude_points > 0}
            onClick={handleGratitude}
            className="mt-3 w-full rounded-md bg-black px-4 py-2 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {log.gratitude_points > 0 ? "Enviado" : "Guardar gratitud"}
          </button>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow md:col-span-2">
          <h3 className="text-lg font-semibold">Notas personales</h3>
          <textarea
            value={notesText}
            onChange={(event) => setNotesText(event.target.value)}
            rows={3}
            className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
            placeholder="Sin puntaje, solo para ti."
          />
          <button
            type="button"
            onClick={handleNotes}
            className="mt-3 w-full rounded-md border border-gray-300 px-4 py-2 font-semibold text-black transition hover:bg-gray-50"
          >
            Guardar nota
          </button>
        </div>
      </div>

      {actionMessage && <p className="text-sm text-red-600">{actionMessage}</p>}
    </div>
  );
}
