// ============================================================
// services/api.js — API client with JWT auth + domain helpers
// ============================================================

const DEFAULT_PROD_API = 'https://web-production-f8ec21.up.railway.app/api';
const REQUEST_TIMEOUT_MS = 30000;

function resolveBaseUrl() {
  let base = import.meta.env.VITE_API_URL;
  if (!base) {
    base = import.meta.env.PROD ? DEFAULT_PROD_API : '/api';
  }
  base = String(base).replace(/\/$/, '');
  if (/^https?:\/\//.test(base) && !base.endsWith('/api')) {
    base = `${base}/api`;
  }
  return base;
}

export const BASE_URL = resolveBaseUrl();

function decodeJwtPayload(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

export function normalizeAuthResponse(data) {
  const accessToken = data.accessToken || data.token || null;
  const refreshToken = data.refreshToken || null;
  let expiresIn = data.expiresIn ?? null;
  if (expiresIn !== null && expiresIn < 100_000) {
    expiresIn = expiresIn * 1000;
  }
  let user = data.user || null;
  if (!user && accessToken) {
    const payload = decodeJwtPayload(accessToken);
    if (payload) {
      user = {
        id: payload.id ?? payload.sub ?? null,
        email: payload.email ?? payload.sub ?? null,
        firstName: payload.firstName ?? payload.given_name ?? null,
        lastName: payload.lastName ?? payload.family_name ?? null,
        role: payload.role ?? payload.roles?.[0] ?? null,
      };
    }
  }
  return { accessToken, refreshToken, expiresIn, user };
}

export function getAccessToken() { return localStorage.getItem('accessToken'); }
export function getRefreshToken() { return localStorage.getItem('refreshToken'); }
export function getExpiresAt() {
  const v = localStorage.getItem('expiresAt');
  return v ? parseInt(v, 10) : null;
}
export function getUser() {
  try {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveSession(accessToken, refreshToken, expiresIn, user) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  if (expiresIn) localStorage.setItem('expiresAt', String(Date.now() + expiresIn));
  if (user) localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  ['accessToken', 'refreshToken', 'expiresAt', 'user'].forEach((k) => localStorage.removeItem(k));
}

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(onSuccess, onError) {
  refreshSubscribers.push({ onSuccess, onError });
}

function resolveRefreshWaiters(token) {
  refreshSubscribers.forEach(({ onSuccess }) => onSuccess(token));
  refreshSubscribers = [];
}

function rejectRefreshWaiters(err) {
  refreshSubscribers.forEach(({ onError }) => onError?.(err));
  refreshSubscribers = [];
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearSession();
    throw new Error('No refresh token available');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('Token refresh failed');
    const raw = await response.json();
    const norm = normalizeAuthResponse(raw);
    saveSession(
      norm.accessToken,
      norm.refreshToken || refreshToken,
      norm.expiresIn,
      norm.user || getUser()
    );
    return norm.accessToken;
  } catch (err) {
    clearSession();
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function checkAndRefreshToken() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const expiresAt = getExpiresAt();
  if (!accessToken) return null;
  if (!refreshToken || !expiresAt) return accessToken;

  if (Date.now() + 60_000 > expiresAt) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(resolve, reject);
      });
    }
    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      resolveRefreshWaiters(newToken);
      return newToken;
    } catch (err) {
      rejectRefreshWaiters(err);
      throw err;
    } finally {
      isRefreshing = false;
    }
  }
  return accessToken;
}

function forceLogout(message) {
  clearSession();
  window.dispatchEvent(new CustomEvent('auth-logout'));
  const err = new Error(message || 'Session expired. Please log in again.');
  err.status = 401;
  return err;
}

/** Unwrap Spring PageResponse or raw arrays */
export function unwrapList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  return [];
}

export async function request(path, options = {}) {
  const {
    skipRefresh = false,
    skipAuthHeader = false,
    signal: outerSignal,
    _retried = false,
    ...fetchOptions
  } = options;

  const isAuthPublic =
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/register') ||
    path.startsWith('/auth/refresh');

  if (!skipRefresh && !isAuthPublic) {
    try {
      await checkAndRefreshToken();
    } catch {
      throw forceLogout();
    }
  }

  const headers = {
    ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
    ...fetchOptions.headers,
  };

  const token = getAccessToken();
  if (token && !skipAuthHeader && !isAuthPublic) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  if (outerSignal) {
    if (outerSignal.aborted) controller.abort();
    else outerSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      const e = new Error('Request timed out or was cancelled');
      e.status = 408;
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 401 && !isAuthPublic && !_retried) {
    try {
      if (isRefreshing) {
        await new Promise((resolve, reject) => subscribeTokenRefresh(resolve, reject));
      } else {
        isRefreshing = true;
        try {
          const newToken = await refreshAccessToken();
          resolveRefreshWaiters(newToken);
        } catch (err) {
          rejectRefreshWaiters(err);
          throw forceLogout('Unauthorized. Please sign in again.');
        } finally {
          isRefreshing = false;
        }
      }
      return request(path, { ...options, _retried: true });
    } catch (err) {
      if (err.status === 401) throw err;
      throw forceLogout('Unauthorized. Please sign in again.');
    }
  }

  if (response.status === 401) {
    throw forceLogout('Unauthorized. Please sign in again.');
  }

  if (response.status === 204) return null;

  if (!response.ok) {
    let errorData = {};
    try { errorData = await response.json(); } catch { /* ignore */ }
    const msg = errorData.error || errorData.message || `Server error (${response.status})`;
    const err = new Error(msg);
    err.status = response.status;
    err.details = errorData;
    throw err;
  }

  const ct = response.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return response.json();
  return response.text();
}

