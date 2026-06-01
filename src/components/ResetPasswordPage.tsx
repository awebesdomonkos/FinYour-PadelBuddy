import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const lang = navigator.language.startsWith('hu') ? 'hu' : 'en';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(lang === 'hu' ? 'A két jelszó nem egyezik.' : 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError(lang === 'hu' ? 'A jelszó legalább 6 karakter legyen.' : 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full"
      >
        {done ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-[#E2FF3B] rounded-[28px] flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-[#141414]" />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-[#141414]">
              {lang === 'hu' ? 'Jelszó megváltoztatva!' : 'Password updated!'}
            </h2>
            <p className="text-sm text-[#141414]/60 font-bold">
              {lang === 'hu' ? 'Most már beléphetsz az új jelszavaddal.' : 'You can now log in with your new password.'}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-[#141414] text-[#E2FF3B] py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
            >
              {lang === 'hu' ? 'Bejelentkezés' : 'Log in'}
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => window.location.href = '/'}
              className="mb-10 p-3 bg-white rounded-2xl shadow-sm border border-black/5 hover:bg-gray-50 transition-colors inline-flex"
            >
              <ArrowLeft className="w-5 h-5 text-[#141414]" />
            </button>

            <div className="mb-8">
              <div className="w-14 h-14 bg-[#141414] rounded-2xl flex items-center justify-center mb-6">
                <KeyRound className="w-7 h-7 text-[#E2FF3B]" />
              </div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#141414] mb-2">
                {lang === 'hu' ? 'Új jelszó' : 'New password'}
              </h2>
              <p className="text-sm text-[#141414]/50 font-bold">
                {lang === 'hu' ? 'Add meg az új jelszavadat.' : 'Enter your new password.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-40 text-[#141414]">
                  {lang === 'hu' ? 'Új jelszó' : 'New password'}
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-40 text-[#141414]">
                  {lang === 'hu' ? 'Jelszó megerősítése' : 'Confirm password'}
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#141414] text-[#E2FF3B] py-5 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {loading ? '...' : (lang === 'hu' ? 'Mentés' : 'Save')}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
