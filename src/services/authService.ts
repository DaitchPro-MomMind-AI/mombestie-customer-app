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
  const householdResult = await ensureHousehold();
  if (!householdResult.ok) {
    // MBCST-18: the real auth user now exists but has no real household row
    // -- surfacing this honestly rather than silently returning ok:true lets
    // the UI tell the person their account isn't fully usable yet instead of
    // dropping them into an app with a broken (missing) household.
    return { ok: false, error: householdResult.error };
  }
  return { ok: true };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: "Backend not configured (missing VITE_SUPABASE_URL/ANON_KEY)." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  const householdResult = await ensureHousehold();
  if (!householdResult.ok) {
    return { ok: false, error: householdResult.error };
  }
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
 * MBCST-22: resolves whether a real Supabase session already exists (e.g. on
 * page reload) so the app can restore the signed-in state instead of always
 * dropping back to the login screen. `persistSession` is on by default in
 * the Supabase client, so the session itself already survives a reload --
 * the app just wasn't checking for it before this fix.
 */
export async function hasActiveSession(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return data.session !== null;
}

/**
 * Fires `callback(true)`/`callback(false)` whenever the real Supabase auth
 * state changes (sign-in elsewhere, token refresh failure, sign-out from a
 * different tab, etc.), so the app's session state never silently drifts
 * from the real one. Returns an unsubscribe function.
 */
export function onAuthStateChange(callback: (signedIn: boolean) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session !== null);
  });
  return () => data.subscription.unsubscribe();
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
 *
 * MBCST-18: returns a real ok/error result instead of only logging on
 * failure, so a partial sign-up (real auth user created, real household
 * insert failed) is surfaced to the caller rather than silently producing a
 * signed-in account with no household to attach children/bookings/etc. to.
 */
async function ensureHousehold(): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: true };
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: true };

  const { data: existing } = await supabase
    .from("households")
    .select("id")
    .eq("primary_user_id", user.id)
    .maybeSingle();
  if (existing) return { ok: true };

  const country = detectCountry().code;
  const { error } = await supabase.from("households").insert({ primary_user_id: user.id, country });
  if (error) {
    console.error("Failed to create household for new user:", error.message);
    return { ok: false, error: "Your account was created, but we couldn't finish setting it up. Please try signing in again, or contact support if this keeps happening." };
  }
  return { ok: true };
}
