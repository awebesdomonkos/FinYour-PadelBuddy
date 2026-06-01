import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, ShieldCheck, ArrowLeft, Eye, EyeOff, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthScreen({ onSelectMode, t, lang, onLangChange }: { onSelectMode: (mode: 'login' | 'register') => void, t: any, lang: string, onLangChange: (l: 'hu' | 'en') => void }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col p-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] overflow-hidden relative">
      <div className="absolute top-[10%] right-[-10%] w-[80%] h-[50%] bg-[#E2FF3B]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[20%] left-[-5%] w-[60%] h-[40%] bg-[#E2FF3B]/5 blur-[100px] rounded-full" />

      {/* Language selector - top right */}
      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <button
          onClick={() => onLangChange('hu')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all ${lang === 'hu' ? 'bg-[#E2FF3B] shadow-lg scale-110' : 'bg-white/10 hover:bg-white/20 opacity-50 hover:opacity-100'}`}
          title="Magyar"
        >
          🇭🇺
        </button>
        <button
          onClick={() => onLangChange('en')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all ${lang === 'en' ? 'bg-[#E2FF3B] shadow-lg scale-110' : 'bg-white/10 hover:bg-white/20 opacity-50 hover:opacity-100'}`}
          title="English"
        >
          🇬🇧
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-[#E2FF3B] rounded-[24px] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(226,255,59,0.2)]">
            <Target className="w-8 h-8 text-[#141414]" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-black uppercase italic leading-[0.8] tracking-tighter mb-4 text-white">
            Padel<br />Buddy
          </h1>
          <p className="text-sm font-bold opacity-60 uppercase tracking-widest text-[#E2FF3B]">
            {t('auth.subTitle')}
          </p>
        </motion.div>

        <div className="w-full space-y-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => onSelectMode('register')}
            className="w-full bg-[#E2FF3B] text-[#141414] py-5 rounded-2xl font-black uppercase tracking-tighter text-sm shadow-[0_10px_30px_rgba(226,255,59,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {t('auth.register')}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => onSelectMode('login')}
            className="w-full bg-white/5 text-white py-5 rounded-2xl font-black uppercase tracking-tighter text-sm hover:bg-white/10 transition-all border border-white/10"
          >
            {t('auth.login')}
          </motion.button>
        </div>

        <div className="mt-16 flex items-center gap-2 opacity-30">
          <ShieldCheck className="w-4 h-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t('auth.secure')}</p>
        </div>
      </div>
    </div>
  );
}

