/**
 * Real family-service provider directory -- `public_providers` view
 * (mombestie-backend migration 20260812000005). This view only ever
 * reflects real, admin-approved provider rows (its own comment: "Never
 * fabricate availability or verification here"), so every row returned
 * here is a genuinely verified provider -- there's no separate "verified"
 * flag to check, being listed at all *is* the verification.
 *
 * Replaces MarketplaceScreen's previous ALL_PROVIDERS fixture (six
 * invented names -- "Jessica M.", "Maria L." -- that a customer could
 * "book" with nothing written anywhere real).
 */
import { supabase } from "./supabaseClient";

export interface PublicProvider {
  id: string;
  business_name: string | null;
  categories: string[];
  bio: string | null;
  experience_years: number | null;
  service_city: string | null;
  service_radius_mi: number;
  hourly_rate_cents: number | null;
  country: string;
  availability_days: string[];
  rating: number | null;
  review_count: number;
}

export async function listApprovedProviders(country?: string): Promise<PublicProvider[]> {
  if (!supabase) return [];
  let query = supabase
    .from("public_providers")
    .select(
      "id,business_name,categories,bio,experience_years,service_city,service_radius_mi,hourly_rate_cents,country,availability_days,rating,review_count"
    );
  if (country) query = query.eq("country", country);
  const { data, error } = await query.order("rating", { ascending: false, nullsFirst: false });
  if (error) {
    console.error("Failed to load providers:", error.message);
    return [];
  }
  return data ?? [];
}
