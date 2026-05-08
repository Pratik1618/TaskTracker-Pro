'use client';

import { useCallback, useEffect, useState } from 'react';

const AUTH_STORAGE_KEY = 'auth_state';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved === 'true') {
      setIsAuthenticated(true);
    }
    setIsAuthLoaded(true);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Mock authentication: accept any non-empty credentials for now.
    // Replace with specific logic if required later.
    if (email.trim() && password.trim()) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return {
    isAuthenticated,
    isAuthLoaded,
    login,
    logout,
  };
}
