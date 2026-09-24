import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Inbox, RefreshCw } from 'lucide-react';
import { trackedFetch } from '../lib/connectivityStore.ts';
import { useDialogA11y } from '../hooks/useDialogA11y.ts';

type FeedbackStatus = 'new' | 'reviewed' | 'resolved';
type FeedbackItem = {
  id: string; category: 'bug' | 'suggestion' | 'other'; message: string; page: string | null;
  userAgent: string | null; status: FeedbackStatus; createdAt: string;
  userId: string | null; userName: string | null; userEmail: string | null;
};
const STATUSES: FeedbackStatus[] = ['new', 'reviewed', 'resolved'];

export default function FeedbackAdminView({ token, t, lang, onClose }: {
  token: string | null,
  t: (key: string) => string,
  lang: string,
  onClose: () => void
}) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FeedbackStatus | 'all'>('new');
  const [savingId, setSavingId] = useState<string | null>(null);
  const { dialogProps } = useDialogA11y(onClose);

  const headers = { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await trackedFetch('/api/feedback', { headers });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message);
      setItems(json.data || []);
    } catch {
      setError(t('feedback.admin.loadError'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, t]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: FeedbackStatus) => {
    const previous = items;
    setSavingId(id);
    setItems(list => list.map(i => i.id === id ? { ...i, status } : i));
    try {
      const res = await trackedFetch(`/api/feedback/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error();
    } catch {
      setItems(previous);
      setError(t('feedback.admin.saveError'));
    } finally {
      setSavingId(null);
    }
  };

  const visible = filter === 'all' ? items : items.filter(i => i.status === filter);
  const dateFmt = new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <motion.div
        {...dialogProps}
        aria-labelledby="feedback-admin-title"
        initial={{ x: '100%' }} animate={{ x: 0 }}
        className="relative w-full max-w-lg h-full bg-[#F5F5F0] shadow-2xl flex flex-col outline-none pt-[env(safe-area-inset-top,0px)]"
      >
        <div className="flex items-center justify-between gap-3 p-5 border-b border-[#141414]/10 bg-white">
          <h2 id="feedback-admin-title" className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <Inbox className="w-5 h-5" aria-hidden="true" /> {t('feedback.admin.title')}
          </h2>
          <div className="flex gap-1">
            <button type="button" onClick={load} aria-label={t('feedback.admin.refresh')} className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-[#141414]/5">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
            <button type="button" onClick={onClose} aria-label={t('common.close')} className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-[#141414]/5">
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-3 overflow-x-auto" role="group" aria-label={t('feedback.admin.filterLabel')}>
          {(['new', 'reviewed', 'resolved', 'all'] as const).map(f => {
            const count = f === 'all' ? items.length : items.filter(i => i.status === f).length;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${filter === f ? 'bg-[#141414] text-[#E2FF3B]' : 'bg-white border border-[#141414]/5'}`}
              >
                {f === 'all' ? t('common.all') : t(`feedback.statuses.${f}`)} · {count}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] space-y-3" aria-busy={loading}>
          {error && <p role="alert" className="text-xs font-bold text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}
          {!loading && visible.length === 0 && !error && (
            <p className="text-center text-xs font-black uppercase tracking-widest opacity-30 py-12">{t('feedback.admin.empty')}</p>
          )}
          {visible.map(item => (
            <article key={item.id} className="bg-white rounded-2xl p-4 border border-[#141414]/5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.category === 'bug' ? 'bg-red-100 text-red-700' : item.category === 'suggestion' ? 'bg-[#E2FF3B] text-[#141414]' : 'bg-[#141414]/10'}`}>
                    {t(`feedback.categories.${item.category}`)}
                  </span>
                  <p className="text-[11px] opacity-50 mt-1 truncate">
                    {item.userName || t('feedback.admin.deletedUser')}{item.userEmail ? ` · ${item.userEmail}` : ''}
                  </p>
                  <p className="text-[10px] opacity-40">{dateFmt.format(new Date(item.createdAt))}</p>
                </div>
                <label className="shrink-0">
                  <span className="sr-only">{t('feedback.admin.statusLabel')}</span>
                  <select
                    value={item.status}
                    disabled={savingId === item.id}
                    onChange={e => updateStatus(item.id, e.target.value as FeedbackStatus)}
                    className="bg-[#141414]/5 rounded-xl py-2 px-3 text-base sm:text-xs font-bold outline-none focus:ring-2 focus:ring-[#E2FF3B]"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{t(`feedback.statuses.${s}`)}</option>)}
                  </select>
                </label>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{item.message}</p>
              {(item.page || item.userAgent) && (
                <p className="text-[10px] opacity-40 break-all">{[item.page, item.userAgent].filter(Boolean).join(' · ')}</p>
              )}
            </article>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
