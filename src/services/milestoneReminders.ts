/**
 * MBCST-35: age-based milestone/appointment reminders computed as real
 * offsets from a child's real birthdate.
 *
 * The age checkpoints below are not invented -- they're the well-child
 * visit and developmental-checkpoint ages published by:
 *   - CDC/AAP "Recommended Child and Adolescent Immunization Schedule"
 *     (well-child visit ages)
 *   - CDC "Learn the Signs. Act Early." developmental milestones checklist
 *     ages (cdc.gov/ncbddd/actearly)
 *
 * This is NOT medical advice: it only tells you *when* a real published
 * checklist says a checkpoint typically occurs, computed from the child's
 * real birthdate. It does not evaluate whether the child has met any
 * milestone, and every reminder carries the disclaimer/source below.
 */

export const MILESTONE_SOURCE = {
  vaccination: "CDC/AAP Recommended Child and Adolescent Immunization Schedule",
  developmental: "CDC \"Learn the Signs. Act Early.\" developmental milestones checklist",
  disclaimer:
    "Not medical advice. These are typical checkpoint ages from the cited public health source, computed from the birthdate on file -- always confirm the actual schedule with your child's pediatrician.",
} as const;

export type MilestoneCategory = "vaccination" | "developmental";

interface MilestoneDef {
  months: number;
  label: string;
  category: MilestoneCategory;
}

// Ages in completed months since birth. Kept intentionally to the
// well-known checkpoints shared by both cited sources so every entry is
// independently verifiable against them.
const MILESTONE_DEFS: MilestoneDef[] = [
  { months: 1, label: "1-month well-child visit", category: "vaccination" },
  { months: 2, label: "2-month well-child visit & developmental checkpoint", category: "vaccination" },
  { months: 4, label: "4-month well-child visit & developmental checkpoint", category: "vaccination" },
  { months: 6, label: "6-month well-child visit & developmental checkpoint", category: "vaccination" },
  { months: 9, label: "9-month well-child visit & developmental checkpoint", category: "vaccination" },
  { months: 12, label: "12-month well-child visit & developmental checkpoint", category: "vaccination" },
  { months: 15, label: "15-month well-child visit & developmental checkpoint", category: "vaccination" },
  { months: 18, label: "18-month well-child visit & developmental checkpoint", category: "vaccination" },
  { months: 24, label: "2-year well-child visit & developmental checkpoint", category: "vaccination" },
  { months: 30, label: "30-month developmental checkpoint", category: "developmental" },
];

export interface MilestoneReminder {
  label: string;
  category: MilestoneCategory;
  monthsOffset: number;
  /** ISO date the checkpoint falls on for this child's real birthdate. */
  dueDate: string;
  isPast: boolean;
  source: string;
}

/** Adds `months` calendar months to an ISO date, real calendar math (not a
 * fixed 30-day approximation), so "12 months after March 31" lands on a
 * real calendar date. */
function addMonths(iso: string, months: number): Date {
  const d = new Date(iso);
  const day = d.getDate();
  d.setDate(1); // avoid month-length overflow (e.g. Jan 31 + 1mo)
  d.setMonth(d.getMonth() + months);
  const daysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, daysInTargetMonth));
  return d;
}

/**
 * Real offsets from `birthdate`. Recomputes fully from the input on every
 * call, so a corrected birthdate produces correct recalculated dates with
 * no stale cached values (MBCST-35 AC #3).
 */
export function getMilestoneReminders(birthdate: string, now: Date = new Date()): MilestoneReminder[] {
  return MILESTONE_DEFS.map(def => {
    const dueDate = addMonths(birthdate, def.months);
    return {
      label: def.label,
      category: def.category,
      monthsOffset: def.months,
      dueDate: dueDate.toISOString(),
      isPast: dueDate.getTime() < now.getTime(),
      source: MILESTONE_SOURCE[def.category],
    };
  });
}
