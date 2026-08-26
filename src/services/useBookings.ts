import { useCallback, useEffect, useState } from "react";
import { addBooking, listBookings } from "./bookingService";
import type { BookingRequest, NewBookingRequest } from "./bookingTypes";

// Keyed by household id now, not child id -- the real `bookings` table has
// no per-child column (a household books a provider, not an individual
// child), matching every other real household-scoped service in this app.
export function useBookings(householdId: string | null) {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!householdId) { setBookings([]); setLoading(false); return; }
    setLoading(true);
    setBookings(await listBookings(householdId));
    setLoading(false);
  }, [householdId]);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback(
    async (input: Omit<NewBookingRequest, "household_id"> & { provider_name: string }) => {
      if (!householdId) return { ok: false, error: "No household on this account yet." };
      const res = await addBooking({ ...input, household_id: householdId });
      if (res.ok) await refresh();
      return res;
    },
    [householdId, refresh],
  );

  return { bookings, loading, save, refresh };
}
