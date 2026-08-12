/**
 * MOCK Booking Service — backed by localStorage. Same status as
 * trackingService.ts: a stand-in for the real Booking service
 * (docs/ARCHITECTURE.md §2/§3 — booking state machine, idempotent writes).
 *
 * This does NOT make the marketplace real — there's still no live provider
 * availability, no payment capture, no provider-side accept/decline
 * (FEATURES.liveMarketplace stays false). What it fixes: BookingSheet used to
 * show "Request Sent!" with nothing written anywhere. Now the request is a
 * real, persisted record a customer can see again, same honesty bar as the
 * Tracking Service.
 */
import { readJSON, writeJSON } from "./storage";
import type { BookingRequest, NewBookingRequest } from "./bookingTypes";

const key = (childId: string) => `bookings:${childId}`;

export function listBookings(childId: string): BookingRequest[] {
  return readJSON<BookingRequest[]>(key(childId), []);
}

export function addBooking(input: NewBookingRequest): BookingRequest {
  const booking: BookingRequest = {
    id: `booking_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: "requested",
    ...input,
  };
  writeJSON(key(input.childId), [booking, ...listBookings(input.childId)]);
  return booking;
}
