const ACCESS_TOKEN_KEY = 'skybook.access_token';
const REFRESH_TOKEN_KEY = 'skybook.refresh_token';
const SELECTED_FLIGHT_KEY = 'skybook.selected_flight';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const selectedFlightStorage = {
  get: <T>() => {
    const value = sessionStorage.getItem(SELECTED_FLIGHT_KEY);
    return value ? (JSON.parse(value) as T) : null;
  },
  set: (flight: unknown) => {
    sessionStorage.setItem(SELECTED_FLIGHT_KEY, JSON.stringify(flight));
  },
};
