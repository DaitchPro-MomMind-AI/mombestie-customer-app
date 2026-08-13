/**
 * Real Supabase-backed insurance info — `insurance_info` table
 * (mombestie-backend migration 20260812000009), owner-only RLS (stricter than
 * every other household table). See docs/ARCHITECTURE.md §14.2/§14.37: this
 * is metadata the parent self-reports for provider-search filtering, never a
 * guarantee of coverage -- the required disclaimer lives with the UI, not
 * here.
 */
import { supabase } from "./supabaseClient";

export interface InsuranceInfo {
  insurer_name: string;
  plan_name: string | null;
  network_name: string | null;
  member_id: string | null;
  country: string;
}

export async function getInsuranceInfo(householdId: string): Promise<InsuranceInfo | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("insurance_info")
    .select("insurer_name,plan_name,network_name,member_id,country")
    .eq("household_id", householdId)
    .maybeSingle();
  if (error) {
    console.error("Failed to load insurance info:", error.message);
    return null;
  }
  return data as InsuranceInfo | null;
}

export async function saveInsuranceInfo(householdId: string, info: InsuranceInfo): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("insurance_info")
    .upsert({ household_id: householdId, ...info }, { onConflict: "household_id" });
  if (error) {
    console.error("Failed to save insurance info:", error.message);
    return false;
  }
  return true;
}

export async function deleteInsuranceInfo(householdId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("insurance_info").delete().eq("household_id", householdId);
  if (error) {
    console.error("Failed to delete insurance info:", error.message);
    return false;
  }
  return true;
}
