import { describe, expect, it } from "vitest";
import type { SetEntry } from "../engine";
import { buildReport, cleanPhone, whatsappUrl } from "../report";

const s = (i: number, load: number, reps: number, rir: SetEntry["rirReported"], x: Partial<SetEntry> = {}): SetEntry => ({
  setIndex: i, load, reps, rirReported: rir, pain: false, techniqueBroken: false, ...x,
});
const base = { studentName: "Marcelo", exerciseName: "Sentadilla goblet", date: new Date(2026, 10, 1), stopped: false };

describe("informe al entrenador", () => {
  it("lista cada serie con peso, reps y RIR, y la próxima carga", () => {
    const t = buildReport({ ...base, sets: [s(1, 10, 10, 6), s(2, 12.5, 9, 2)], nextLoad: 12.5 });
    expect(t).toBe(
      [
        "Sentadilla goblet — Marcelo",
        "1 nov 2026",
        "",
        "Serie 1: 10 kg × 10 reps · RIR 5+",
        "Serie 2: 12,5 kg × 9 reps · RIR 2",
        "",
        "Próxima sesión: 12,5 kg",
      ].join("\n"),
    );
  });

  it("avisa dolor y no recomienda próxima carga", () => {
    const t = buildReport({ ...base, sets: [s(1, 10, 8, 2, { pain: true })], nextLoad: null, stopped: true, alertCoach: "Dolor reportado" });
    expect(t).toContain("Serie 1: 10 kg × 8 reps · RIR 2 (dolor)");
    expect(t).toContain("⚠️ Dolor reportado, paré el ejercicio.");
    expect(t).not.toContain("Próxima sesión");
    expect(t.match(/Dolor reportado/g)).toHaveLength(1);
  });

  it("marca técnica rota", () => {
    const t = buildReport({ ...base, sets: [s(1, 10, 8, 2), s(2, 10, 6, 0, { techniqueBroken: true })], nextLoad: 9 });
    expect(t).toContain("(técnica rota)");
    expect(t).toContain("Técnica rota en la serie 2.");
  });
});

describe("whatsapp", () => {
  it("limpia el teléfono", () => {
    expect(cleanPhone("+56 9 1234 5678")).toBe("56912345678");
    expect(cleanPhone("123")).toBeNull();
    expect(cleanPhone(undefined)).toBeNull();
  });
  it("arma el link con o sin número", () => {
    expect(whatsappUrl("hola mundo", "56912345678")).toBe("https://wa.me/56912345678?text=hola%20mundo");
    expect(whatsappUrl("a\nb")).toBe("https://wa.me/?text=a%0Ab");
  });
});
