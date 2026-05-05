import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

interface User {
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (email: string, fullName: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const loadStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('aura_user') || sessionStorage.getItem('aura_user');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
};

const loadStoredToken = (): string | null => {
  return localStorage.getItem('aura_token') || sessionStorage.getItem('aura_token');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser);
  const [token, setToken] = useState<string | null>(loadStoredToken);

  useEffect(() => {
    if (token) {
      localStorage.setItem('aura_token', token);
    } else {
      localStorage.removeItem('aura_token');
      sessionStorage.removeItem('aura_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('aura_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aura_user');
      sessionStorage.removeItem('aura_user');
    }
  }, [user]);

  const syncGuestCart = useCallback(async () => {
    try {
      const raw = localStorage.getItem('guest_cart');
      if (!raw) return;
      const items = JSON.parse(raw);
      if (!Array.isArray(items) || items.length === 0) return;
      await api.post('/api/Cart/sync', { items });
      localStorage.removeItem('guest_cart');
    } catch { /* ignore */ }
  }, []);

  const login = useCallback(async (email: string, password: string, remember = true) => {
    const { data } = await api.post('/api/Auth/login', { email, password });
    const userObj = { email: data.email, fullName: data.fullName, role: data.role };
    setToken(data.token);
    setUser(userObj);
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('aura_token', data.token);
    storage.setItem('aura_user', JSON.stringify(userObj));
    setTimeout(syncGuestCart, 100);
  }, [syncGuestCart]);

  const register = useCallback(async (email: string, fullName: string, password: string) => {
    const { data } = await api.post('/api/Auth/register', { email, fullName, password });
    setToken(data.token);
    setUser({ email: data.email, fullName: data.fullName, role: data.role });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    sessionStorage.removeItem('aura_token');
    sessionStorage.removeItem('aura_user');
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isAuthenticated: !!token, isAdmin: user?.role === 'Admin', login, register, logout, updateUser }),
    [user, token, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
