import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { setSessionExpiredHandler } from '../services/apiClient';

const AuthContext = createContext(null);

/** status: 'loading' (restoring session) | 'authenticated' | 'unauthenticated' */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [sessionExpired, setSessionExpired] = useState(false);

  // Restore the session after a reload using the HttpOnly refresh cookie.
  useEffect(() => {
    let active = true;
    authService
      .refresh()
      .then((data) => {
        if (!active) return;
        setUser(data.user);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setStatus('unauthenticated');
      });
    return () => {
      active = false;
    };
  }, []);

  // Called by the API client when a refresh is rejected while the user was signed in.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setStatus('unauthenticated');
      setSessionExpired(true);
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setStatus('authenticated');
    setSessionExpired(false);
    return data.user;
  }, []);

  /** @returns {Promise<{serverRevoked: boolean}>} */
  const logout = useCallback(async () => {
    const result = await authService.logout();
    setUser(null);
    setStatus('unauthenticated');
    setSessionExpired(false);
    return result;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      sessionExpired,
      login,
      logout,
      hasRole: (...roles) => !!user && roles.some((r) => user.roles.includes(r)),
    }),
    [user, status, sessionExpired, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
