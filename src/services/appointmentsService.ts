/**
 * Real Supabase-backed unified appointments -- `appointments` table
 * (mommind-backend migration 20260812000009), used by both the Planner
 * (docs/ARCHITECTURE.md §14.5) and Find Care's "Request Appointment" action.
 * category drives Planner grouping; a household member can read/write their
 * own household's rows via RLS.
 */
import { supabase } from "./supabaseClient";

export type AppointmentCategory = "medical" | "marketplace_booking" | "personal" | "development" | "family_task";

export interface Appointment {
  id: string;
  category: AppointmentCategory;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  notes: string | null;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  healthcare_provider_id: string | null;
}

export async function listUpcomingAppointments(householdId: string): Promise<Appointment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("appointments")
    .select("id,category,title,scheduled_at,duration_minutes,location,notes,status,healthcare_provider_id")
    .eq("household_id", householdId)
    .eq("status", "scheduled")
    .order("scheduled_at");
  if (error) {
    console.error("Failed to load appointments:", error.message);
    return [];
  }
  return data ?? [];
}

export interface NewAppointment {
  household_id: string;
  created_by: string;
  category: AppointmentCategory;
  title: string;
  scheduled_at: string;
  duration_minutes?: number;
  location?: string | null;
  notes?: string | null;
  healthcare_provider_id?: string | null;
}

export async function requestAppointment(input: NewAppointment): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Backend not configured." };
  const { error } = await supabase.from("appointments").insert(input);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function cancelAppointment(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
  if (error) { console.error("Failed to cancel appointment:", error.message); return false; }
  return true;
}
