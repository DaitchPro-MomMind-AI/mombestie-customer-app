import { supabase } from "./supabaseClient";
import { detectCountry } from "./countryConfig";

export interface AuthResult {
  ok: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

export async function signUp(email: string, password: string, fullName: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: "Backend not configured (missing VITE_SUPABASE_URL/ANON_KEY)." };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { ok: false, error: error.message };
  // "Confirm email" is on in the Supabase project (see docs/PROJECT_REPORT.md
  // §10 Phase 1) -- data.session is null until the user clicks the emailed
  // link, so there's no authenticated request we can make yet.
  // ensureHousehold() runs again on their first real sign-in instead.
  if (!data.session) return { ok: true, needsEmailConfirmation: true };
  await ensureHousehold();
  return { ok: true };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: "Backend not configured (missing VITE_SUPABASE_URL/ANON_KEY)." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  await ensureHousehold();
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Resolves the signed-in user's household id, or null if there's no real
 * Supabase session (not configured, or genuinely signed out). Used by the
 * newer feature services (activitiesService, insuranceService) that need a
 * real household to scope writes to -- they degrade to a "sign in to use
 * this" state rather than silently falling back to localStorage, since
 * pretending a save succeeded when nothing was actually persisted is exactly
 * the class of bug this project has been fixing all session.
 */
export async function getCurrentHouseholdId(): Promise<string | null> {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data } = await supabase
    .from("households")
    .select("id")
    .eq("primary_user_id", userData.user.id)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Creates the signed-in user's household row if they don't have one yet.
 * Idempotent (checks first) -- safe to call on every sign-in, not just the
 * first one, so a user who never got past email confirmation on signup
 * still gets a household the moment they successfully sign in for real.
 */
async function ensureHousehold(): Promise<void> {
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;

  const { data: existing } = await supabase
    .from("households")
    .select("id")
    .eq("primary_user_id", user.id)
    .maybeSingle();
  if (existing) return;

  const country = detectCountry().code;
  const { error } = await supabase.from("households").insert({ primary_user_id: user.id, country });
  if (error) {
    // Non-fatal: the user is still signed in, just without a household row
    // yet. Logged so it's visible during Phase 1 testing, not swallowed.
    console.error("Failed to create household for new user:", error.message);
  }
}
