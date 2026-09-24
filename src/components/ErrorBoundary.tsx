import React from 'react';
import { translations } from '../translations.ts';
import { currentLang } from '../hooks/useI18n.ts';

export default class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean; error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('App Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      const E = (translations as any)[currentLang()].errors;
      return (
        <div className="min-h-screen bg-[#F8F8F5] flex items-center justify-center p-8">
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl" aria-hidden="true">⚠️</span>
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">{E.title}</h2>
              <p className="text-sm opacity-50">{E.body}</p>
            </div>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="w-full py-4 bg-[#141414] text-[#E2FF3B] rounded-2xl font-black uppercase tracking-widest"
            >
              {E.reload}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
