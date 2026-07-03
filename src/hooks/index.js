// ============================================================
// hooks/index.js — Custom React hooks barrel file
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating a value until after a pause.
 * Useful for search inputs to reduce API calls.
 *
 * @param {*}      value - the value to debounce
 * @param {number} delay - milliseconds to wait
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the delay
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    // Cleanup: clear the timer if value changes before delay expires
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useLocalStorage — persists state to localStorage.
 *
 * @param {string} key          - storage key
 * @param {*}      initialValue - default value if key is not set
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Save to localStorage whenever value changes
  function setValue(value) {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  return [storedValue, setValue];
}
