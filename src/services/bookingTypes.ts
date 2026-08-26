// Mirrors the real `bookings` table (mombestie-backend migration
// 20260812000005) -- previously this was a display-only shape
// (providerName/providerRole/estTotal as strings) backing a localStorage
// mock with no provider_id at all, since there was no real provider to
// reference. Now that MarketplaceScreen reads real approved providers,
// a booking has to carry a real provider_id and the numeric price/
// currency fields the shared `bookings` table actually needs.
export interface BookingRequest {
  id: string;
  household_id: string;
  provider_id: string;
  provider_name: string; // denormalized at request time for display only, not stored on the row
  service_category: string;
  scheduled_at: string; // ISO timestamp
  duration_hours: number;
  price_cents: number;
  commission_cents: number;
  currency: string;
  notes: string | null;
  status: "requested" | "accepted" | "declined" | "confirmed" | "in_progress" | "completed" | "paid_out" | "cancelled" | "disputed";
  created_at: string;
}

export type NewBookingRequest = Omit<BookingRequest, "id" | "created_at" | "status" | "provider_name">;
