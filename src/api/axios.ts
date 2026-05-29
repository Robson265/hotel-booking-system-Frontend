/**
 * src/api/axios.ts
 *
 * Central Axios instance.
 * - baseURL points to the NestJS backend (change for production).
 * - Request interceptor auto-attaches the JWT stored in localStorage.
 * - Response interceptor extracts the human-readable error message
 *   so callers can simply catch and display `err.message`.
 */

import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT on every request ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Normalise error messages ──────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const data = error.response?.data;
    if (data?.message) {
      // NestJS can return message as string or string[]
      const msg = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message;
      error.message = msg;
    }
    return Promise.reject(error);
  },
);

export default api;
