// ============================================================
// utils/helpers.js — Shared utility functions
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

/**
 * formatTime — formats a Date or ISO string to HH:MM.
 * @param {Date|string} date
 * @returns {string} e.g. "14:35"
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-GB', {
    hour:   '2-digit',
    minute: '2-digit',
  });
}

/**
 * getStatusBadge — returns the CSS badge class for a given status string.
 * @param {string} status - "Active" | "Delayed" | "Critical"
 * @returns {string} Tailwind class name
 */
export function getStatusBadge(status) {
  const map = {
    Active:   'badge-active',
    Delayed:  'badge-delayed',
    Critical: 'badge-critical',
  };
  return map[status] ?? 'badge-active';  // Default to active
}

/**
 * truncate — shortens a string and appends "…" if over limit.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(text, maxLength = 40) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * classNames — merges conditional class strings.
 * Light wrapper; prefer using clsx directly for complex cases.
 * @param  {...string} classes
 * @returns {string}
 */
export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
