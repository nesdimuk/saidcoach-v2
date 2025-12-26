"use client";

import React, { useMemo, useState } from "react";
import ProgramPreview from "@/components/ProgramPreview";

const OBJETIVOS = [
  "Perder grasa",
  "Ganar músculo",
  "Recomposición corporal",
  "Mejorar fuerza",
  "Salud general",
];

const NIVELES = [
  "Novato (0-6 meses)",
  "Principiante (6-12 meses)",
  "Intermedio (1-3 años)",
  "Avanzado (3+ años)",
];

const ANOS_ENTRENANDO = ["0", "1", "2", "3", "4", "5+"];

const MATERIALES = [
  "Barra",
  "Discos",
  "Mancuernas",
  "Banda elástica",
  "Polea / Cable",
  "Banco",
  "Kettlebell",
  "Ninguno",
];

const FRECUENCIAS = ["2 sesiones", "3 sesiones", "4 sesiones", "5 sesiones"];

const TIEMPO_SESION = ["30 min", "45 min", "60 min", "75 min"];

const LESIONES = ["Ninguna", "Hombro", "Rodilla", "Espalda baja", "Cadera", "Muñeca", "Otra"];

const PREFERENCIAS = [
  "Prefiero máquinas",
  "Prefiero mancuernas",
  "Prefiero peso corporal",
  "Prefiero polea",
  "Evitar ejercicios sobre la cabeza",
  "Movimientos simples",
];

const SUENO_OPCIONES = [
  { label: "<5 horas", value: 4.5 },
  { label: "5–6 horas", value: 5.5 },
  { label: "6–7 horas", value: 6.5 },
  { label: "7–8 horas", value: 7.5 },
  { label: ">8 horas", value: 8.5 },
];

const ESTRES_OPCIONES = ["Bajo", "Medio", "Alto"];

const ACTIVIDAD = [
  "Nada",
  "1–2 entrenamientos",
  "3+ entrenamientos",
  "Solo caminatas",
  "Retomando después de pausa",
];

