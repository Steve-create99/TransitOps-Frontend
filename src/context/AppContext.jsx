// ============================================================
// context/AppContext.jsx — Global application state context
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, getAccessToken, saveSession, clearSession, authApi } from '../services/api';

const AppContext = createContext(null);

/**
 * Derive the initial user on mount.
 * If a user object is stored we use it; otherwise, if an access token
 * exists we create a minimal sentinel so PrivateRoute lets the user in
 * (they're authenticated — we just don't have profile details yet).
 */
function resolveInitialUser() {
  const stored = getUser();
  if (stored) return stored;
  // Token present but no user object — treat as authenticated with unknown profile
  if (getAccessToken()) return { email: null, firstName: null, lastName: null, role: null };
  return null;
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(resolveInitialUser);
  const [notificationCount, setNotificationCount] = useState(2);

  // Handle token-expiry logout events fired from api.js
  useEffect(() => {
    const onAuthLogout = () => setUser(null);
    window.addEventListener('auth-logout', onAuthLogout);
    return () => window.removeEventListener('auth-logout', onAuthLogout);
  }, []);

  /**
   * handleLogin — called after a successful /auth/login response.
   * userData may be null if the backend doesn't return a user object;
   * in that case we store a minimal sentinel so the route guard passes.
   */
  const handleLogin = (userData, tokens) => {
    saveSession(tokens.accessToken, tokens.refreshToken, tokens.expiresIn, userData);
    // Always set a non-null user so PrivateRoute knows the user is authenticated
    setUser(userData ?? { email: null, firstName: null, lastName: null, role: null });
  };

  /**
   * handleLogout — best-effort server revocation, then full local clear.
   */
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Backend logout failed (token may already be revoked):', e.message);
    } finally {
      clearSession();
      setUser(null);
    }
  };

  const value = {
    user,
    login:  handleLogin,
    logout: handleLogout,
    notificationCount,
    setNotificationCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}
