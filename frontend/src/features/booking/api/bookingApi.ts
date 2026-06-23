import { apiClient } from '@/shared/api/httpClient';

import type { Booking } from '../types';

export const bookingApi = {
  createBooking: async (flightId: number | string, seatsBooked = 1) => {
    const { data } = await apiClient.post<Booking>('/bookings/bookings', {
      flight_id: Number(flightId),
      seats_booked: seatsBooked,
    });
    return data;
  },

  listBookings: async () => {
    const { data } = await apiClient.get<Booking[]>('/bookings/bookings');
    return data;
  },

  cancelBooking: async (bookingId: number | string) => {
    const { data } = await apiClient.delete<Booking>(`/bookings/bookings/${bookingId}`);
    return data;
  },
};
