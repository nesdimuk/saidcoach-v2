import type { SetEntry } from "./engine";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const kg = (n: number) => `${String(n).replace(".", ",")} kg`;

export interface ReportInput {
  studentName: string;
  exerciseName: string;
  date: Date;
  sets: SetEntry[];
  /** Próxima carga recomendada; null si no hay. */
  nextLoad: number | null;
  stopped: boolean;
  alertCoach?: string;
}

/** Informe en texto plano para mandar al entrenador (WhatsApp). */
export function buildReport(r: ReportInput): string {
  const d = r.date;
  const lines = [
    `${r.exerciseName} — ${r.studentName}`,
    `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`,
    "",
    ...r.sets.map((s) => {
      const flags = [s.pain ? "dolor" : "", s.techniqueBroken ? "técnica rota" : ""].filter(Boolean);
      const rir = s.rirReported === 6 ? "5+" : s.rirReported;
      return `Serie ${s.setIndex}: ${kg(s.load)} × ${s.reps} reps · RIR ${rir}${flags.length ? ` (${flags.join(", ")})` : ""}`;
    }),
  ];

  const pain = r.sets.some((s) => s.pain);
  const broken = r.sets.filter((s) => s.techniqueBroken).map((s) => s.setIndex);
  const notes: string[] = [];
  if (pain) notes.push("⚠️ Dolor reportado, paré el ejercicio.");
  if (broken.length) notes.push(`Técnica rota en ${broken.length > 1 ? "las series" : "la serie"} ${broken.join(", ")}.`);
  if (r.alertCoach && !pain) notes.push(`⚠️ ${r.alertCoach}.`);
  if (notes.length) lines.push("", ...notes);

  if (r.nextLoad != null && !r.stopped) lines.push("", `Próxima sesión: ${kg(r.nextLoad)}`);
  return lines.join("\n");
}

/** Solo dígitos; entre 8 y 15 (formato internacional sin +). null si no sirve. */
export function cleanPhone(raw: string | undefined): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

export function whatsappUrl(text: string, phone?: string | null): string {
  return `https://wa.me/${phone ?? ""}?text=${encodeURIComponent(text)}`;
}