export default function CreatorPage() {
  const [objetivo, setObjetivo] = useState("");
  const [edad, setEdad] = useState("");
  const [nivel, setNivel] = useState("");
  const [anosEntrenando, setAnosEntrenando] = useState("");
  const [material, setMaterial] = useState([]);
  const [frecuencia, setFrecuencia] = useState("");
  const [tiempoSesion, setTiempoSesion] = useState("");
  const [lesiones, setLesiones] = useState("");
  const [otraLesion, setOtraLesion] = useState("");
  const [preferencias, setPreferencias] = useState([]);
  const [sueno, setSueno] = useState("");
  const [estres, setEstres] = useState("");
  const [actividadReciente, setActividadReciente] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [programa, setPrograma] = useState(null);

  const handleCheckboxGroup = (value, group, setter) => {
    const exists = group.includes(value);
    if (exists) {
      setter(group.filter((item) => item !== value));
    } else {
      const next = value === "Ninguno" ? ["Ninguno"] : group.filter((item) => item !== "Ninguno");
      setter([...next, value]);
    }
  };

  const isValid = useMemo(() => {
    const baseFields = [
      objetivo,
      edad,
      nivel,
      anosEntrenando,
      frecuencia,
      tiempoSesion,
      lesiones,
      sueno,
      estres,
      actividadReciente,
    ].every((val) => String(val).trim() !== "");

    const materialesValidos = material.length > 0;
    const preferenciasValidas = preferencias.length > 0;
    const lesionOtraValida = lesiones === "Otra" ? otraLesion.trim() !== "" : true;

    return baseFields && materialesValidos && preferenciasValidas && lesionOtraValida;
  }, [
    objetivo,
    edad,
    nivel,
    anosEntrenando,
    frecuencia,
    tiempoSesion,
    lesiones,
    sueno,
    estres,
    actividadReciente,
    material,
    preferencias,
    otraLesion,
  ]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValid) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    setError("");
    setLoading(true);
    setPrograma(null);

    const payload = {
      objetivo,
      edad: Number(edad),
      nivel,
      anosEntrenando,
      material,
      frecuencia,
      tiempoSesion,
      lesiones: lesiones === "Otra" ? otraLesion : lesiones,
      preferencias,
      sueno: Number(sueno),
      estres,
      actividadReciente,
    };

    try {
      const response = await fetch("/api/generate-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("No se pudo generar el programa");
      }

      const data = await response.json();
      setPrograma(data);
    } catch (err) {
      setError(err.message || "No se pudo generar el programa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-300">
            Said Trainer Creator
          </p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Crea tu programa personalizado
          </h1>
          <p className="mt-2 text-sm text-slate-200">
            Completa los 12 datos. Todos son obligatorios para generar tu plan de entrenamiento.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl bg-white p-6 shadow-sm"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Objetivo */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Objetivo</label>
                <select
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="">Selecciona objetivo</option>
                  {OBJETIVOS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Edad */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Edad</label>
                <input
                  type="number"
                  min={18}
                  max={80}
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Ej. 30"
                  required
                />
              </div>

              {/* Nivel */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Nivel de experiencia</label>
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="">Selecciona nivel</option>
                  {NIVELES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Años entrenando */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Años entrenando</label>
                <select
                  value={anosEntrenando}
                  onChange={(e) => setAnosEntrenando(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="">Selecciona años</option>
                  {ANOS_ENTRENANDO.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material disponible */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Material disponible
                </label>
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {MATERIALES.map((item) => (
                    <label
                      key={item}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm hover:border-indigo-300"
                    >
                      <input
                        type="checkbox"
                        checked={material.includes(item)}
                        onChange={() => handleCheckboxGroup(item, material, setMaterial)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Frecuencia semanal */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Frecuencia semanal</label>
                <select
                  value={frecuencia}
                  onChange={(e) => setFrecuencia(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="">Selecciona frecuencia</option>
                  {FRECUENCIAS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tiempo por sesión */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Tiempo por sesión</label>
                <select
                  value={tiempoSesion}
                  onChange={(e) => setTiempoSesion(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="">Selecciona tiempo</option>
                  {TIEMPO_SESION.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesiones */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Lesiones o molestias</label>
                <select
                  value={lesiones}
                  onChange={(e) => setLesiones(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="">Selecciona opción</option>
                  {LESIONES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {lesiones === "Otra" && (
                  <input
                    type="text"
                    value={otraLesion}
                    onChange={(e) => setOtraLesion(e.target.value)}
                    placeholder="Describe la molestia"
                    className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                )}
              </div>

              {/* Preferencias */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Preferencias de ejercicios
                </label>
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {PREFERENCIAS.map((item) => (
                    <label
                      key={item}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm hover:border-indigo-300"
                    >
                      <input
                        type="checkbox"
                        checked={preferencias.includes(item)}
                        onChange={() => handleCheckboxGroup(item, preferencias, setPreferencias)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Horas de sueño */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Horas de sueño</label>
                <select
                  value={sueno}
                  onChange={(e) => setSueno(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="">Selecciona horas</option>
                  {SUENO_OPCIONES.map((opt) => (
                    <option key={opt.label} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estrés actual */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Estrés actual</label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {ESTRES_OPCIONES.map((opt) => (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm hover:border-indigo-300"
                    >
                      <input
                        type="radio"
                        name="estres"
                        value={opt}
                        checked={estres === opt}
                        onChange={(e) => setEstres(e.target.value)}
                        className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actividad última semana */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Actividad de la última semana
                </label>
                <select
                  value={actividadReciente}
                  onChange={(e) => setActividadReciente(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="">Selecciona actividad</option>
                  {ACTIVIDAD.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Todos los campos son obligatorios. Selecciona opciones y genera tu programa.
              </p>
              <button
                type="submit"
                disabled={!isValid || loading}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generando...
                  </span>
                ) : (
                  "Generar programa"
                )}
              </button>
            </div>
          </form>

          <ProgramPreview data={programa} />
        </div>
      </div>
    </div>
  );
}
