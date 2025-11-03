"use client";

import { useState } from "react";
import Link from "next/link";
import { useSupabaseClient, useSupabaseAuth } from "@/providers/SupabaseProvider";

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const { user, loading, signOut } = useSupabaseAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleMode = () => {
    setMode((prev) => (prev === "signin" ? "signup" : "signin"));
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message);
        } else {
          setMessage("¡Bienvenido! Ya puedes cerrar esta pantalla.");
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setMessage("Revisa tu bandeja para confirmar la cuenta y luego inicia sesión.");
        }
      }
    } catch {
      setError("Ocurrió un error inesperado. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-brand-black px-4 text-brand-white">
      <div className="w-full max-w-md rounded-3xl border border-brand-orange/30 bg-brand-black/80 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-brand-orange text-center mb-6">
          {mode === "signin" ? "Inicia sesión" : "Crea tu cuenta"}
        </h1>
        {loading ? (
          <p className="text-center text-sm text-gray-300">Verificando sesión...</p>
        ) : user ? (
          <div className="space-y-6 text-center">
            <p className="text-lg">
              Ya iniciaste sesión como{" "}
              <span className="font-semibold text-brand-orange">{user.email}</span>.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/competencia"
                className="rounded-full bg-brand-orange px-6 py-3 font-semibold text-brand-black transition hover:bg-orange-400"
              >
                Ir al leaderboard
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-brand-orange px-6 py-3 font-semibold text-brand-white transition hover:bg-brand-orange/20"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-gray-200">
              Correo electrónico
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-full border border-brand-orange/40 bg-transparent px-4 py-3 text-base text-brand-white outline-none transition focus:border-brand-orange"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-200">
              Contraseña
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-full border border-brand-orange/40 bg-transparent px-4 py-3 text-base text-brand-white outline-none transition focus:border-brand-orange"
              />
            </label>
            {error && <p className="rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-300">{error}</p>}
            {message && (
              <p className="rounded-md bg-brand-orange/10 px-3 py-2 text-sm text-brand-orange">{message}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-base font-semibold text-brand-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting
                ? "Procesando..."
                : mode === "signin"
                ? "Entrar"
                : "Crear cuenta"}
            </button>
            <button
              type="button"
              onClick={toggleMode}
              className="w-full rounded-full border border-brand-orange px-6 py-3 text-sm font-semibold text-brand-white transition hover:bg-brand-orange/20"
            >
              {mode === "signin"
                ? "¿No tienes cuenta? Regístrate"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
