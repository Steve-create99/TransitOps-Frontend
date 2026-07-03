// ============================================================
// context/AppContext.jsx — Global application state context
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { createContext, useContext, useState } from 'react';

// Create context object
const AppContext = createContext(null);

/**
 * AppProvider — wraps the app and provides global state.
 * Add more state fields here as the app grows.
 */
export function AppProvider({ children }) {
  // Current authenticated user (null = not logged in)
  const [user, setUser] = useState(null);

  // Global notification count
  const [notificationCount, setNotificationCount] = useState(2);

  const value = {
    user,
    setUser,
    notificationCount,
    setNotificationCount,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * useAppContext — custom hook for consuming AppContext.
 * Throws if used outside of AppProvider.
 */
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}
