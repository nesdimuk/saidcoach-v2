"use client";

import React, { useEffect, useState } from "react";

export default function ProgressPage() {
  const [jsonSemana1, setJsonSemana1] = useState(null);
  const [jsonSemana2, setJsonSemana2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (jsonSemana1) {
      setJsonSemana2(null);
    }
  }, [jsonSemana1]);

  const handleFileUpload = (event) => {
    setError("");
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setError("El archivo debe ser un JSON.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setJsonSemana1(data);
      } catch (err) {
        setError("No se pudo leer el JSON. Verifica el formato.");
      }
    };
    reader.onerror = () => setError("No se pudo leer el archivo.");
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!jsonSemana1) return;
    setLoading(true);
    setError("");
    setJsonSemana2(null);

    const payload = {
      programaAnterior: jsonSemana1.programa,
      contextoActual: {
        sueno: jsonSemana1.usuario?.sueno,
        estres: jsonSemana1.usuario?.estres,
        viajando: false,
        enfermedad: "ninguna",
        pausaSemanas: 0,
      },
    };

    try {
      const res = await fetch("/api/next-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo generar la Semana 2.");
      const data = await res.json();
      setJsonSemana2(data);
    } catch (err) {
      setError(err.message || "Error desconocido al generar la Semana 2.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-300">
            Progreso - Semana 2
          </p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Genera la siguiente semana de entrenamiento
          </h1>
          <p className="mt-2 text-sm text-slate-200">
            Carga el JSON de la Semana 1 y genera automáticamente la Semana 2 con tu contexto actual.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
          <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Cargar JSON de Semana 1
              </label>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="mt-2 block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!jsonSemana1 || loading}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generando Semana 2...
                </span>
              ) : (
                "Generar Semana 2"
              )}
            </button>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500">
                Revisa que el JSON cargado contenga los campos esperados (usuario, programa, sesiones...).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-semibold text-slate-800">Semana 1 (cargada)</p>
                {jsonSemana1 && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    lista
                  </span>
                )}
              </div>
              <div className="max-h-[300px] overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-800">
                {jsonSemana1 ? (
                  <pre className="whitespace-pre-wrap break-words font-mono">
                    {JSON.stringify(jsonSemana1, null, 2)}
                  </pre>
                ) : (
                  <p className="text-slate-500">Carga un JSON de Semana 1 para ver la vista previa.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-semibold text-slate-800">Semana 2 (generada)</p>
                {jsonSemana2 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                    listo
                  </span>
                )}
              </div>
              <div className="max-h-[300px] overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-800">
                {jsonSemana2 ? (
                  <pre className="whitespace-pre-wrap break-words font-mono">
                    {JSON.stringify(jsonSemana2, null, 2)}
                  </pre>
                ) : (
                  <p className="text-slate-500">Aquí verás el resultado de la Semana 2.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
