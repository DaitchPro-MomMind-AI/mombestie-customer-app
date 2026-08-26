/**
 * Real Supabase-backed marketplace bookings -- `bookings` table
 * (mombestie-backend migration 20260812000005), the same table
 * apps/provider-portal's Bookings screen and apps/admin-portal's
 * Providers/Bookings pages read from.
 *
 * This used to be a localStorage-only mock (FEATURES.liveMarketplace
 * stayed `false`) -- "no live provider availability, no payment capture,
 * no provider-side accept/decline." Booking requests now write a real,
 * persisted row a real provider can see and accept/decline in Provider
 * Portal, and a real admin can see in Admin Portal. `realPayments` stays
 * `false` deliberately -- this is a real *request*, not a real charge; no
 * money moves until a payment processor is actually connected.
 */
import { supabase } from "./supabaseClient";
import type { BookingRequest, NewBookingRequest } from "./bookingTypes";

export async function listBookings(householdId: string): Promise<BookingRequest[]> {
  if (!supabase || !householdId) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select("id,household_id,provider_id,service_category,scheduled_at,duration_hours,price_cents,commission_cents,currency,notes,status,created_at")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load bookings:", error.message);
    return [];
  }
  // provider_name isn't stored on the row (it's the provider's own
  // business_name, resolved by the caller at request time) -- filled in
  // as empty here since a list refresh doesn't refetch the provider.
  return (data ?? []).map(row => ({ ...row, provider_name: "" }));
}

export async function addBooking(input: NewBookingRequest & { provider_name: string }): Promise<{ ok: boolean; error?: string; booking?: BookingRequest }> {
  if (!supabase) return { ok: false, error: "Backend not configured." };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "Not signed in." };

  const idempotency_key = `mkt_${userData.user.id}_${input.provider_id}_${input.scheduled_at}`;
  const { provider_name, ...row } = input;
  const { data, error } = await supabase
    .from("bookings")
    .insert({ ...row, customer_id: userData.user.id, idempotency_key, status: "requested" })
    .select("id,household_id,provider_id,service_category,scheduled_at,duration_hours,price_cents,commission_cents,currency,notes,status,created_at")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, booking: { ...data, provider_name } };
}
