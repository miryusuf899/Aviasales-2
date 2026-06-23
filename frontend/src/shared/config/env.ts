export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  mockApiBaseUrl: import.meta.env.VITE_MOCK_API_BASE_URL ?? '/mock-api',
  useMockFallback: (import.meta.env.VITE_USE_MOCK_FALLBACK ?? 'true') === 'true',
};
