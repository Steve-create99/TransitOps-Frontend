// ============================================================
// services/api.js — API service layer (stub)
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================
// Replace BASE_URL with your actual backend endpoint.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/**
 * get — generic GET request helper.
 * @param {string} path - API path (e.g. '/routes')
 */
export async function get(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

/**
 * post — generic POST request helper.
 * @param {string} path - API path
 * @param {object} body - request payload
 */
export async function post(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

// ── Domain-specific helpers (expand as needed) ───────────────
export const routesApi   = { list: () => get('/routes') };
export const stopsApi    = { list: () => get('/stops')  };
export const scheduleApi = { list: () => get('/schedules') };
