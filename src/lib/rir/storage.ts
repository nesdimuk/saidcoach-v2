import type { SetEntry } from "./engine";

export interface SessionRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  studentId: string;
  date: string; // ISO
  sets: (SetEntry & { valid: boolean })[];
  nextLoad: number | null;
  stopped: boolean;
  alert?: string;
}

const DB = "rir-pwa";
const memory = { sessions: [] as SessionRecord[], meta: new Map<string, unknown>() };

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore("sessions", { keyPath: "id" });
        req.result.createObjectStore("meta");
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function tx<T>(
  store: "sessions" | "meta",
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T | undefined> {
  return open().then(
    (db) =>
      new Promise((resolve) => {
        if (!db) return resolve(undefined);
        try {
          const req = fn(db.transaction(store, mode).objectStore(store));
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      }),
  );
}

export async function saveSession(rec: SessionRecord): Promise<void> {
  memory.sessions.push(rec);
  await tx("sessions", "readwrite", (s) => s.put(rec));
}

export async function allSessions(): Promise<SessionRecord[]> {
  const stored = (await tx("sessions", "readonly", (s) => s.getAll())) ?? [];
  const byId = new Map<string, SessionRecord>();
  [...memory.sessions, ...stored].forEach((r) => byId.set(r.id, r));
  return [...byId.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Última sesión (no detenida) de este ejercicio y alumno, con su carga válida. */
export async function lastValidLoad(
  exerciseId: string,
  studentId: string,
): Promise<{ load: number; date: string } | null> {
  const sessions = (await allSessions()).filter(
    (r) => r.exerciseId === exerciseId && r.studentId === studentId,
  );
  for (let i = sessions.length - 1; i >= 0; i--) {
    const r = sessions[i];
    if (r.nextLoad != null && !r.stopped) return { load: r.nextLoad, date: r.date };
  }
  return null;
}

async function getMeta<T>(key: string): Promise<T | undefined> {
  const v = (await tx("meta", "readonly", (s) => s.get(key))) as T | undefined;
  return v ?? (memory.meta.get(key) as T | undefined);
}

async function setMeta(key: string, value: unknown): Promise<void> {
  memory.meta.set(key, value);
  await tx("meta", "readwrite", (s) => s.put(value, key));
}

export const getBias = (studentId: string) => getMeta<number>(`bias:${studentId}`);
export const setBias = (studentId: string, v: number) => setMeta(`bias:${studentId}`, v);

/** Cargas que el alumno marcó como inexistentes en su equipo. */
export const getExcluded = async (exerciseId: string) =>
  (await getMeta<number[]>(`excluded:${exerciseId}`)) ?? [];
export const setExcluded = (exerciseId: string, loads: number[]) =>
  setMeta(`excluded:${exerciseId}`, loads);

/** Cargas extra que el alumno agregó porque su equipo tiene más peso que el prescrito. */
export const getExtraLoads = async (exerciseId: string) =>
  (await getMeta<number[]>(`extra:${exerciseId}`)) ?? [];
export const setExtraLoads = (exerciseId: string, loads: number[]) =>
  setMeta(`extra:${exerciseId}`, loads);
