import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guest tracking
  const [guestCount, setGuestCount] = useState(() => {
    return Number(localStorage.getItem('guestImageCount') || 0);
  });

  const incrementGuest = useCallback(() => {
    setGuestCount((c) => {
      const next = c + 1;
      localStorage.setItem('guestImageCount', next);
      return next;
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/api/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const googleLogin = useCallback(async (payload) => {
    const { data } = await api.post('/api/auth/google', payload);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const { data } = await api.put('/api/auth/profile', updates);
    setUser(data.user);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, googleLogin, logout, updateProfile,
      guestCount, incrementGuest, isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
