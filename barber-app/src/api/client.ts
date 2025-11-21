// src/api/client.ts
import axios from 'axios';

// ⚠ IP de ton PC
const API_BASE_URL = 'http://192.168.0.136:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// on garde un token en mémoire (configuré depuis le AuthContext)
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token ?? null;
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});
