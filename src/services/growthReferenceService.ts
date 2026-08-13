/**
 * Reads whether real percentile-calculation data exists yet --
 * `growth_reference_datasets` (mombestie-backend migration 20260812000010).
 * Every row is currently `loaded=false` (the real WHO LMS statistical
 * tables haven't been imported), so this always returns false today -- the
 * point is the Growth tab asks instead of assuming, so the day someone
 * loads the real tables, percentiles appear automatically with no frontend
 * change needed.
 */
import { supabase } from "./supabaseClient";

export async function isAnyGrowthReferenceLoaded(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.from("growth_reference_datasets").select("id").eq("loaded", true).limit(1);
  if (error) {
    console.error("Failed to check growth reference datasets:", error.message);
    return false;
  }
  return (data?.length ?? 0) > 0;
}
