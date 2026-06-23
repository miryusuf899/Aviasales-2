import { useCallback, useEffect, useMemo, useState } from 'react';

import { tokenStorage } from '@/shared/lib/storage';

import { AuthContext, type AuthContextValue } from './authContextValue';
import { authApi } from './authApi';
import type { LoginPayload, RegisterPayload, User } from '../types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(tokenStorage.getAccessToken()));

  const refreshUser = useCallback(async () => {
    if (!tokenStorage.getAccessToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const profile = await authApi.me();
      setUser(profile);
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const tokens = await authApi.login(payload);
    tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
    const profile = await authApi.me();
    setUser(profile);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await authApi.register(payload);
    await login({ email: payload.email, password: payload.password });
  }, [login]);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [loading, login, logout, refreshUser, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
