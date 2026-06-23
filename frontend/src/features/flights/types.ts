export type Destination = {
  city: string;
  country: string;
  code: string;
  price: number;
  imageUrl: string;
  tag?: string;
};

export type MarketingContent = {
  stats: Array<{ value: string; label: string }>;
  destinations: Destination[];
  benefits: Array<{ title: string; description: string; color: string }>;
  airlinePartners: Array<{ name: string; code: string; color: string }>;
  testimonials: Array<{ name: string; role: string; rating: number; text: string; avatar: string }>;
};

export type FlightSearchParams = {
  from?: string;
  to?: string;
  departureDate?: string;
  passengers?: number;
  cabin?: string;
};

export type FlightOption = {
  id: string;
  backendId?: number;
  airline: string;
  code: string;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  departure: string;
  arrival: string;
  date: string;
  duration: string;
  stops: number;
  price: number;
  seats: number;
  aircraft: string;
  color: string;
  currency?: string;
};

export type BackendFlight = {
  id: number;
  flight_number: string;
  from_airport: string;
  to_airport: string;
  departure_time: string;
  arrival_time: string;
  available_seats: number;
  price: string;
  currency: string;
};
