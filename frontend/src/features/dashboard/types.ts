export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'payment_failed';

export type BookingListItem = {
  id: string;
  flight: string;
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  departure: string;
  arrival: string;
  date: string;
  status: BookingStatus;
  price: number;
  passengers: number;
  airline: string;
  color: string;
};
