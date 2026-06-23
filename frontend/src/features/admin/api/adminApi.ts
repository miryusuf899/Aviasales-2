import { apiClient } from '@/shared/api/httpClient';

import type { Airport, AirportPayload, FlightAdminItem, FlightPayload } from '../types';

export const adminApi = {
  listAirports: async () => {
    const { data } = await apiClient.get<Airport[]>('/flights/airports');
    return data;
  },

  createAirport: async (payload: AirportPayload) => {
    const { data } = await apiClient.post<Airport>('/flights/airports', {
      ...payload,
      code: payload.code.trim().toUpperCase(),
    });
    return data;
  },

  listFlights: async () => {
    const { data } = await apiClient.get<FlightAdminItem[]>('/flights/flights');
    return data;
  },

  createFlight: async (payload: FlightPayload) => {
    const { data } = await apiClient.post<FlightAdminItem>('/flights/flights', payload);
    return data;
  },

  updateFlight: async (flightId: number, payload: Partial<FlightPayload>) => {
    const { data } = await apiClient.put<FlightAdminItem>(`/flights/flights/${flightId}`, payload);
    return data;
  },

  patchSeats: async (flightId: number, delta: number) => {
    const { data } = await apiClient.patch<FlightAdminItem>(`/flights/flights/${flightId}/seats`, { delta });
    return data;
  },

  deleteFlight: async (flightId: number) => {
    await apiClient.delete(`/flights/flights/${flightId}`);
  },
};
