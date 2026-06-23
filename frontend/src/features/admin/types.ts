export type Airport = {
  id: number;
  code: string;
  city: string;
  country: string;
};

export type FlightAdminItem = {
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

export type AirportPayload = {
  code: string;
  city: string;
  country: string;
};

export type FlightPayload = {
  flight_number: string;
  from_airport_id: number;
  to_airport_id: number;
  departure_time: string;
  arrival_time: string;
  available_seats: number;
  price: string;
  currency: string;
};
