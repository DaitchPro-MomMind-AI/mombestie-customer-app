export interface BookingRequest {
  id: string;
  childId: string;
  providerName: string;
  providerRole: string;
  day: string;
  slot: string;
  durationHrs: number;
  note?: string;
  estTotal: string;
  status: "requested";
  createdAt: string;
}

export type NewBookingRequest = Omit<BookingRequest, "id" | "createdAt" | "status">;
