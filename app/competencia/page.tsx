"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSupabaseAuth } from "@/providers/SupabaseProvider";

type LeaderboardEntry = {
  user_id: string;
  total_reps: number;
  email?: string | null;
};

export default function CompetenciaPage() {
  const { user, loading, signOut } = useSupabaseAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    setError(null);

    try {
      const response = await fetch("/api/squats");

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "No pudimos obtener el leaderboard.");
      }

      const body = (await response.json()) as { data?: LeaderboardEntry[] };
      setLeaderboard(body.data ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Error inesperado.");
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <section className="bg-brand-black text-brand-white min-h-[75vh] px-4 py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-brand-orange">Competencia SaidTrainer</h1>
          <p className="text-base text-gray-300">
            Inicia sesión, cuenta tus sentadillas con la app y suma puntos a la tabla semanal.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-300">
            <Link
              href="/squat-counter/index.html"
              className="rounded-full border border-brand-orange px-4 py-2 text-brand-orange hover:bg-brand-orange/10"
            >
              Abrir contador
            </Link>
            <button
              type="button"
              onClick={fetchLeaderboard}
              className="rounded-full border border-brand-orange px-4 py-2 text-brand-white hover:bg-brand-orange/20"
            >
              Actualizar tabla
            </button>
            {user ? (
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-brand-orange px-4 py-2 text-brand-white hover:bg-brand-orange/20"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-brand-orange px-4 py-2 text-brand-orange hover:bg-brand-orange/10"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Verificando sesión...</p>
          ) : user ? (
            <p className="text-sm text-gray-200">
              Conectado como{" "}
              <span className="font-semibold text-brand-orange">{user.email}</span>.
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              Debes iniciar sesión para que tus repeticiones se registren en la tabla.
            </p>
          )}
        </header>

        <div className="rounded-3xl border border-brand-orange/30 bg-brand-black/60 p-8 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-brand-orange">Leaderboard semanal</h2>
            {loadingLeaderboard && <span className="text-sm text-gray-400">Cargando...</span>}
          </div>
          {error && (
            <p className="mt-4 rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-200">{error}</p>
          )}

          {!leaderboard.length && !loadingLeaderboard ? (
            <p className="mt-6 text-center text-sm text-gray-400">
              Aún no hay repeticiones registradas esta semana. ¡Sé el primero!
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {leaderboard.map((entry, index) => (
                <li
                  key={entry.user_id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-brand-orange">{index + 1}º</span>
                    <span className="font-medium text-white">
                      {entry.email ?? entry.user_id}
                    </span>
                  </div>
                  <span className="font-semibold text-brand-orange">{entry.total_reps} reps</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-gray-200">
          <h3 className="text-lg font-semibold text-brand-orange">¿Cómo participar?</h3>
          <ol className="mt-3 space-y-2 list-decimal list-inside text-left">
            <li>Inicia sesión o crea tu cuenta desde el botón de arriba.</li>
            <li>
              Abre el contador de sentadillas en tu móvil y realiza tus repeticiones con la cámara.
            </li>
            <li>
              Al terminar, guarda el número final: la app registrará automáticamente tus repeticiones.
            </li>
            <li>Vuelve a esta página para ver cómo avanzas en la tabla semanal.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
