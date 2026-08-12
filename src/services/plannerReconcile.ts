import type { TrackingLog, TrackingLogType } from "./types";

/**
 * Matches Planner slots (a schedule of expected events) against real
 * TrackingLogs (what actually happened), by category and nearest time —
 * so "done" on the Planner reflects genuinely logged data instead of a
 * separate, disconnected completion checkbox. Only categories the Tracking
 * Service actually models are reconciled; Activity/Appointment/Routine (and
 * any `predicted` slot) stay local-only toggles, same "don't fake it" reason
 * as the Quick Log sheet's unsupported categories — see docs/ARCHITECTURE.md §6.
 */
export const PLANNER_CATEGORY_TO_LOG_TYPE: Partial<Record<string, TrackingLogType>> = {
  Feeding: "Feed",
  Meal: "Meal",
  Sleep: "Sleep",
}

export interface PlannerItem {
  time: string
  label: string
  cat: string
  predicted?: boolean
}

function parseTimeToMinutes(time: string): number {
  const m = time.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return 0
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const isPM = m[3].toUpperCase() === "PM"
  if (isPM && h !== 12) h += 12
  if (!isPM && h === 12) h = 0
  return h * 60 + min
}

/** Maps each reconcilable, non-predicted planner slot index to the closest matching log within 90 minutes, one log claimed per slot. */
export function reconcilePlanner(items: PlannerItem[], logs: TrackingLog[]): Map<number, TrackingLog> {
  const claimed = new Map<number, TrackingLog>()
  const usedLogIds = new Set<string>()

  items.forEach((item, idx) => {
    if (item.predicted) return
    const type = PLANNER_CATEGORY_TO_LOG_TYPE[item.cat]
    if (!type) return
    const itemMinutes = parseTimeToMinutes(item.time)

    let best: TrackingLog | null = null
    let bestDiff = Infinity
    for (const log of logs) {
      if (log.type !== type || usedLogIds.has(log.id)) continue
      const d = new Date(log.at)
      const diff = Math.abs(d.getHours() * 60 + d.getMinutes() - itemMinutes)
      if (diff < bestDiff) { bestDiff = diff; best = log }
    }
    if (best && bestDiff <= 90) {
      claimed.set(idx, best)
      usedLogIds.add(best.id)
    }
  })

  return claimed
}
