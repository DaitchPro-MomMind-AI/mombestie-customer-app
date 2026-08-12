import type { TrackingLog } from "./types";

export interface TimelineItem {
  time: string;
  label: string;
  icon: string;
  color: string;
  done?: boolean;
  predicted?: boolean;
}

/**
 * Placeholder future events. Nap timing would come from the BabyPredict
 * service and the appointment from the Planner/calendar service — neither
 * exists yet in this sandbox, so these stay as clearly-labeled static
 * entries rather than being presented as live predictions or real backend data.
 */
const UPCOMING_PLACEHOLDER: TimelineItem[] = [
  { time: "9:45 AM", label: "Predicted Nap", icon: "🌙", color: "#B0A0F0", predicted: true },
  { time: "2:00 PM", label: "Pediatric appointment", icon: "🏥", color: "#6299D5", done: false },
];

function logToTimelineItem(log: TrackingLog): TimelineItem {
  const time = new Date(log.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  switch (log.type) {
    case "Feed":
      return {
        time,
        label: `${log.feed?.method ?? "Bottle"} — ${log.feed?.amountOz ?? 0} oz`,
        icon: "🍼",
        color: "#6299D5",
        done: true,
      };
    case "Sleep":
      return {
        time,
        label: `Slept ${Math.round((log.sleep?.durationSec ?? 0) / 60)} min`,
        icon: "🌙",
        color: "#B0A0F0",
        done: true,
      };
    case "Diaper":
      return { time, label: `${log.diaper?.kind ?? "Wet"} diaper`, icon: "🧷", color: "#F47B66", done: true };
    case "Meal":
      return {
        time,
        label: log.meal?.foods?.length ? log.meal.foods.join(", ") : "Meal logged",
        icon: "🥣",
        color: "#55A67A",
        done: true,
      };
    case "Growth":
      return { time, label: "Growth measurement logged", icon: "📏", color: "#F8C85E", done: true };
  }
}

/** Merges today's real tracking logs with the static upcoming placeholders, oldest first. */
export function buildTimeline(logs: TrackingLog[]): TimelineItem[] {
  const real = logs
    .slice()
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .map(logToTimelineItem);
  return [...real, ...UPCOMING_PLACEHOLDER];
}
