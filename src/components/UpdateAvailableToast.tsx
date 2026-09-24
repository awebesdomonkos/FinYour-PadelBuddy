/// <reference types="vite-plugin-pwa/react" />
import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UPDATE_CHECK_MS = 60 * 60 * 1000;

const COPY = {
  hu: { title: 'Új verzió érhető el', reload: 'Frissítés', later: 'Később' },
  en: { title: 'A new version is available', reload: 'Update', later: 'Later' },
};

export default function UpdateAvailableToast() {
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // An installed PWA can stay open for days — check for new deploys periodically.
      if (registration) setInterval(() => { void registration.update(); }, UPDATE_CHECK_MS);
    },
  });

  if (!needRefresh) return null;
  const c = COPY[document.documentElement.lang === 'en' ? 'en' : 'hu'];

  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 bottom-28 z-[90] flex justify-center px-4 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="w-full max-w-sm bg-[#141414] text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
        <RefreshCw className="w-5 h-5 text-[#E2FF3B] shrink-0" aria-hidden="true" />
        <p className="flex-1 text-sm font-bold">{c.title}</p>
        <button
          type="button"
          onClick={() => void updateServiceWorker(true)}
          className="shrink-0 bg-[#E2FF3B] text-[#141414] text-xs font-black uppercase tracking-widest px-3 py-2 rounded-xl"
        >
          {c.reload}
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          aria-label={c.later}
          className="shrink-0 p-2 -m-1 rounded-xl text-white/60 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
