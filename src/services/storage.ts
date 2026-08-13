/**
 * Local persistence shim.
 *
 * This is a stand-in for the real backend's data layer (see
 * docs/ARCHITECTURE.md → Shared Data Layer). Every service in this folder
 * reads/writes through these two functions instead of touching
 * `localStorage` directly, so swapping in real `fetch` calls against a
 * production API later only requires editing the service files, not any
 * component.
 */

const NAMESPACE = "mombestie:v1";

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(`${NAMESPACE}:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    // Corrupt value or storage unavailable (private browsing, quota) — degrade to fallback.
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${NAMESPACE}:${key}`, JSON.stringify(value));
  } catch {
    // Fail silently — in-memory state still works for the current session.
  }
}
