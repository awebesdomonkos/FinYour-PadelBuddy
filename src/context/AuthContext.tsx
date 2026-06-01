import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
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
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  emailConfirmationPending: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  const row = data as any;
  return { id: row.id, email: row.email, name: row.name, ...(row.data || {}) } as User;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailConfirmationPending, setEmailConfirmationPending] = useState(false);

  const hydrateUser = useCallback(async (session: Session | null) => {
    if (!session) {
      setCurrentUser(null);
      setToken(null);
      return;
    }
    setToken(session.access_token);
    const profile = await fetchUserProfile(session.user.id);
    if (profile) {
      setCurrentUser(profile);
    } else {
      // Profile row doesn't exist yet — build minimal user from auth metadata
      const meta = session.user.user_metadata || {};
      setCurrentUser({
        id: session.user.id,
        email: session.user.email || '',
        name: meta.name || meta.full_name || session.user.email || '',
      } as User);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      hydrateUser(session).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateUser(session);
    });

    return () => subscription.unsubscribe();
  }, [hydrateUser]);

  const logout = useCallback(() => {
    supabase.auth.signOut();
    setCurrentUser(null);
    setToken(null);
  }, []);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.toLowerCase().trim(), password });
    if (error) {
      const msg = error.message === 'Email not confirmed'
        ? (email.includes('@') ? 'Erősítsd meg az email-címed! Ellenőrizd a postaládád.' : error.message)
        : error.message;
      setAuthError(msg);
      throw new Error(msg);
    }
    if (data.session) {
      setToken(data.session.access_token);
      await hydrateUser(data.session);
    }
  };

  const register = async (userData: any) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      options: {
        data: { name: userData.name, username: userData.username },
      },
    });
    if (error) {
      setAuthError(error.message);
      throw new Error(error.message);
    }

    // If session is null the user needs to confirm their email
    if (!data.session) {
      setEmailConfirmationPending(true);
      return;
    }

    // Insert profile row
    const userId = data.user!.id;
    const { name, username, phone, ...rest } = userData;
    const { password: _pw, ...profileRest } = rest;
    await supabase.from('users').upsert({
      id: userId,
      email: userData.email.toLowerCase().trim(),
      name,
      data: { username, phone, ...profileRest },
    });

    setToken(data.session.access_token);
    await hydrateUser(data.session);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw new Error(error.message);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const updateUser = (data: Partial<User>) => {
    setCurrentUser(prev => prev ? { ...prev, ...data } : prev);
  };

  return (
    <AuthContext.Provider value={{
      currentUser, token, loading, login, register, logout, updateUser,
      authError, setAuthError, resetPassword, updatePassword, emailConfirmationPending,
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
