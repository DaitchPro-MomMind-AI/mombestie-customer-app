// Domain types shared by the mock services. These mirror the shape the
// real Tracking Service API is expected to return (see
// docs/ARCHITECTURE.md), so the frontend contract doesn't change when a
// real backend replaces the localStorage-backed implementation.

export type TrackingLogType = "Feed" | "Sleep" | "Diaper" | "Meal" | "Growth";

export interface TrackingLog {
  id: string;
  childId: string;
  type: TrackingLogType;
  /** ISO 8601 timestamp of when the event happened. */
  at: string;
  notes?: string;
  feed?: { amountOz: number; method: "Bottle" | "Breast" | "Formula" };
  sleep?: { durationSec: number };
  diaper?: { kind: "Wet" | "Dirty" | "Mixed" };
  meal?: { foods: string[] };
  growth?: { heightCm?: number; weightKg?: number; headCm?: number };
}

export type NewTrackingLog = Omit<TrackingLog, "id" | "at"> & { at?: string };

export interface DailySummary {
  sleepMinutes: number;
  milkOz: number;
  meals: number;
  diapers: number;
}
