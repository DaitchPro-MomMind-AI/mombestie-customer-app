/**
 * MOCK Tracking Service — backed by localStorage.
 *
 * Stands in for the future `/api/tracking/logs` backend endpoint group
 * (docs/ARCHITECTURE.md → Tracking Service, P0). The function signatures
 * here are written to match what a real HTTP-backed implementation would
 * expose, so callers (components / hooks) do not need to change when this
 * is swapped for real `fetch` calls.
 */
import { readJSON, writeJSON } from "./storage";
import type { DailySummary, NewTrackingLog, TrackingLog, WeeklySummary } from "./types";

const key = (childId: string) => `tracking:${childId}`;

export function listLogs(childId: string): TrackingLog[] {
  return readJSON<TrackingLog[]>(key(childId), []);
}

export function addLog(input: NewTrackingLog): TrackingLog {
  const log: TrackingLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: input.at ?? new Date().toISOString(),
    ...input,
  };
  writeJSON(key(input.childId), [log, ...listLogs(input.childId)]);
  return log;
}

export function deleteLog(childId: string, id: string): void {
  writeJSON(
    key(childId),
    listLogs(childId).filter((l) => l.id !== id),
  );
}

/**
 * MBCST-76: when a real child profile is removed (childrenService.deleteChild),
 * this clears that child's local tracking-log storage too, so removed data
 * doesn't linger reachable under a stale childId -- there's no real backend
 * table to cascade/archive yet (see [MBCST-33]), so this is the real,
 * documented policy for this store: hard-delete alongside the child row.
 */
export function clearLocalTrackingData(childId: string): void {
  writeJSON(key(childId), []);
  writeJSON(`seeded:${childId}`, false);
}

export function todaysLogs(childId: string): TrackingLog[] {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return listLogs(childId).filter((l) => new Date(l.at) >= startOfDay);
}

export function todaySummary(childId: string): DailySummary {
  const logs = todaysLogs(childId);
  return {
    sleepMinutes: Math.round(
      logs
        .filter((l) => l.type === "Sleep")
        .reduce((s, l) => s + (l.sleep?.durationSec ?? 0), 0) / 60,
    ),
    milkOz: logs
      .filter((l) => l.type === "Feed")
      .reduce((s, l) => s + (l.feed?.amountOz ?? 0), 0),
    meals: logs.filter((l) => l.type === "Meal").length,
    diapers: logs.filter((l) => l.type === "Diaper").length,
  };
}

/**
 * Real logs for a child in the last 7 days (today plus the previous 6),
 * for weekly summary aggregation (MBCST-34). Re-derives from the same
 * `listLogs` read used everywhere else, so an edit/delete is reflected the
 * next time this is called -- there's no separate cached total to go stale.
 */
export function logsInLastWeek(childId: string): TrackingLog[] {
  const weekAgo = new Date();
  weekAgo.setHours(0, 0, 0, 0);
  weekAgo.setDate(weekAgo.getDate() - 6);
  return listLogs(childId).filter((l) => new Date(l.at) >= weekAgo);
}

export function weekSummary(childId: string): WeeklySummary {
  const logs = logsInLastWeek(childId);
  const feedLogs = logs.filter((l) => l.type === "Feed");
  return {
    sleepMinutes: Math.round(
      logs
        .filter((l) => l.type === "Sleep")
        .reduce((s, l) => s + (l.sleep?.durationSec ?? 0), 0) / 60,
    ),
    milkOz: feedLogs.reduce((s, l) => s + (l.feed?.amountOz ?? 0), 0),
    feedings: feedLogs.length,
    meals: logs.filter((l) => l.type === "Meal").length,
    diapers: logs.filter((l) => l.type === "Diaper").length,
  };
}

/**
 * Seeds a demo child's history exactly once (first run only), so the
 * prototype persona doesn't start from a jarring empty state. Everything
 * seeded here is a real TrackingLog — indistinguishable from user-entered
 * data and stored the same way — not a hardcoded display fake.
 */
export function seedDemoHistoryOnce(childId: string): void {
  const seededKey = `seeded:${childId}`;
  if (readJSON(seededKey, false)) return;

  const today = new Date();
  const at = (h: number, m: number) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  addLog({ childId, type: "Feed", at: at(7, 25), feed: { amountOz: 5, method: "Bottle" } });
  addLog({ childId, type: "Meal", at: at(8, 15), meal: { foods: ["Banana", "Oatmeal"] } });

  writeJSON(seededKey, true);
}
