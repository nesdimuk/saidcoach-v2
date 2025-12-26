"use client";

import { useCallback, useEffect, useState } from "react";

type LeaderboardEntry = {
  user_id: string;
  display_name: string;
  total_points: number;
};

type Props = {
  companyId: string;
  currentUserId: string;
};

const PERIOD_LABELS: Record<string, string> = {
  daily: "Hoy",
  weekly: "Semana",
  monthly: "Mes",
};

export default function LeaderboardTabs({ companyId, currentUserId }: Props) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(
    async (targetPeriod: "daily" | "weekly" | "monthly", targetCompanyId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/get-leaderboard?period=${targetPeriod}&companyId=${targetCompanyId}`,
          { cache: "no-store" }
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || "No se pudo cargar el ranking.");
        }
        setEntries(payload?.leaderboard ?? []);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "No se pudo cargar el ranking.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchLeaderboard(period, companyId);
  }, [fetchLeaderboard, period, companyId]);

  return (
    <div className="space-y-6 rounded-3xl border border-black/10 bg-white p-8 shadow">
      <div className="flex gap-4">
        {(["daily", "weekly", "monthly"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setPeriod(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              period === key ? "bg-black text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {PERIOD_LABELS[key]}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-gray-500">Cargando ranking...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-500">Sin registros todavía.</p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, index) => {
            const isCurrent = entry.user_id === currentUserId;
            return (
              <li
                key={`${entry.user_id}-${index}`}
                className={`flex items-center justify-between rounded-xl border border-black/5 px-4 py-3 ${
                  isCurrent ? "bg-black text-white" : "bg-gray-50 text-black"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{index + 1}</span>
                  <span className="text-base font-medium">{entry.display_name}</span>
                  {isCurrent && <span className="text-xs uppercase tracking-wide">Tú</span>}
                </div>
                <span className="text-base font-semibold">{entry.total_points} pts</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
