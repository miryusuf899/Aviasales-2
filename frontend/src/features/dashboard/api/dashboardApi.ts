import { bookingApi } from '@/features/booking/api/bookingApi';
import { mockClient } from '@/shared/api/httpClient';
import { env } from '@/shared/config/env';
import { formatShortDate } from '@/shared/lib/formatters';

import type { BookingListItem, BookingStatus } from '../types';

function normalizeStatus(status: string): BookingStatus {
  if (status === 'payment_failed') return 'payment_failed';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'confirmed') return 'confirmed';
  return 'pending';
}

export const dashboardApi = {
  listBookings: async () => {
    try {
      const bookings = await bookingApi.listBookings();
      const mapped: BookingListItem[] = bookings.map((booking) => ({
        id: String(booking.id),
        flight: `Flight #${booking.flight_id}`,
        from: 'DYU',
        to: 'IST',
        fromCity: 'Dushanbe',
        toCity: 'Istanbul',
        departure: '08:00',
        arrival: '11:30',
        date: formatShortDate(booking.created_at),
        status: normalizeStatus(booking.status),
        price: Number(booking.total_price),
        passengers: booking.seats_booked,
        airline: 'SkyBook Air',
        color: '#2563eb',
      }));
      if (mapped.length || !env.useMockFallback) return mapped;
    } catch (error) {
      if (!env.useMockFallback) throw error;
    }

    const { data } = await mockClient.get<BookingListItem[]>('/bookings.json');
    return data;
  },
  cancelBooking: bookingApi.cancelBooking,
};
