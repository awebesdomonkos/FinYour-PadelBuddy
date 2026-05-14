import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';

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

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </RootErrorBoundary>
);
