import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, MessageSquareHeart, CheckCircle2 } from 'lucide-react';
import { trackedFetch } from '../lib/connectivityStore.ts';
import { useDialogA11y } from '../hooks/useDialogA11y.ts';

const CATEGORIES = ['bug', 'suggestion', 'other'] as const;
type Category = typeof CATEGORIES[number];
const MAX_LENGTH = 2000;

export default function FeedbackForm({ token, t, onClose }: {
  token: string | null,
  t: (key: string) => string,
  onClose: () => void
}) {
  const [category, setCategory] = useState<Category>('suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { dialogProps } = useDialogA11y(onClose);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!message.trim()) { setSubmitError(t('feedback.errorEmpty')); return; }
    setIsSubmitting(true);
    try {
      const res = await trackedFetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ category, message: message.trim(), page: window.location.pathname + window.location.search })
      });
      if (res.ok) {
        setSent(true);
      } else {
        setSubmitError(res.status === 429 ? t('feedback.errorRateLimit') : t('feedback.errorGeneric'));
      }
    } catch {
      setSubmitError(t('feedback.errorNetwork'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <motion.div
        {...dialogProps}
        aria-labelledby="feedback-title"
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="relative w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl outline-none"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E2FF3B] flex items-center justify-center shrink-0">
              <MessageSquareHeart className="w-5 h-5 text-[#141414]" aria-hidden="true" />
            </div>
            <div>
              <h2 id="feedback-title" className="text-lg font-black uppercase tracking-tight">{t('feedback.title')}</h2>
              <p className="text-xs opacity-50">{t('feedback.subtitle')}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t('common.close')} className="w-11 h-11 -mr-2 -mt-2 flex items-center justify-center rounded-xl hover:bg-[#141414]/5 transition-colors">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-6 space-y-4" role="status">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" aria-hidden="true" />
            <p className="font-black uppercase tracking-tight">{t('feedback.thanksTitle')}</p>
            <p className="text-sm opacity-60">{t('feedback.thanksBody')}</p>
            <button type="button" onClick={onClose} data-autofocus className="w-full py-4 bg-[#141414] text-[#E2FF3B] rounded-2xl font-black uppercase tracking-widest text-sm">
              {t('common.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <fieldset>
              <legend className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">{t('feedback.categoryLabel')}</legend>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(c => (
                  <label key={c} className={`cursor-pointer rounded-2xl py-3 px-2 text-center text-xs font-black uppercase tracking-wider border transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#141414] ${category === c ? 'bg-[#141414] text-[#E2FF3B] border-[#141414]' : 'bg-[#141414]/5 border-transparent hover:border-[#141414]/10'}`}>
                    <input type="radio" name="feedback-category" value={c} checked={category === c} onChange={() => setCategory(c)} className="sr-only" />
                    {t(`feedback.categories.${c}`)}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label htmlFor="feedback-message" className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('feedback.messageLabel')}</label>
              <textarea
                id="feedback-message"
                data-autofocus
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, MAX_LENGTH))}
                rows={5}
                maxLength={MAX_LENGTH}
                placeholder={t('feedback.messagePlaceholder')}
                aria-describedby="feedback-counter"
                className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-5 text-base sm:text-sm outline-none focus:ring-2 focus:ring-[#E2FF3B] resize-none"
              />
              <p id="feedback-counter" className="text-[10px] text-right opacity-40 font-bold">{message.length} / {MAX_LENGTH}</p>
            </div>

            <p className="text-[11px] leading-relaxed opacity-50">{t('feedback.privacyNote')}</p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#141414] text-[#E2FF3B] py-4 rounded-2xl font-black uppercase tracking-widest text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting
                ? <><div className="w-4 h-4 border-2 border-[#E2FF3B]/30 border-t-[#E2FF3B] rounded-full animate-spin" aria-hidden="true" />{t('feedback.sending')}</>
                : t('feedback.submit')}
            </button>
            {submitError && <p role="alert" className="text-xs font-bold text-red-600 text-center">{submitError}</p>}
          </form>
        )}
      </motion.div>
    </div>
  );
}
