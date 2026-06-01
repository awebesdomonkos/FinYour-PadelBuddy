import React from 'react';
import { motion } from 'motion/react';
import { Target, ShieldCheck, ArrowLeft } from 'lucide-react';

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
          onSubmit={onSubmit}
          className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-6"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-40 text-[#141414]">{t('auth.usernameLabel')}</label>
            <input
              required
              type="text"
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
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value.toLowerCase().trim() })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-40 text-[#141414]">{t('auth.phoneLabel')}</label>
            <input
              required
              type="tel"
              placeholder={t('auth.phonePlaceholder')}
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-40 text-[#141414]">{t('auth.passwordLabel')}</label>
            <input
              required
              minLength={6}
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#141414] text-[#E2FF3B] py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 mt-4"
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
          className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-6"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-40 text-[#141414]">{t('auth.emailLabel')}</label>
            <input
              required
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value.toLowerCase().trim() })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-40 text-[#141414]">{t('auth.passwordLabel')}</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none font-bold text-[#141414]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#141414] text-[#E2FF3B] py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 mt-4"
          >
            {t('auth.login')}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
