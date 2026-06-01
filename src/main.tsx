import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import PrivacyPolicy from './components/PrivacyPolicy.tsx';
import ResetPasswordPage from './components/ResetPasswordPage.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { initSupabaseClient } from './lib/supabase.ts';

class RootErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.error('Root error:', error); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', background: '#F8F8F5' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Hiba történt</h2>
            <p style={{ opacity: 0.5, marginBottom: '1.5rem' }}>Kérjük frissítsd az oldalt</p>
            <button onClick={() => window.location.reload()} style={{ background: '#141414', color: '#E2FF3B', border: 'none', padding: '1rem 2rem', borderRadius: '1rem', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Újratöltés
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const pathname = window.location.pathname;

// Init Supabase client (fetches config from /api/config if VITE_ vars not set)
// then mount the React tree
initSupabaseClient()
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <RootErrorBoundary>
        {pathname === '/privacy' ? (
          <PrivacyPolicy onBack={() => window.history.back()} />
        ) : pathname === '/reset-password' ? (
          <AuthProvider>
            <ResetPasswordPage />
          </AuthProvider>
        ) : (
          <AuthProvider>
            <App />
          </AuthProvider>
        )}
      </RootErrorBoundary>
    );
  })
  .catch((err) => {
    console.error('Failed to initialize Supabase:', err);
    document.getElementById('root')!.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;background:#F8F8F5;">
        <div style="text-align:center;padding:2rem;">
          <div style="font-size:3rem;margin-bottom:1rem">⚠️</div>
          <h2 style="font-weight:900;text-transform:uppercase;margin-bottom:.5rem">Konfigurációs hiba</h2>
          <p style="opacity:.5;margin-bottom:1.5rem">Nem sikerült betölteni a szerver konfigurációt. Kérjük próbáld újra.</p>
          <button onclick="location.reload()" style="background:#141414;color:#E2FF3B;border:none;padding:1rem 2rem;border-radius:1rem;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:.1em">
            Újratöltés
          </button>
        </div>
      </div>`;
  });
