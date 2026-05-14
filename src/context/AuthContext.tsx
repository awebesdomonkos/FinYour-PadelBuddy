import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  authError: string | null;
  setAuthError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
  }, []);

  const safeFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, options);
      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error('Server error'); }
      if (!response.ok) {
        if (response.status === 401) logout();
        throw new Error(data?.message || data?.error || 'Request failed');
      }
      return data;
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.message === 'NetworkError') {
        throw new Error('Hálózati hiba. Ellenőrizd az internetkapcsolatot.');
      }
      throw err;
    }
  }, [logout]);

  const fetchMe = useCallback(async (authToken: string) => {
    try {
      const data = await safeFetch('/api/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const user = data?.user || data?.data || data;
      if (user?.id) setCurrentUser(user);
      else logout();
    } catch (err) {
      console.error('Auth verify error:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [safeFetch, logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      fetchMe(storedToken);
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const data = await safeFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password })
      });
      if (!data.token || !data.user) throw new Error('Invalid server response');
      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData: any) => {
    setAuthError(null);
    try {
      const data = await safeFetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!data.token || !data.user) throw new Error('Invalid server response');
      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, ...data } : prev);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser, token, loading, login, register, logout, updateUser, authError, setAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
