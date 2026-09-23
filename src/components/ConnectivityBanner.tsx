import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { WifiOff, ServerCrash, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { subscribe, getSnapshot, retryNow } from '../lib/connectivityStore.ts';

const DISMISS_MS = 60_000;
const RECOVERED_MS = 2_500;

const COPY = {
  hu: {
    offlineTitle: 'Nincs internetkapcsolat',
    offlineBody: 'Amint újra online leszel, automatikusan frissítjük az adatokat.',
    downTitle: 'A szerver jelenleg nem érhető el',
    downBody: 'Automatikusan újrapróbáljuk. A megjelenített adatok elavultak lehetnek.',
    retry: 'Újra',
    retrying: 'Próbálkozás…',
    dismiss: 'Értesítés elrejtése',
    recovered: 'Kapcsolat helyreállt',
  },
  en: {
    offlineTitle: "You're offline",
    offlineBody: "We'll refresh your data automatically once you're back online.",
    downTitle: "Can't reach the server right now",
    downBody: "We'll keep retrying automatically. What you see may be out of date.",
    retry: 'Retry',
    retrying: 'Retrying…',
    dismiss: 'Hide notice',
    recovered: 'Connection restored',
  },
};

export default function ConnectivityBanner() {
  const { isOnline, backendDown, retrying } = useSyncExternalStore(subscribe, getSnapshot);
  const failing = !isOnline || backendDown;
  const [dismissedUntil, setDismissedUntil] = useState(0);
  const [showRecovered, setShowRecovered] = useState(false);
  const [, forceTick] = useState(0);
  const wasFailing = useRef(false);

  useEffect(() => {
    if (failing) {
      wasFailing.current = true;
      return;
    }
    setDismissedUntil(0);
    if (!wasFailing.current) return;
    wasFailing.current = false;
    setShowRecovered(true);
    const t = setTimeout(() => setShowRecovered(false), RECOVERED_MS);
    return () => clearTimeout(t);
  }, [failing]);

  useEffect(() => {
    if (!dismissedUntil) return;
    const t = setTimeout(() => forceTick(n => n + 1), Math.max(0, dismissedUntil - Date.now()) + 50);
    return () => clearTimeout(t);
  }, [dismissedUntil]);

  const lang = document.documentElement.lang === 'en' ? 'en' : 'hu';
  const c = COPY[lang];
  const visible = failing && Date.now() >= dismissedUntil;

  if (!visible && !showRecovered) return null;

  if (!visible) {
    return (
      <div role="status" aria-live="polite" className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pointer-events-none">
        <div className="flex items-center gap-2 bg-[#E2FF3B] text-[#141414] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          {c.recovered}
        </div>
      </div>
    );
  }

  const offline = !isOnline;
  const Icon = offline ? WifiOff : ServerCrash;

  return (
    <div role="alert" className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-[calc(0.5rem+env(safe-area-inset-top,0px))]">
      <div className="w-full max-w-xl bg-[#141414] text-white rounded-2xl shadow-2xl px-4 py-3 flex items-start gap-3">
        <Icon className="w-5 h-5 text-[#E2FF3B] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black uppercase tracking-tight">{offline ? c.offlineTitle : c.downTitle}</p>
          <p className="text-xs text-white/60 mt-0.5 leading-snug">{offline ? c.offlineBody : c.downBody}</p>
        </div>
        {!offline && (
          <button
            type="button"
            onClick={() => void retryNow()}
            disabled={retrying}
            className="shrink-0 flex items-center gap-1.5 bg-[#E2FF3B] text-[#141414] text-xs font-black uppercase tracking-widest px-3 py-2 rounded-xl disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} aria-hidden="true" />
            {retrying ? c.retrying : c.retry}
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissedUntil(Date.now() + DISMISS_MS)}
          aria-label={c.dismiss}
          className="shrink-0 p-2 -m-1 rounded-xl text-white/60 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
