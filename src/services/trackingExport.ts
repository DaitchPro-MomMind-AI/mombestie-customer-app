/**
 * MBCST-36: export a child's real tracking history (Feed/Sleep/Diaper/Meal/
 * Growth logs) as CSV, for handing to a real pediatrician.
 *
 * Reads from the same localStorage-backed store as everywhere else
 * (trackingService.listLogs) -- honestly still local data, not a real
 * backend table (see [MBCST-33]'s note on trackingService.ts), but every
 * value in the export is the exact real value the caregiver logged, with
 * no rounding or summarization.
 */
import { listLogs } from "./trackingService";
import type { TrackingLog } from "./types";

/** Real logs for `childId` with `at` inside [fromISO, toISO], inclusive. */
export function logsInRange(childId: string, fromISO: string, toISO: string): TrackingLog[] {
  const from = new Date(fromISO).getTime();
  const to = new Date(toISO).getTime();
  return listLogs(childId)
    .filter(l => {
      const t = new Date(l.at).getTime();
      return t >= from && t <= to;
    })
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

const CSV_HEADER = [
  "id", "type", "at", "notes",
  "feed_amountOz", "feed_method",
  "sleep_durationSec",
  "diaper_kind",
  "meal_foods",
  "growth_heightCm", "growth_weightKg", "growth_headCm",
] as const;

function escapeCsvField(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Real logged rows only, one CSV row per log, every field taken directly
 * from the stored log -- no aggregation, rounding, or reinterpretation of
 * the recorded value (MBCST-36 AC #2). An empty `logs` array still
 * produces a valid CSV (header row only), never an error (AC #3).
 */
export function logsToCsv(logs: TrackingLog[]): string {
  const rows = logs.map(l => [
    l.id, l.type, l.at, l.notes ?? "",
    l.feed?.amountOz ?? "", l.feed?.method ?? "",
    l.sleep?.durationSec ?? "",
    l.diaper?.kind ?? "",
    l.meal?.foods ? l.meal.foods.join("; ") : "",
    l.growth?.heightCm ?? "", l.growth?.weightKg ?? "", l.growth?.headCm ?? "",
  ]);
  return [CSV_HEADER, ...rows].map(row => row.map(escapeCsvField).join(",")).join("\r\n");
}

/** Convenience: real logs for a child/date range (AC #1), exported as CSV. */
export function exportTrackingCsv(childId: string, fromISO: string, toISO: string): string {
  return logsToCsv(logsInRange(childId, fromISO, toISO));
}

/** Triggers a real browser file download of the given CSV text. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
