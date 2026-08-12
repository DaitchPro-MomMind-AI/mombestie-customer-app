import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * `null` when env vars aren't set (e.g. running in a fork without a
 * configured .env.local) — callers check this and fall back to the mock
 * layer rather than crashing. This is the ONE place the anon key is read;
 * it is safe to expose client-side (Row Level Security is what actually
 * gates access, not secrecy of this key) — see backend/README.md.
 */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = supabase !== null;
