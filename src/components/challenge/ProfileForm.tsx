"use client";

import { useState } from "react";
import type { ProfileRow } from "@/lib/challenge/types";
import { useSupabaseClient } from "@/providers/SupabaseProvider";

type Props = {
  userId: string;
  initialProfile: ProfileRow | null;
};

export default function ProfileForm({ userId, initialProfile }: Props) {
  const supabase = useSupabaseClient();
  const rawPreferences = Array.isArray(initialProfile?.food_preferences)
    ? (initialProfile?.food_preferences as string[])
    : typeof initialProfile?.food_preferences === "string"
    ? [initialProfile.food_preferences]
    : [];

  const [form, setForm] = useState({
    name: initialProfile?.name ?? "",
    age: initialProfile?.age?.toString() ?? "",
    sex: initialProfile?.sex ?? "",
    height_cm: initialProfile?.height_cm?.toString() ?? "",
    weight_kg: initialProfile?.weight_kg?.toString() ?? "",
    activity_level: initialProfile?.activity_level ?? "",
    goal: initialProfile?.goal ?? "",
    food_preferences: rawPreferences.join(", "),
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const payload = {
        id: userId,
        name: form.name || null,
        age: form.age ? Number(form.age) : null,
        sex: form.sex || null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        activity_level: form.activity_level || null,
        goal: form.goal || null,
        food_preferences: form.food_preferences
          ? form.food_preferences
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : null,
      };

      const { error } = await supabase.from("profiles").upsert(payload, {
        onConflict: "id",
      });

      if (error) {
        throw error;
      }

      setStatus({ type: "success", message: "Perfil actualizado." });
    } catch (submitError) {
      const message =
        submitError && typeof submitError === "object" && "message" in submitError
          ? String((submitError as Error).message)
          : "No se pudo guardar.";
      setStatus({ type: "error", message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">
          Nombre
          <input
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
          />
        </label>
        <label className="text-sm font-medium">
          Edad
          <input
            type="number"
            value={form.age}
            onChange={handleChange("age")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
          />
        </label>
        <label className="text-sm font-medium">
          Sexo
          <select
            value={form.sex}
            onChange={handleChange("sex")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
          >
            <option value="">Selecciona</option>
            <option value="female">Femenino</option>
            <option value="male">Masculino</option>
            <option value="other">Otro</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Estatura (cm)
          <input
            type="number"
            value={form.height_cm}
            onChange={handleChange("height_cm")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
          />
        </label>
        <label className="text-sm font-medium">
          Peso (kg)
          <input
            type="number"
            value={form.weight_kg}
            onChange={handleChange("weight_kg")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
          />
        </label>
        <label className="text-sm font-medium">
          Nivel de actividad
          <input
            type="text"
            value={form.activity_level}
            onChange={handleChange("activity_level")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
          />
        </label>
      </div>
      <label className="text-sm font-medium">
        Objetivo
        <input
          type="text"
          value={form.goal}
          onChange={handleChange("goal")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
        />
      </label>
      <label className="text-sm font-medium">
        Preferencias alimentarias (separadas por coma)
        <textarea
          value={form.food_preferences}
          onChange={handleChange("food_preferences")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
          rows={3}
        />
      </label>
      {status && (
        <p className={`text-sm ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {status.message}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-md bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