export const get = (path, opts = {}) => request(path, { ...opts, method: 'GET' });
export const post = (path, body, opts = {}) =>
  request(path, { ...opts, method: 'POST', body: body != null ? JSON.stringify(body) : undefined });
export const put = (path, body, opts = {}) =>
  request(path, { ...opts, method: 'PUT', body: body != null ? JSON.stringify(body) : undefined });
export const patch = (path, body, opts = {}) =>
  request(path, { ...opts, method: 'PATCH', body: body != null ? JSON.stringify(body) : undefined });
export const del = (path, opts = {}) => request(path, { ...opts, method: 'DELETE' });

export const authApi = {
  login: (email, password) => post('/auth/login', { email, password }, { skipRefresh: true, skipAuthHeader: true }),
  register: (firstName, lastName, email, role, password) =>
    post('/auth/register', { firstName, lastName, email, role, password }, { skipRefresh: true, skipAuthHeader: true }),
  logout: () => post('/auth/logout', null),
  refresh: (refreshToken) =>
    post('/auth/refresh', { refreshToken }, { skipRefresh: true, skipAuthHeader: true }),
  me: () => get('/auth/me'),
};

export const dashboardApi = {
  kpis: (opts) => get('/dashboard/kpis', opts),
  charts: (opts) => get('/dashboard/charts', opts),
};

export const reportsApi = {
  get: (period = 'weekly', opts) => get(`/reports?period=${encodeURIComponent(period)}`, opts),
  exportCsv: async (period = 'weekly') => {
    const token = getAccessToken();
    const res = await fetch(`${BASE_URL}/reports/export.csv?period=${encodeURIComponent(period)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('CSV export failed');
    return res.text();
  },
};

export const routesApi = {
  list: (params = {}) => {
    const q = new URLSearchParams({ page: 0, size: 200, ...params }).toString();
    return get(`/routes?${q}`);
  },
  get: (id) => get(`/routes/${id}`),
  create: (body) => post('/routes', body),
  update: (id, body) => put(`/routes/${id}`, body),
  remove: (id) => del(`/routes/${id}`),
};

export const stopsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams({ page: 0, size: 500, ...params }).toString();
    return get(`/stops?${q}`);
  },
  get: (id) => get(`/stops/${id}`),
  create: (body) => post('/stops', body),
  update: (id, body) => put(`/stops/${id}`, body),
  remove: (id) => del(`/stops/${id}`),
};

export const scheduleApi = {
  list: (params = {}) => {
    const q = new URLSearchParams({ page: 0, size: 500, ...params }).toString();
    return get(`/schedules?${q}`);
  },
  get: (id) => get(`/schedules/${id}`),
  create: (body) => post('/schedules', body),
  update: (id, body) => put(`/schedules/${id}`, body),
  remove: (id) => del(`/schedules/${id}`),
};

export const driversApi = {
  list: (params = {}) => {
    const q = new URLSearchParams({ page: 0, size: 200, ...params }).toString();
    return get(`/drivers?${q}`);
  },
  get: (id) => get(`/drivers/${id}`),
  create: (body) => post('/drivers', body),
  update: (id, body) => put(`/drivers/${id}`, body),
  remove: (id) => del(`/drivers/${id}`),
  incidents: (id) => get(`/drivers/${id}/incidents`),
  attendance: (id) => get(`/drivers/${id}/attendance`),
};

export const vehiclesApi = {
  list: (params = {}) => {
    const q = new URLSearchParams({ page: 0, size: 200, ...params }).toString();
    return get(`/vehicles?${q}`);
  },
  get: (id) => get(`/vehicles/${id}`),
  create: (body) => post('/vehicles', body),
  update: (id, body) => put(`/vehicles/${id}`, body),
  remove: (id) => del(`/vehicles/${id}`),
  locations: () => get('/vehicles/locations'),
  maintenance: (id) => get(`/vehicles/${id}/maintenance`),
  addMaintenance: (id, body) => post(`/vehicles/${id}/maintenance`, body),
};

export const notificationsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams({ page: 0, size: 100, ...params }).toString();
    return get(`/notifications?${q}`);
  },
  unreadCount: () => get('/notifications/unread-count'),
  markRead: (id) => patch(`/notifications/${id}/read`),
  markAllRead: () => post('/notifications/mark-all-read', null),
  archive: (id) => patch(`/notifications/${id}/archive`),
  remove: (id) => del(`/notifications/${id}`),
  create: (body) => post('/notifications', body),
};

export const settingsApi = {
  get: () => get('/settings'),
  update: (body) => put('/settings', body),
  users: (params = {}) => {
    const q = new URLSearchParams({ page: 0, size: 50, ...params }).toString();
    return get(`/settings/users?${q}`);
  },
  invite: (body) => post('/settings/users', body),
  patchUser: (id, body) => patch(`/settings/users/${id}`, body),
  auditLogs: (params = {}) => {
    const q = new URLSearchParams({ page: 0, size: 50, ...params }).toString();
    return get(`/settings/audit-logs?${q}`);
  },
};
