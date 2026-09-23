import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Session, isAuthRetryableFetchError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { reportFailure, reportSuccess, registerRetry } from '../lib/connectivityStore';
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
  clearEmailConfirmationPending: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const UNREACHABLE_MSG = 'A szerver jelenleg nem érhető el. Próbáld újra pár perc múlva.';
const SLOW_START_MS = 8_000;

class BackendUnreachableError extends Error {}

// Plain boolean (not a type guard): the guard would narrow AuthError to `never` in the else branch.
const isUnreachable = (error: unknown): boolean => isAuthRetryableFetchError(error);

// null = the profile row doesn't exist yet (legitimate, e.g. right after email-confirm signup).
// Throws BackendUnreachableError when Supabase can't be reached, so callers don't mistake an outage for a missing profile.
async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data, error, status } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error && (status === 0 || status >= 500)) {
    reportFailure();
    throw new BackendUnreachableError(error.message);
  }
  reportSuccess();
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
    const meta = session.user.user_metadata || {};
    const minimalUser = {
      id: session.user.id,
      email: session.user.email || '',
      name: meta.name || meta.full_name || session.user.email || '',
    } as User;
    try {
      const profile = await fetchUserProfile(session.user.id);
      // No profile row yet — fall back to auth metadata
      setCurrentUser(profile || minimalUser);
    } catch (err) {
      if (!(err instanceof BackendUnreachableError)) throw err;
      // Keep the already-loaded profile during an outage instead of degrading it
      setCurrentUser(prev => (prev?.id === session.user.id ? prev : minimalUser));
    }
  }, []);

  useEffect(() => {
    let unregisterRetry: (() => void) | null = null;

    const loadSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      // A retryable error means Supabase is unreachable; the stored session is kept,
      // so the user is NOT logged out — retry instead of showing the login screen as if they were.
      if (error && isUnreachable(error)) {
        reportFailure({ definite: true });
        if (!unregisterRetry) unregisterRetry = registerRetry(loadSession);
        return;
      }
      unregisterRetry?.();
      unregisterRetry = null;
      await hydrateUser(session);
    };

    // supabase-js retries a failing token refresh for ~25s before giving up; don't hold the
    // user on a spinner that long — surface the outage and let the refresh continue in the background.
    const slowStartTimer = setTimeout(() => {
      reportFailure({ definite: true });
      if (!unregisterRetry) unregisterRetry = registerRetry(loadSession);
      setLoading(false);
    }, SLOW_START_MS);

    loadSession()
      .catch(err => console.error('Session load failed', err))
      .finally(() => {
        clearTimeout(slowStartTimer);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateUser(session).catch(err => console.error('Session hydrate failed', err));
    });

    return () => {
      subscription.unsubscribe();
      unregisterRetry?.();
    };
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
      const unreachable = isUnreachable(error);
      if (unreachable) reportFailure({ definite: true });
      const msg = unreachable
        ? UNREACHABLE_MSG
        : error.message === 'Email not confirmed'
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
      const unreachable = isUnreachable(error);
      if (unreachable) reportFailure({ definite: true });
      const msg = unreachable ? UNREACHABLE_MSG : error.message;
      setAuthError(msg);
      throw new Error(msg);
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

  const clearEmailConfirmationPending = () => setEmailConfirmationPending(false);

  return (
    <AuthContext.Provider value={{
      currentUser, token, loading, login, register, logout, updateUser,
      authError, setAuthError, resetPassword, updatePassword,
      emailConfirmationPending, clearEmailConfirmationPending,
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
