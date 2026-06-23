import { apiClient } from '@/shared/api/httpClient';

import type { LoginPayload, RegisterPayload, TokenPair, User } from '../types';

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const { data } = await apiClient.post<User>('/users/register', payload);
    return data;
  },
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<TokenPair>('/users/login', payload);
    return data;
  },
  me: async () => {
    const { data } = await apiClient.get<User>('/users/users/me');
    return data;
  },
};
