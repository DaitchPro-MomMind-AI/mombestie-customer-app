/**
 * Capability lookups for Find Care and Explore With Baby — reads
 * country_config flags and the local_discovery_sources registry
 * (mommind-backend migration 20260812000011) so the UI can render an honest
 * "not available in your area yet" state instead of ever fabricating a
 * doctor or local business. See docs/ARCHITECTURE.md §14.1/§14.10-14.11.
 */
import { supabase } from "./supabaseClient";
import { detectCountry } from "./countryConfig";

export interface CountryCapabilities {
  countryCode: string;
  countryName: string;
  healthcareBookingEnabled: boolean;
  insuranceMatchingEnabled: boolean;
  localDiscoveryEnabled: boolean;
  telehealthEnabled: boolean;
  doctorDirectorySource: string | null;
}

const FALLBACK: CountryCapabilities = {
  countryCode: detectCountry().code,
  countryName: detectCountry().name,
  healthcareBookingEnabled: false,
  insuranceMatchingEnabled: false,
  localDiscoveryEnabled: false,
  telehealthEnabled: false,
  doctorDirectorySource: null,
};

/** null distinguishes "couldn't check" (no backend configured) from a real, checked "disabled" result -- the two need different UI copy. */
export async function getCountryCapabilities(): Promise<CountryCapabilities | null> {
  if (!supabase) return null;
  const code = detectCountry().code;
  const { data, error } = await supabase
    .from("country_config")
    .select(
      "country_code,country_name,healthcare_booking_enabled,insurance_matching_enabled,local_discovery_enabled,telehealth_enabled,doctor_directory_source"
    )
    .eq("country_code", code)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("Failed to load country capabilities:", error.message);
    return FALLBACK;
  }
  return {
    countryCode: data.country_code,
    countryName: data.country_name,
    healthcareBookingEnabled: data.healthcare_booking_enabled,
    insuranceMatchingEnabled: data.insurance_matching_enabled,
    localDiscoveryEnabled: data.local_discovery_enabled,
    telehealthEnabled: data.telehealth_enabled,
    doctorDirectorySource: data.doctor_directory_source,
  };
}

export interface LocalDiscoverySourceStatus {
  category: "food" | "shopping" | "activities_entertainment";
  status: "not_configured" | "configured" | "active" | "disabled";
  vendorName: string | null;
}

export async function getLocalDiscoverySources(countryCode: string): Promise<LocalDiscoverySourceStatus[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("local_discovery_sources")
    .select("category,status,vendor_name")
    .eq("country_code", countryCode);
  if (error) {
    console.error("Failed to load local discovery sources:", error.message);
    return [];
  }
  return (data ?? []).map(r => ({ category: r.category, status: r.status, vendorName: r.vendor_name }));
}
