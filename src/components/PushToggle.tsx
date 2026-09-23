import React, { useEffect, useState } from 'react';
import { BellRing, Loader2, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { disablePush, enablePush, getExistingSubscription, getPushSupport, getVapidPublicKey } from '../lib/push.ts';

export default function PushToggle({ t }: { t: (key: string) => string }) {
  const { token } = useAuth();
  const [support] = useState(getPushSupport);
  const [configured, setConfigured] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(() => support === 'supported' && Notification.permission === 'denied');

  useEffect(() => {
    if (support !== 'supported') return;
    let cancelled = false;
    Promise.all([getVapidPublicKey(), getExistingSubscription().catch(() => null)]).then(([key, sub]) => {
      if (cancelled) return;
      setConfigured(Boolean(key));
      setEnabled(Boolean(sub) && Notification.permission === 'granted');
    });
    return () => { cancelled = true; };
  }, [support]);

  if (support === 'needs-install') {
    return (
      <div className="flex gap-3 rounded-2xl bg-[#141414]/5 p-4">
        <Smartphone className="w-5 h-5 shrink-0 opacity-50" aria-hidden="true" />
        <p className="text-xs leading-relaxed opacity-70">{t('push.iosInstall')}</p>
      </div>
    );
  }
  if (support !== 'supported' || !configured || !token) return null;

  const toggle = async () => {
    setBusy(true);
    setError(null);
    try {
      if (enabled) {
        await disablePush(token);
        setEnabled(false);
      } else {
        const permission = await enablePush(token);
        setDenied(permission === 'denied');
        setEnabled(permission === 'granted');
      }
    } catch {
      setError(t('push.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span id="push-toggle-label" className="flex items-center gap-2 text-sm font-bold">
          <BellRing className="w-4 h-4 opacity-60" aria-hidden="true" />
          {t('push.label')}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby="push-toggle-label"
          onClick={toggle}
          disabled={busy || (denied && !enabled)}
          className={`relative w-12 h-7 shrink-0 rounded-full transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414] ${enabled ? 'bg-[#141414]' : 'bg-[#141414]/15'}`}
        >
          <span className={`absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center transition-transform ${enabled ? 'translate-x-5 bg-[#E2FF3B]' : 'bg-white'}`}>
            {busy && <Loader2 className="w-3 h-3 animate-spin text-[#141414]" aria-hidden="true" />}
          </span>
        </button>
      </div>
      <p className="text-xs leading-relaxed opacity-50">{denied && !enabled ? t('push.denied') : t('push.hint')}</p>
      {error && <p role="alert" className="text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}
