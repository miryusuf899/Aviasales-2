import { apiClient, mockClient } from '@/shared/api/httpClient';
import { env } from '@/shared/config/env';
import { formatShortDate, formatTime } from '@/shared/lib/formatters';

import type { BackendFlight, FlightOption, FlightSearchParams } from '../types';

const airlinePalette: Record<string, { airline: string; color: string; aircraft: string }> = {
  TJ: { airline: 'Somon Air', color: '#2563eb', aircraft: 'Boeing 737-800' },
  EK: { airline: 'Emirates', color: '#C60C30', aircraft: 'Boeing 777-300ER' },
  AF: { airline: 'Air France', color: '#002F87', aircraft: 'Airbus A350-900' },
  UA: { airline: 'United Airlines', color: '#0033A0', aircraft: 'Boeing 767-400ER' },
  LH: { airline: 'Lufthansa', color: '#05164D', aircraft: 'Airbus A330-300' },
  QR: { airline: 'Qatar Airways', color: '#5C0632', aircraft: 'Boeing 787-9' },
};

function hoursBetween(start: string, end: string) {
  const diff = Math.max(0, new Date(end).getTime() - new Date(start).getTime());
  const minutes = Math.round(diff / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function mapBackendFlight(flight: BackendFlight): FlightOption {
  const code = flight.flight_number.replace(/\d/g, '').slice(0, 2).toUpperCase() || 'SB';
  const meta = airlinePalette[code] ?? {
    airline: 'SkyBook Air',
    color: '#2563eb',
    aircraft: 'Airbus A320neo',
  };

  return {
    id: flight.flight_number || String(flight.id),
    backendId: flight.id,
    airline: meta.airline,
    code,
    from: flight.from_airport,
    fromCity: flight.from_airport,
    to: flight.to_airport,
    toCity: flight.to_airport,
    departure: formatTime(flight.departure_time),
    arrival: formatTime(flight.arrival_time),
    date: formatShortDate(flight.departure_time),
    duration: hoursBetween(flight.departure_time, flight.arrival_time),
    stops: 0,
    price: Number(flight.price),
    seats: flight.available_seats,
    aircraft: meta.aircraft,
    color: meta.color,
    currency: flight.currency,
  };
}

export const flightsApi = {
  searchFlights: async (params: FlightSearchParams = {}) => {
    try {
      const { data } = await apiClient.get<BackendFlight[]>('/flights/flights', {
        params: {
          from_airport: params.from,
          to_airport: params.to,
          departure_date: params.departureDate,
        },
      });
      const mapped = data.map(mapBackendFlight);
      if (mapped.length || !env.useMockFallback) return mapped;
    } catch (error) {
      if (!env.useMockFallback) throw error;
    }

    const { data } = await mockClient.get<FlightOption[]>('/flights.json');
    return data;
  },

  getFlight: async (flightId: string) => {
    const flights = await flightsApi.searchFlights();
    const flight = flights.find((item) => item.id === flightId || String(item.backendId) === flightId);
    if (!flight) {
      throw { code: 'FLIGHT_NOT_FOUND', message: 'Flight was not found', status: 404 };
    }
    return flight;
  },
};
