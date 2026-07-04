// ============================================================
// services/api.js — API service layer with JWT Authentication
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const BASE_URL = VITE_API_URL.endsWith('/api') ? VITE_API_URL : `${VITE_API_URL}/api`;

// ── Token Storage Helpers ────────────────────────────────────
export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

export function getExpiresAt() {
  const expiresAt = localStorage.getItem('expiresAt');
  return expiresAt ? parseInt(expiresAt, 10) : null;
}

export function getUser() {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

export function saveSession(accessToken, refreshToken, expiresIn, user) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  
  if (expiresIn) {
    const expiresAt = Date.now() + expiresIn;
    localStorage.setItem('expiresAt', expiresAt.toString());
  }
  
  if (user) localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('expiresAt');
  localStorage.removeItem('user');
}

// ── Token Refresh Orchestrator ──────────────────────────────
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * refreshAccessToken — exchange the refresh token for a new access token
 */
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearSession();
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Refresh token request failed');
    }

    const data = await response.json();
    // Save new access token, update expiry. Refresh token is reused (not rotated)
    saveSession(data.accessToken, refreshToken, data.expiresIn, data.user || getUser());
    return data.accessToken;
  } catch (error) {
    clearSession();
    throw error;
  }
}

/**
 * checkAndRefreshToken — checks token status and refreshes if needed.
 */
async function checkAndRefreshToken() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const expiresAt = getExpiresAt();

  if (!accessToken || !refreshToken || !expiresAt) return null;

  // Refresh if token is expired or within 30 seconds of expiring
  if (Date.now() + 30000 > expiresAt) {
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh(resolve);
      });
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

// ── Generic Authenticated Fetch Wrapper ─────────────────────
export async function request(path, options = {}) {
  // Determine if this request requires authentication
  const isAuthRequest = path.startsWith('/auth/login') || path.startsWith('/auth/register') || path.startsWith('/auth/refresh');
  
  if (!isAuthRequest) {
    try {
      await checkAndRefreshToken();
    } catch (e) {
      // Refresh failed, clear session and notify app
      clearSession();
      window.dispatchEvent(new CustomEvent('auth-logout'));
      throw new Error('Session expired. Please log in again.');
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAccessToken();
  if (token && !isAuthRequest) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If request returned 401, clear local storage and dispatch logout event
    clearSession();
    window.dispatchEvent(new CustomEvent('auth-logout'));
    throw new Error('Unauthorized. Session expired.');
  }

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // response might not be json
    }
    const errMsg = errorData.error || errorData.message || `API error: ${response.status}`;
    const err = new Error(errMsg);
    err.status = response.status;
    err.details = errorData;
    throw err;
  }

  // Response might be empty (e.g. 204 No Content, or logout string)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export function get(path, options = {}) {
  return request(path, { ...options, method: 'GET' });
}

export function post(path, body, options = {}) {
  return request(path, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ── Domain-specific helpers ──────────────────────────────────
export const authApi = {
  login: (email, password) => post('/auth/login', { email, password }),
  register: (firstName, lastName, email, role, password) =>
    post('/auth/register', { firstName, lastName, email, role, password }),
  logout: () => post('/auth/logout', null),
  refresh: (refreshToken) => post('/auth/refresh', { refreshToken }),
};

export const routesApi   = { list: () => get('/routes') };
export const stopsApi    = { list: () => get('/stops')  };
export const scheduleApi = { list: () => get('/schedules') };
