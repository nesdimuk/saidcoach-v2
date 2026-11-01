import { describe, expect, it } from "vitest";
import {
  decideNext,
  expandScheme,
  initialBias,
  plateBreakdown,
  shouldOfferCalibration,
  startingLoad,
  updateBias,
  calibrationConfidence,
  type LoadScheme,
  type Prescription,
  type RirReported,
  type SetEntry,
} from "../index";

const halves = expandScheme({ kind: "pasos", min: 2, max: 30, step: 0.5 });
const dumbbells = expandScheme({ kind: "pasos", min: 4, max: 24, step: 2 });

const goblet: Prescription = {
  exerciseId: "goblet",
  exerciseName: "Sentadilla goblet",
  type: "compuesto_libre",
  rirTarget: 2,
  repMin: 8,
  repMax: 12,
  sets: 3,
  restSec: 90,
  scheme: { kind: "pasos", min: 4, max: 24, step: 2 },
  allowCalibration: false,
};

const set = (
  setIndex: number,
  load: number,
  reps: number,
  rir: RirReported,
  extra: Partial<SetEntry> = {},
): SetEntry => ({
  setIndex,
  load,
  reps,
  rirReported: rir,
  pain: false,
  techniqueBroken: false,
  ...extra,
});

const run = (
  sets: SetEntry[],
  o: { loads?: number[]; bias?: number; p?: Partial<Prescription>; ladder?: Parameters<typeof decideNext>[0]["ladder"] } = {},
) =>
  decideNext({
    prescription: { ...goblet, ...o.p },
    loads: o.loads ?? halves,
    bias: o.bias ?? 0,
    sets,
    ladder: o.ladder,
  });

