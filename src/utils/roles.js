// ============================================================
// roles.js — Role helpers for route guards and redirects
// ============================================================

export function normalizeRole(role) {
  if (!role) return null;
  const r = String(role).toUpperCase().replace(/^ROLE_/, '');
  return r || null;
}

export function isStaff(user) {
  const role = normalizeRole(user?.role);
  return role === 'ADMIN' || role === 'DISPATCHER';
}

export function isDriver(user) {
  return normalizeRole(user?.role) === 'DRIVER';
}

export function homeForRole(user) {
  if (isDriver(user)) return '/driver';
  if (isStaff(user)) return '/dashboard';
  // Authenticated but role unknown — send to login to rehydrate session
  return '/login';
}
