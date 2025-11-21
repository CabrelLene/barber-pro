// src/api/auth.ts
import { api } from './client';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: 'CLIENT' | 'BARBER' | 'ADMIN';
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', payload);
  return res.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', payload);
  return res.data;
}
