import axios from 'axios';

import { env } from '@/shared/config/env';
import { tokenStorage } from '@/shared/lib/storage';

export type ApiError = {
  code: string;
  message: string;
  status: number;
};

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const mockClient = axios.create({
  baseURL: env.mockApiBaseUrl,
  timeout: 8000,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { error?: ApiError } | undefined;
    if (payload?.error) return payload.error;
    return {
      code: 'REQUEST_FAILED',
      message: error.message,
      status: error.response?.status ?? 500,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Unexpected application error',
    status: 500,
  };
}
