"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseAuth, useSupabaseClient } from "@/providers/SupabaseProvider";

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const { user, loading, signOut } = useSupabaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companySlug = searchParams.get("company") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinCompany = async () => {
    if (!companySlug) return;
    await fetch("/api/join-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companySlug }),
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      await handleJoinCompany();
      router.push("/dashboard");
    } catch {
      setError("No se pudo iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-white px-4 py-16 text-black">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-black/10 bg-white p-10 shadow-lg">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Accede al reto</p>
          <h1 className="text-3xl font-semibold text-black">Inicia sesión</h1>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Verificando sesión...</p>
        ) : user ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Sesión activa como <span className="font-semibold">{user.email}</span>
            </p>
            <button
              type="button"
              onClick={async () => {
                await handleJoinCompany();
                router.push("/dashboard");
              }}
              className="w-full rounded-md bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Ir al dashboard
            </button>
            <button
              type="button"
              onClick={async () => {
                await signOut();
              }}
              className="w-full rounded-md border border-black px-4 py-3 font-semibold text-black transition hover:bg-gray-50"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-medium">
                Correo
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                />
              </label>
              <label className="block text-sm font-medium">
                Contraseña
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Entrando..." : "Entrar"}
              </button>
            </form>
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link
                href={companySlug ? `/signup?company=${companySlug}` : "/signup"}
                className="font-semibold underline"
              >
                Regístrate
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
