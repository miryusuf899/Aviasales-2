import type { FlightOption } from '@/features/flights/types';

import type { Booking, LocalBookingDraft, PassengerForm } from '../types';

const DRAFT_KEY = 'skybook.booking_draft';

export const bookingDraft = {
  get: () => {
    const value = sessionStorage.getItem(DRAFT_KEY);
    return value ? (JSON.parse(value) as LocalBookingDraft) : null;
  },
  setFlight: (flight: FlightOption) => {
    const current = bookingDraft.get() ?? {};
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...current, flight }));
  },
  setPassenger: (passenger: PassengerForm) => {
    const current = bookingDraft.get() ?? {};
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...current, passenger }));
  },
  setBooking: (booking: Booking) => {
    const current = bookingDraft.get() ?? {};
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...current, booking }));
  },
};
