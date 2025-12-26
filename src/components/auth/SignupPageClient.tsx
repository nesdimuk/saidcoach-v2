"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseClient } from "@/providers/SupabaseProvider";

export default function SignupPageClient() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companySlug = searchParams?.get("company") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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
    setMessage(null);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        await handleJoinCompany();
        if (companySlug) {
          router.push(`/company/${companySlug}`);
          return;
        }
        router.push("/dashboard");
        return;
      }

      setMessage("Revisa tu correo para confirmar la cuenta.");
    } catch {
      setError("No se pudo crear la cuenta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-white px-4 py-16 text-black">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-black/10 bg-white p-10 shadow-lg">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Reto corporativo</p>
          <h1 className="text-3xl font-semibold">Crea tu cuenta</h1>
        </div>
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
          {message && <p className="text-sm text-green-600">{message}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
        <p className="text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            href={companySlug ? `/login?company=${companySlug}` : "/login"}
            className="font-semibold underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  );
}