describe("tests mínimos del motor (sección 10)", () => {
  it("1. 10 kg × 10, RIR 2, objetivo RIR 2 → mantener 10 kg", () => {
    const d = run([set(1, 10, 10, 2)]);
    expect(d.nextLoad).toBe(10);
    expect(d.color).toBe("mantener");
  });

  it("2. 10 kg × 10, RIR 5+ → sube, máx +15% en serie 1, redondeo abajo", () => {
    const d = run([set(1, 10, 10, 6)]);
    expect(d.color).toBe("subir");
    expect(d.nextLoad).toBe(10.5); // raw 10,95 → baja al 0,5 disponible
    expect(d.nextLoad!).toBeLessThanOrEqual(11.5);

    // con mancuernas de 2 en 2 el redondeo hacia abajo deja 10 kg (nunca 12)
    expect(run([set(1, 10, 10, 6)], { loads: dumbbells }).nextLoad).toBe(10);
  });

  it("3. 10 kg × 10, RIR 0 → baja", () => {
    const d = run([set(1, 10, 10, 0)]);
    expect(d.color).toBe("bajar");
    expect(d.nextLoad).toBeLessThan(10);
  });

  it("4. dolor → detener + alerta", () => {
    const d = run([set(1, 10, 10, 2, { pain: true })]);
    expect(d.action).toBe("detener");
    expect(d.nextLoad).toBeNull();
    expect(d.alertCoach).toBeTruthy();
    expect(d.message).toBe("Paramos acá. Avísale a tu entrenador.");
  });

  it("5. técnica rota → serie inválida, 1 escalón abajo", () => {
    const d = run([set(1, 10, 10, 2, { techniqueBroken: true })]);
    expect(d.setValid).toBe(false);
    expect(d.nextLoad).toBe(9.5);
    expect(d.rule).toBe("tecnica");
  });

  it("6. reps < repMin → siguiente ≤ 1 escalón abajo (aunque la estimación diga subir)", () => {
    const d = run([set(1, 10, 6, 3)]);
    expect(d.nextLoad!).toBeLessThanOrEqual(9.5);
    expect(d.color).toBe("bajar");

    const forced = run([set(1, 10, 7, 6)]); // estimación ≈ 10,2 pero reps bajo el mínimo
    expect(forced.nextLoad).toBe(9.5);
    expect(forced.rule).toBe("reps_minimas");
  });

  it("7. serie 3, objetivo RIR 2, reporta 1 → mantener (histéresis)", () => {
    const d = run([set(1, 10, 10, 2), set(2, 10, 10, 2), set(3, 10, 10, 1)]);
    expect(d.rule).toBe("histeresis");
    expect(d.nextLoad).toBe(10);
  });

  it("8. serie 3, objetivo RIR 2, reporta 4 → recalcula hacia arriba", () => {
    const d = run([set(1, 10, 10, 2), set(2, 10, 10, 2), set(3, 10, 12, 4)]);
    expect(d.rule).toBe("recalculo");
    expect(d.nextLoad!).toBeGreaterThan(10);
  });

  it("9. carga = máx(loads) y RIR 5+ → escalera de intensificación nivel 1", () => {
    const d = run([set(1, 24, 10, 6)], { loads: dumbbells });
    expect(d.color).toBe("tecnica");
    expect(d.ladder).toEqual({ kind: "up", level: 1 });
    expect(d.ladderText).toBe("Sube hasta 15 reps.");
    expect(d.nextLoad).toBe(24);
  });

  it("10. carga = mín(loads) y RIR 0 → escalera inversa nivel 1", () => {
    const d = run([set(1, 4, 10, 0)], { loads: dumbbells });
    expect(d.ladder).toEqual({ kind: "down", level: 1 });
    expect(d.ladderText).toBe("Baja a 6 reps.");
  });

  it("11. mismo peso tras redondeo y RIR > objetivo+1 dos veces → sube 1 escalón", () => {
    const one = run([set(1, 10, 10, 4)], { loads: dumbbells });
    expect(one.nextLoad).toBe(10); // una vez no basta

    const two = run([set(1, 10, 10, 4), set(2, 10, 10, 4)], { loads: dumbbells });
    expect(two.nextLoad).toBe(12);
    expect(two.rule).toBe("anti_estancamiento");
  });

  it("12. bias +2 y reporta RIR 1 → se calcula con rirCorr 3", () => {
    const d = run([set(1, 10, 10, 1)], { bias: 2 });
    expect(d.rirCorr).toBe(3);
    expect(d.nextLoad).toBe(10);
    expect(run([set(1, 10, 10, 1)], { bias: 0 }).nextLoad).toBe(9.5); // sin sesgo, baja
  });

  it("13. test de calibración no se ofrece en compuesto_libre", () => {
    const base = {
      isLastSet: true,
      firstSessionAt: new Date("2026-09-01"),
      lastCalibrationAt: null,
      now: new Date("2026-11-01"),
    };
    const machine = { ...goblet, type: "maquina" as const, allowCalibration: true };
    expect(shouldOfferCalibration({ ...base, prescription: { ...machine, type: "compuesto_libre" } })).toBe(false);
    expect(shouldOfferCalibration({ ...base, prescription: machine })).toBe(true);
    // reglas de tiempo y de serie
    expect(shouldOfferCalibration({ ...base, prescription: machine, isLastSet: false })).toBe(false);
    expect(
      shouldOfferCalibration({ ...base, prescription: machine, lastCalibrationAt: new Date("2026-10-25") }),
    ).toBe(false);
    expect(
      shouldOfferCalibration({ ...base, prescription: machine, firstSessionAt: new Date("2026-10-25") }),
    ).toBe(false);
  });

  it("14. 15 días sin entrenar → carga inicial −7,5%", () => {
    const r = startingLoad({ prescription: goblet, loads: halves, lastValidLoad: 20, daysSinceLast: 15 });
    expect(r).toEqual({ kind: "carga", load: 18.5, reducedBy: 0.075 });
    expect(startingLoad({ prescription: goblet, loads: halves, lastValidLoad: 20, daysSinceLast: 25 })).toMatchObject({ load: 17 });
    expect(startingLoad({ prescription: goblet, loads: halves, lastValidLoad: 20, daysSinceLast: 5 })).toMatchObject({ load: 20 });
    expect(startingLoad({ prescription: goblet, loads: halves })).toEqual({ kind: "preguntar" });
    expect(startingLoad({ prescription: { ...goblet, startLoad: 8 }, loads: halves })).toMatchObject({ load: 8 });
  });

  it("15. calibración: predicho 12, real 16, bias 0 → bias 2", () => {
    expect(updateBias(0, 12, 16)).toBe(2);
    expect(updateBias(5, 5, 30)).toBe(5); // tope +5
    expect(updateBias(-2, 10, 0)).toBe(-2); // piso −2
    expect(calibrationConfidence(12, 16)).toBe("baja");
    expect(calibrationConfidence(12, 14)).toBe("media");
    expect(calibrationConfidence(12, 13)).toBe("alta");
  });
});