export function RegistrationForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  error,
  t
}: {
  formData: any,
  setFormData: (data: any) => void,
  onSubmit: (e: React.FormEvent) => void,
  onCancel: () => void,
  error: string | null,
  t: any
}) {
  const [showPass, setShowPass] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const lang = formData.lang || 'hu';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdprAccepted) {
      alert(lang === 'hu' ? 'Az adatvédelmi nyilatkozat elfogadása kötelező.' : 'You must accept the privacy policy.');
      return;
    }
    onSubmit(e);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] flex flex-col p-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] font-sans overflow-y-auto">
      <div className="max-w-sm mx-auto w-full flex-1 flex flex-col py-8">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onCancel}
          className="self-start mb-12 p-3 bg-white rounded-2xl shadow-sm border border-black/5 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#141414]" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none mb-4 text-[#141414]">{t('auth.register')}</h2>
          <p className="text-sm opacity-50 font-bold text-[#141414]">{t('auth.subTitle')}</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
            {error}
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white p-4 sm:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-5"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-40 text-[#141414]">{t('auth.usernameLabel')}</label>
            <input
              required
              type="text"
              autoComplete="username"
              placeholder={t('auth.usernamePlaceholder')}
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-40 text-[#141414]">{t('auth.nameLabel')}</label>
            <input
              required
              type="text"
              autoComplete="name"
              placeholder={t('auth.namePlaceholder')}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-40 text-[#141414]">{t('auth.emailLabel')}</label>
            <input
              required
              type="email"
              autoComplete="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value.toLowerCase().trim() })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-40 text-[#141414]">
              {t('auth.phoneLabel')} <span className="normal-case font-normal opacity-60">({lang === 'hu' ? 'opcionális' : 'optional'})</span>
            </label>
            <input
              type="tel"
              autoComplete="tel"
              placeholder={t('auth.phonePlaceholder')}
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-40 text-[#141414]">{t('auth.passwordLabel')}</label>
            <div className="relative">
              <input
                required
                minLength={6}
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('auth.passwordPlaceholder')}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 opacity-40 hover:opacity-70">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* GDPR checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${gdprAccepted ? 'bg-[#141414] border-[#141414]' : 'border-[#141414]/20 group-hover:border-[#141414]/50'}`}
              onClick={() => setGdprAccepted(v => !v)}>
              {gdprAccepted && <svg className="w-3 h-3 text-[#E2FF3B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className="text-xs text-[#141414]/60 leading-relaxed" onClick={() => setGdprAccepted(v => !v)}>
              {lang === 'hu'
                ? <>Elolvastam és elfogadom az <a href="/privacy" target="_blank" className="underline font-bold text-[#141414]" onClick={e => e.stopPropagation()}>Adatvédelmi nyilatkozatot</a>. Az adatkezelés célja a szolgáltatás nyújtása.</>
                : <>I have read and accept the <a href="/privacy" target="_blank" className="underline font-bold text-[#141414]" onClick={e => e.stopPropagation()}>Privacy Policy</a>. Data is processed to provide the service.</>
              }
            </span>
          </label>

          <button
            type="submit"
            disabled={!gdprAccepted}
            className="w-full bg-[#141414] text-[#E2FF3B] py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {t('auth.register')}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

export function LoginForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  error,
  t
}: {
  formData: any,
  setFormData: (data: any) => void,
  onSubmit: (e: React.FormEvent) => void,
  onCancel: () => void,
  error: string | null,
  t: any
}) {
  const [showPass, setShowPass] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const { resetPassword } = useAuth();
  const lang = formData.lang || 'hu';

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    try {
      await resetPassword(resetEmail || formData.email);
      setResetSent(true);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] flex flex-col p-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] font-sans overflow-y-auto">
      <div className="max-w-sm mx-auto w-full flex-1 flex flex-col py-8 justify-center">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onCancel}
          className="self-start mb-12 p-3 bg-white rounded-2xl shadow-sm border border-black/5 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#141414]" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none mb-4 text-[#141414]">{t('auth.login')}</h2>
          <p className="text-sm opacity-50 font-bold text-[#141414]">{t('auth.subTitle')}</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
            {error}
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={onSubmit}
          className="bg-white p-4 sm:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-6"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-40 text-[#141414]">{t('auth.emailLabel')}</label>
            <input
              required
              type="email"
              autoComplete="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value.toLowerCase().trim() })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[#141414]">{t('auth.passwordLabel')}</label>
              <button type="button" onClick={() => setShowForgot(v => !v)}
                className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-colors">
                {lang === 'hu' ? 'Elfelejtett jelszó?' : 'Forgot password?'}
              </button>
            </div>
            <div className="relative">
              <input
                required
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 opacity-40 hover:opacity-70">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showForgot && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {resetSent ? (
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-green-700 font-bold">
                      {lang === 'hu' ? 'Elküldtük a visszaállító linket! Ellenőrizd a postaládád.' : 'Reset link sent! Check your inbox.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReset} className="bg-[#E2FF3B]/20 rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#141414]/50">
                      {lang === 'hu' ? 'Jelszó visszaállítás' : 'Password reset'}
                    </p>
                    {resetError && <p className="text-xs text-red-600 font-bold">{resetError}</p>}
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414]/40" />
                      <input
                        type="email"
                        required
                        placeholder={formData.email || (lang === 'hu' ? 'email@példa.hu' : 'your@email.com')}
                        value={resetEmail}
                        onChange={e => setResetEmail(e.target.value)}
                        className="w-full bg-white/60 rounded-xl py-3 pl-9 pr-4 text-sm outline-none font-bold text-[#141414] placeholder:opacity-40"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full bg-[#141414] text-[#E2FF3B] py-3 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all"
                    >
                      {resetLoading ? '...' : (lang === 'hu' ? 'Link küldése' : 'Send link')}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="w-full bg-[#141414] text-[#E2FF3B] py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
          >
            {t('auth.login')}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

export function EmailConfirmationScreen({ onBack, lang }: { onBack: () => void; lang: 'hu' | 'en' }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full text-center space-y-6"
      >
        <div className="w-20 h-20 bg-[#E2FF3B] rounded-[28px] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(226,255,59,0.2)]">
          <Mail className="w-10 h-10 text-[#141414]" />
        </div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">
          {lang === 'hu' ? 'Erősítsd meg az email-címed!' : 'Confirm your email!'}
        </h2>
        <p className="text-white/60 text-sm font-bold leading-relaxed">
          {lang === 'hu'
            ? 'Küldtünk egy megerősítő emailt. Kattints a benne lévő linkre, majd lépj be.'
            : 'We sent you a confirmation email. Click the link inside, then log in.'}
        </p>
        <button
          onClick={onBack}
          className="w-full bg-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
        >
          {lang === 'hu' ? 'Vissza a bejelentkezéshez' : 'Back to login'}
        </button>
      </motion.div>
    </div>
  );
}
