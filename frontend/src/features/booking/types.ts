import type { FlightOption } from '@/features/flights/types';

export type PassengerForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  nationality: string;
  passport: string;
};

export type Booking = {
  id: number | string;
  user_id?: number;
  flight_id?: number | string;
  status: 'pending' | 'confirmed' | 'payment_failed' | 'cancelled';
  seats_booked: number;
  total_price: string | number;
  created_at: string;
};

export type LocalBookingDraft = {
  flight: FlightOption;
  passenger?: PassengerForm;
  booking?: Booking;
};
