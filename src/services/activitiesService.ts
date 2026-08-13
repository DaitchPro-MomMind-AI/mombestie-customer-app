/**
 * Real Supabase-backed Fun & Development activity library — reads the
 * `activities` table added in mombestie-backend migration
 * 20260812000010_growth_and_activities.sql. Unlike the older, still-mock
 * DevelopmentScreen.tsx (hardcoded 4-item array), this is genuinely
 * data-driven per docs/ARCHITECTURE.md §14.16: the frontend never invents an
 * activity, it only ever renders rows that exist in the database and have
 * already cleared the review_status='approved' gate (enforced by RLS, not
 * just this code — see the migration).
 *
 * Favorites/history are household-scoped writes and need a real signed-in
 * user (getCurrentHouseholdId()) -- if there isn't one, callers should show
 * a "sign in to save" prompt rather than silently no-op or fake success.
 */
import { supabase, isSupabaseConfigured } from "./supabaseClient";

export interface Activity {
  id: string;
  name: string;
  description: string;
  min_age_months: number;
  max_age_months: number;
  development_areas: string[];
  setting: "indoor" | "outdoor" | "both";
  materials_required: string[];
  setup_minutes: number;
  duration_minutes: number;
  parent_effort: "low" | "medium" | "high";
  mess_level: "none" | "low" | "medium" | "high";
  supervision_level: "constant_arms_reach" | "close" | "moderate";
  choking_risk: boolean;
  water_risk: boolean;
  allergy_food_related: boolean;
  safety_warnings: string[];
  instructions: string;
}

export interface ActivityFilters {
  ageMonths?: number;
  setting?: "indoor" | "outdoor";
  noEquipment?: boolean;
  maxDurationMinutes?: number;
}

const ACTIVITY_COLUMNS =
  "id,name,description,min_age_months,max_age_months,development_areas,setting,materials_required,setup_minutes,duration_minutes,parent_effort,mess_level,supervision_level,choking_risk,water_risk,allergy_food_related,safety_warnings,instructions";

/** null means "can't tell" (Supabase not configured) -- callers should show a config-missing state, not an empty-results state; those mean different things. */
export async function listApprovedActivities(filters: ActivityFilters = {}): Promise<Activity[] | null> {
  if (!supabase) return null;
  let query = supabase.from("activities").select(ACTIVITY_COLUMNS).eq("review_status", "approved");
  if (filters.ageMonths != null) {
    query = query.lte("min_age_months", filters.ageMonths).gte("max_age_months", filters.ageMonths);
  }
  if (filters.setting) query = query.in("setting", [filters.setting, "both"]);
  if (filters.maxDurationMinutes != null) query = query.lte("duration_minutes", filters.maxDurationMinutes);
  const { data, error } = await query.order("min_age_months");
  if (error) {
    console.error("Failed to load activities:", error.message);
    return [];
  }
  let rows = (data ?? []) as Activity[];
  if (filters.noEquipment) rows = rows.filter(a => a.materials_required.length === 0);
  return rows;
}

export async function listFavoriteIds(householdId: string): Promise<Set<string>> {
  if (!supabase) return new Set();
  const { data, error } = await supabase
    .from("activity_favorites")
    .select("activity_id")
    .eq("household_id", householdId);
  if (error) {
    console.error("Failed to load favorites:", error.message);
    return new Set();
  }
  return new Set((data ?? []).map(r => r.activity_id as string));
}

export async function toggleFavorite(householdId: string, activityId: string, isFavorite: boolean): Promise<boolean> {
  if (!supabase) return false;
  if (isFavorite) {
    const { error } = await supabase
      .from("activity_favorites")
      .delete()
      .eq("household_id", householdId)
      .eq("activity_id", activityId)
      .is("child_id", null);
    if (error) { console.error("Failed to remove favorite:", error.message); return false; }
  } else {
    const { error } = await supabase
      .from("activity_favorites")
      .insert({ household_id: householdId, activity_id: activityId, child_id: null });
    if (error) { console.error("Failed to add favorite:", error.message); return false; }
  }
  return true;
}

export async function logActivityCompletion(
  householdId: string,
  activityId: string,
  enjoymentRating: number | null,
  notes: string | null
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("activity_history").insert({
    household_id: householdId,
    activity_id: activityId,
    child_id: null,
    enjoyment_rating: enjoymentRating,
    notes,
  });
  if (error) { console.error("Failed to log activity completion:", error.message); return false; }
  return true;
}

export { isSupabaseConfigured };
