/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const STORAGE_KEY = 'nie_campusconnect_user';

// The context object itself — created once at module scope and consumed by
// AuthProvider below and useAuth at the bottom of this file.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const storeUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  };

  const applyUnauthorized = () => clearUser();

  // The server is the single source of truth for the session. A stale stored
  // identity (expired cookie, deleted account) is reset instead of masquerading
  // as a logged-in user while every API call fails.
  useEffect(() => {
    let isMounted = true;
    async function verifySession() {
      try {
        const currentUser = await authApi.getMe();
        if (!isMounted) return;
        if (currentUser) storeUser(currentUser);
        else clearUser();
      } catch {
        // Backend unreachable / server error: never fabricate a session.
        if (isMounted) clearUser();
      }
    }
    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Any 401 raised by the API layer (expired/invalid session mid-flight)
  // resets local state immediately.
  useEffect(() => {
    window.addEventListener('auth:unauthorized', applyUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', applyUnauthorized);
  }, []);

  // Real authentication only — there is deliberately no offline fallback.
  // The previous version accepted ANY email/password while the backend was
  // unreachable and granted admin UI access to any email containing "admin".
  const login = async (email, password) => {
    const res = await authApi.login(email.trim().toLowerCase(), password);
    if (!res?.user) {
      throw new Error('Login failed: the server returned an unexpected response');
    }
    storeUser(res.user);
    return res.user;
  };

  const register = async (dataOrName, maybeEmail, maybePassword) => {
    const payload =
      typeof dataOrName === 'object'
        ? dataOrName
        : { name: dataOrName, email: maybeEmail, password: maybePassword };
    const res = await authApi.register(payload);
    if (!res?.user) {
      throw new Error('Registration failed: the server returned an unexpected response');
    }
    storeUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort: clear the local session regardless
    }
    clearUser();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
