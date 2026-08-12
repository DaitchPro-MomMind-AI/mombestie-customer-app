import { useCallback, useState } from "react";
import { addBooking, listBookings } from "./bookingService";
import type { BookingRequest, NewBookingRequest } from "./bookingTypes";

export function useBookings(childId: string) {
  const [bookings, setBookings] = useState<BookingRequest[]>(() => listBookings(childId));

  const refresh = useCallback(() => setBookings(listBookings(childId)), [childId]);

  const save = useCallback(
    (input: Omit<NewBookingRequest, "childId">) => {
      const booking = addBooking({ ...input, childId });
      refresh();
      return booking;
    },
    [childId, refresh],
  );

  return { bookings, save, refresh };
}
