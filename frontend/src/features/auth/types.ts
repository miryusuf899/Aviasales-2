export type UserRole = 'passenger' | 'admin';

export type User = {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: UserRole;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
};
