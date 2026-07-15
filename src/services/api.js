// ============================================================
// services/api.js — API service layer with JWT Authentication
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

// Use a relative path so the Vite proxy handles routing in dev,
// and VITE_API_URL can be set to the full backend URL in production.
// The Spring Boot backend serves all routes under /api (e.g. /api/auth/register).
// Requests to /auth/register without that prefix return 403 Forbidden.
function resolveBaseUrl() {
  let base = import.meta.env.VITE_API_URL;
  if (!base) {
    base = import.meta.env.PROD
      ? 'https://transitops-backend-production.up.railway.app/api'
      : '/api';
  }
  base = base.replace(/\/$/, '');
  if (/^https?:\/\//.test(base) && !base.endsWith('/api')) {
    base = `${base}/api`;
  }
  return base;
}

const BASE_URL = resolveBaseUrl();

// ── JWT Utilities ────────────────────────────────────────────

/**
 * Decode the base64url-encoded payload of a JWT without verification.
 * Used only for extracting non-sensitive claims (name, email, role).
 */
function decodeJwtPayload(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

/**
 * normalizeAuthResponse — converts any backend auth response shape
 * into the consistent { accessToken, refreshToken, expiresIn, user }
 * object the rest of the app depends on.
 *
 * Handles:
 *  - Spring Boot that uses "token" instead of "accessToken"
 *  - expiresIn in seconds (< 100 000) vs milliseconds
 *  - Missing "user" object — extracted from JWT payload as fallback
 */
export function normalizeAuthResponse(data) {
  // ── Token field name ─────────────────────────────────────
  const accessToken = data.accessToken || data.token || null;

  // ── Refresh token (optional) ─────────────────────────────
  const refreshToken = data.refreshToken || null;

  // ── ExpiresIn: convert seconds → ms if needed ────────────
  // Spring Boot commonly returns seconds (e.g. 3600).
  // Storing Date.now() + 3600 would expire in 3.6 s, breaking everything.
  let expiresIn = data.expiresIn || null;
  if (expiresIn !== null && expiresIn < 100_000) {
    expiresIn = expiresIn * 1000; // seconds → milliseconds
  }

  // ── User object ──────────────────────────────────────────
  // Prefer explicit user object from backend; fall back to JWT payload.
  let user = data.user || null;
  if (!user && accessToken) {
    const payload = decodeJwtPayload(accessToken);
    if (payload) {
      user = {
        id:        payload.id        ?? payload.sub   ?? null,
        email:     payload.email     ?? payload.sub   ?? null,
        firstName: payload.firstName ?? payload.given_name  ?? null,
        lastName:  payload.lastName  ?? payload.family_name ?? null,
        role:      payload.role      ?? payload.roles?.[0]  ?? null,
      };
    }
  }

  return { accessToken, refreshToken, expiresIn, user };
}

// ── Token Storage Helpers ────────────────────────────────────

export function getAccessToken()  { return localStorage.getItem('accessToken'); }
export function getRefreshToken() { return localStorage.getItem('refreshToken'); }

export function getExpiresAt() {
  const v = localStorage.getItem('expiresAt');
  return v ? parseInt(v, 10) : null;
}

export function getUser() {
  const s = localStorage.getItem('user');
  try { return s ? JSON.parse(s) : null; } catch { return null; }
}

export function saveSession(accessToken, refreshToken, expiresIn, user) {
  if (accessToken)  localStorage.setItem('accessToken',  accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  if (expiresIn)    localStorage.setItem('expiresAt', String(Date.now() + expiresIn));
  if (user)         localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  ['accessToken', 'refreshToken', 'expiresAt', 'user'].forEach(
    (k) => localStorage.removeItem(k)
  );
}

// ── Token Refresh Orchestrator ───────────────────────────────
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) { refreshSubscribers.push(cb); }
function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) { clearSession(); throw new Error('No refresh token available'); }

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) throw new Error('Token refresh failed');

    const raw  = await response.json();
    const norm = normalizeAuthResponse(raw);
    saveSession(norm.accessToken, refreshToken, norm.expiresIn, norm.user || getUser());
    return norm.accessToken;
  } catch (err) {
    clearSession();
    throw err;
  }
}

async function checkAndRefreshToken() {
  const accessToken  = getAccessToken();
  const refreshToken = getRefreshToken();
  const expiresAt    = getExpiresAt();

  if (!accessToken || !refreshToken || !expiresAt) return accessToken ?? null;

  // Refresh if within 60 s of expiry (generous buffer for slow networks)
  if (Date.now() + 60_000 > expiresAt) {
    if (isRefreshing) {
      return new Promise((resolve) => subscribeTokenRefresh(resolve));
    }
    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      onRefreshed(newToken);
      return newToken;
    } catch (err) {
      isRefreshing = false;
      throw err;
    }
  }

  return accessToken;
}

// ── Generic Authenticated Fetch ──────────────────────────────

export async function request(path, options = {}) {
  // Routes that skip the pre-flight token refresh
  const skipRefresh = path.startsWith('/auth/login')
    || path.startsWith('/auth/register')
    || path.startsWith('/auth/refresh')
    || path.startsWith('/auth/logout');

  // Routes that do NOT receive an Authorization header
  const skipAuthHeader = path.startsWith('/auth/login')
    || path.startsWith('/auth/register')
    || path.startsWith('/auth/refresh');

  if (!skipRefresh) {
    try {
      await checkAndRefreshToken();
    } catch {
      clearSession();
      window.dispatchEvent(new CustomEvent('auth-logout'));
      throw new Error('Session expired. Please log in again.');
    }
  }

  const headers = { 'Content-Type': 'application/json', ...options.headers };

  const token = getAccessToken();
  if (token && !skipAuthHeader) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    clearSession();
    window.dispatchEvent(new CustomEvent('auth-logout'));
    throw new Error('Unauthorized. Please sign in again.');
  }

  if (!response.ok) {
    let errorData = {};
    try { errorData = await response.json(); } catch { /* not JSON */ }
    const msg = errorData.error || errorData.message || `Server error (${response.status})`;
    const err = new Error(msg);
    err.status  = response.status;
    err.details = errorData;
    throw err;
  }

  const ct = response.headers.get('content-type') ?? '';
  return ct.includes('application/json') ? response.json() : response.text();
}

export const get  = (path, opts = {}) => request(path, { ...opts, method: 'GET' });
export const post = (path, body, opts = {}) =>
  request(path, { ...opts, method: 'POST', body: body ? JSON.stringify(body) : undefined });

// ── Domain API helpers ───────────────────────────────────────
export const authApi = {
  login:    (email, password)                           => post('/auth/login',    { email, password }),
  register: (firstName, lastName, email, role, password) => post('/auth/register', { firstName, lastName, email, role, password }),
  logout:   ()                                          => post('/auth/logout',   null),
  refresh:  (refreshToken)                              => post('/auth/refresh',  { refreshToken }),
};

export const routesApi   = { list: () => get('/routes')    };
export const stopsApi    = { list: () => get('/stops')     };
export const scheduleApi = { list: () => get('/schedules') };
