// ============================================================
// context/AppContext.jsx — Global application state context
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, saveSession, clearSession, authApi } from '../services/api';

// Create context object
const AppContext = createContext(null);

/**
 * AppProvider — wraps the app and provides global state.
 */
export function AppProvider({ children }) {
  // Current authenticated user (initialized from localStorage)
  const [user, setUser] = useState(getUser);

  // Global notification count
  const [notificationCount, setNotificationCount] = useState(2);

  // Listen to token-expiration logout events dispatched from api.js
  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  /**
   * handleLogin — updates state and saves session to localStorage
   */
  const handleLogin = (userData, tokens) => {
    saveSession(tokens.accessToken, tokens.refreshToken, tokens.expiresIn, userData);
    setUser(userData);
  };

  /**
   * handleLogout — revokes backend session, cleans localStorage, and updates state
   */
  const handleLogout = async () => {
    try {
      // Best effort logout on the backend
      await authApi.logout();
    } catch (e) {
      console.warn('Backend logout failed or was already revoked:', e);
    } finally {
      clearSession();
      setUser(null);
    }
  };

  const value = {
    user,
    login: handleLogin,
    logout: handleLogout,
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
