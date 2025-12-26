"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  companySlug: string;
  isAuthenticated: boolean;
  isMember: boolean;
};

export default function CompanyJoinActions({ companySlug, isAuthenticated, isMember }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);

  const handleJoin = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/join-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companySlug }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "No se pudo unirse a la empresa.");
      }

      startTransition(() => {
        router.push("/dashboard");
      });
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "No se pudo completar la acción.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <Link
          href={`/signup?company=${companySlug}`}
          className="block rounded-md bg-black px-4 py-3 text-center font-semibold text-white transition hover:bg-gray-800"
        >
          Crear mi cuenta
        </Link>
        <Link
          href={`/login?company=${companySlug}`}
          className="block rounded-md border border-black px-4 py-3 text-center font-semibold text-black transition hover:bg-gray-50"
        >
          Ya tengo cuenta
        </Link>
      </div>
    );
  }

  if (isMember) {
    return (
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="w-full rounded-md bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
      >
        Ir al dashboard
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleJoin}
        disabled={submitting || pending}
        className="w-full rounded-md bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting || pending ? "Uniéndote..." : "Unirme al reto"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
