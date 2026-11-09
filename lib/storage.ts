// Small client-side persistence helper. This app has no backend - every
// study is a pure calculation, and the only thing worth remembering across
// pages/visits (the latest design results, and the bench log) lives in the
// browser's localStorage.

export function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (private browsing, quota, etc.)
  }
}

export const STORAGE_KEYS = {
  buck: "pds.buck.v1",
  pdn: "pds.pdn.v1",
  bench: "pds.bench.v1",
} as const;
