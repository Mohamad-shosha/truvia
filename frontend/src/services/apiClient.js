import axios from 'axios';
import { tokenStore } from './tokenStore';
import { normalizeError } from './errors';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

const CSRF_HEADERS = { 'X-Requested-With': 'XMLHttpRequest' };

/** Main client: attaches the bearer token and transparently refreshes once on 401. */
export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // lets the browser send/receive the HttpOnly refresh cookie
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** Bare client without interceptors, used for refresh/logout to avoid recursion. */
const bare = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

export const refreshClient = bare;

let sessionExpiredHandler = () => {};
export function setSessionExpiredHandler(fn) {
  sessionExpiredHandler = fn || (() => {});
}
export function notifySessionExpired() {
  sessionExpiredHandler();
}

let inFlightRefresh = null;

/**
 * Single-flight refresh: concurrent callers share one request. This matters because the
 * backend rotates refresh tokens and treats a replayed token as theft.
 */
export function refreshSession() {
  if (!inFlightRefresh) {
    inFlightRefresh = bare
      .post('/api/auth/refresh', null, { headers: CSRF_HEADERS })
      .then((res) => {
        tokenStore.set(res.data.accessToken);
        return res.data;
      })
      .catch((err) => {
        tokenStore.clear();
        throw normalizeError(err);
      })
      .finally(() => {
        inFlightRefresh = null;
      });
  }
  return inFlightRefresh;
}

export async function revokeServerSession() {
  await bare.post('/api/auth/logout', null, { headers: CSRF_HEADERS });
}

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !original.skipAuth && !original._retried) {
      original._retried = true;
      try {
        await refreshSession();
        original.headers.Authorization = `Bearer ${tokenStore.get()}`;
        return http(original);
      } catch (refreshError) {
        // Only an explicit rejection means the session is over; a network failure is not an expiry.
        if (!refreshError.isNetwork) {
          notifySessionExpired();
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(normalizeError(error));
  },
);
