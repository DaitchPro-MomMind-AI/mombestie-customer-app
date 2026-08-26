import { supabase } from "./supabaseClient";

/**
 * MBCST-20: real CRUD against the real `children` table, scoped to the
 * signed-in household via RLS (matching the `bookings`/`insurance_info`
 * pattern already used elsewhere -- see bookingService.ts). This is
 * intentionally independent of BabyScreen's tracking-log tab, which still
 * uses a single hardcoded DEMO_CHILD_ID; wiring multiple real children into
 * that tracking flow is a separate, larger piece of work (MBCST-4 epic).
 */
export interface Child {
  id: string;
  household_id: string;
  name: string;
  birthdate: string; // ISO date, e.g. "2025-01-14"
  created_at: string;
}

export interface ChildResult {
  ok: boolean;
  error?: string;
  child?: Child;
}

/** Rejects impossible/future birthdates before a real insert is attempted. */
export function validateBirthdate(birthdate: string): string | null {
  if (!birthdate) return "Please enter a birthdate.";
  const d = new Date(birthdate);
  if (Number.isNaN(d.getTime())) return "That doesn't look like a valid date.";
  const now = new Date();
  if (d.getTime() > now.getTime()) return "Birthdate can't be in the future.";
  const twentyFiveYearsAgo = new Date(now);
  twentyFiveYearsAgo.setFullYear(now.getFullYear() - 25);
  if (d.getTime() < twentyFiveYearsAgo.getTime()) {
    return "That birthdate is more than 25 years ago -- please double-check it.";
  }
  return null;
}

export async function listChildren(householdId: string): Promise<Child[]> {
  if (!supabase || !householdId) return [];
  const { data, error } = await supabase
    .from("children")
    .select("id,household_id,name,birthdate,created_at")
    .eq("household_id", householdId)
    .order("birthdate", { ascending: false });
  if (error) {
    console.error("Failed to load children:", error.message);
    return [];
  }
  return data ?? [];
}

export async function addChild(householdId: string, name: string, birthdate: string): Promise<ChildResult> {
  if (!supabase) return { ok: false, error: "Backend not configured." };
  if (!householdId) return { ok: false, error: "No household found for this account yet -- please sign in again." };
  if (!name.trim()) return { ok: false, error: "Please enter a name." };
  const dateError = validateBirthdate(birthdate);
  if (dateError) return { ok: false, error: dateError };

  const { data, error } = await supabase
    .from("children")
    .insert({ household_id: householdId, name: name.trim(), birthdate })
    .select("id,household_id,name,birthdate,created_at")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, child: data };
}

export async function updateChild(id: string, patch: { name?: string; birthdate?: string }): Promise<ChildResult> {
  if (!supabase) return { ok: false, error: "Backend not configured." };
  if (patch.birthdate) {
    const dateError = validateBirthdate(patch.birthdate);
    if (dateError) return { ok: false, error: dateError };
  }
  const { data, error } = await supabase
    .from("children")
    .update(patch)
    .eq("id", id)
    .select("id,household_id,name,birthdate,created_at")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, child: data };
}

export async function deleteChild(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Backend not configured." };
  const { error } = await supabase.from("children").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