describe("esquemas de carga por equipo", () => {
  it("pasos: mancuernas 4-24 de 2 en 2", () => {
    expect(dumbbells).toEqual([4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]);
  });

  it("tramos: 2,5 kg hasta 20 y luego 5 kg", () => {
    const l = expandScheme({
      kind: "tramos",
      tramos: [
        { from: 5, to: 20, step: 2.5 },
        { from: 25, to: 40, step: 5 },
      ],
    });
    expect(l).toEqual([5, 7.5, 10, 12.5, 15, 17.5, 20, 25, 30, 35, 40]);
  });

  it("lista: ordena, quita duplicados y descarta cargas inexistentes", () => {
    const s: LoadScheme = { kind: "lista", loads: [10, 5, 5, 15] };
    expect(expandScheme(s)).toEqual([5, 10, 15]);
    expect(expandScheme(s, [10])).toEqual([5, 15]);
  });

  it("discos: barra 20 + discos por lado; sin discos de 1,25 no existe 51,25", () => {
    const scheme: Extract<LoadScheme, { kind: "discos" }> = {
      kind: "discos",
      barra: 20,
      discos: [
        { peso: 5, cantidad: 2 },
        { peso: 10, cantidad: 2 },
      ],
    };
    const l = expandScheme(scheme);
    expect(l[0]).toBe(20);
    expect(l).toContain(50); // 20 + 2×15
    expect(l).toContain(60); // 20 + 2×20
    expect(l[l.length - 1]).toBe(80); // 20 + 2×30
    expect(l).not.toContain(25);
    expect(plateBreakdown(scheme, 50)).toEqual({ barra: 20, porLado: [10, 5] });
    expect(plateBreakdown(scheme, 25)).toBeNull();
  });

  it("escalón mayor que el tope: una serie con rtf > 20 igual sube 1 escalón en máquina de 5 kg", () => {
    const stack = expandScheme({ kind: "pasos", min: 5, max: 100, step: 5 });
    const d = run([set(1, 20, 15, 6)], { loads: stack });
    expect(d.rule).toBe("salto_maximo");
    expect(d.nextLoad).toBe(25);
  });

  it("alumno marca una carga como inexistente: el motor la salta", () => {
    const loads = expandScheme({ kind: "pasos", min: 5, max: 100, step: 5 }, [25]);
    expect(loads).not.toContain(25);
    expect(run([set(1, 20, 15, 6)], { loads }).nextLoad).toBe(30);
  });
});

describe("escaleras", () => {
  it("subida: RIR alto sube de nivel, dentro de ventana se queda, RIR bajo baja y sale", () => {
    const sets = [set(2, 24, 15, 6)];
    const lvl2 = run(sets, { loads: dumbbells, ladder: { kind: "up", level: 1 } });
    expect(lvl2.ladder).toEqual({ kind: "up", level: 2 });
    expect(lvl2.ladderText).toBe("Baja en 3-4 segundos cada rep.");

    const stay = run([set(2, 24, 12, 2)], { loads: dumbbells, ladder: { kind: "up", level: 2 } });
    expect(stay.ladder).toEqual({ kind: "up", level: 2 });

    const exit = run([set(2, 24, 8, 0)], { loads: dumbbells, ladder: { kind: "up", level: 1 } });
    expect(exit.ladder).toBeNull();
    expect(exit.nextLoad).toBe(24);
  });

  it("llegar al último peldaño avisa al entrenador (omite unilateral si no aplica)", () => {
    const d = run([set(2, 24, 15, 6)], {
      loads: dumbbells,
      p: { unilateral: false, harderVariant: "Sentadilla búlgara" },
      ladder: { kind: "up", level: 5 }, // 6 peldaños sin unilateral → el 6º es la variante
    });
    expect(d.ladderText).toBe("Cambia a: Sentadilla búlgara.");
    expect(d.alertCoach).toBe("Necesita más carga o progresión");
  });

  it("inversa: si sigue muy difícil, termina deteniendo y avisando", () => {
    const d = run([set(3, 4, 5, 0)], { loads: dumbbells, ladder: { kind: "down", level: 3 } });
    expect(d.action).toBe("detener");
    expect(d.alertCoach).toBeTruthy();
  });

  it("dolor detiene aunque haya escalera activa", () => {
    const d = run([set(2, 24, 10, 2, { pain: true })], { loads: dumbbells, ladder: { kind: "up", level: 2 } });
    expect(d.action).toBe("detener");
  });
});

describe("sesgo inicial", () => {
  it("principiante +1, intermedio 0, el entrenador manda", () => {
    expect(initialBias({ id: "a", name: "A", level: "principiante" })).toBe(1);
    expect(initialBias({ id: "a", name: "A", level: "intermedio" })).toBe(0);
    expect(initialBias({ id: "a", name: "A", level: "principiante", initialBias: 0 })).toBe(0);
  });
});
