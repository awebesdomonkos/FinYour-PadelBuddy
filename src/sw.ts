/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute, type PrecacheEntry } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<PrecacheEntry | string> };

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Serve the precached app shell for every in-app route, so the app opens offline.
// (Dev builds have no precached index.html, and createHandlerBoundToURL would throw.)
if (!import.meta.env.DEV) {
  registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/api\//] }));
}

// Public boot config (Supabase URL + anon key) — lets the app start offline and show the offline notice.
// Authenticated /api/* and Supabase responses are deliberately NOT cached: the cache is keyed by URL only,
// so on a shared device one user's data could be served to the next user.
registerRoute(
  ({ url, sameOrigin }) => sameOrigin && url.pathname === '/api/config',
  new NetworkFirst({ cacheName: 'padel-config', networkTimeoutSeconds: 4 }),
);

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

type PushMessage = { title?: string; body?: string; url?: string; tag?: string };

self.addEventListener('push', event => {
  let msg: PushMessage = {};
  try {
    msg = event.data?.json() ?? {};
  } catch {
    msg = { body: event.data?.text() };
  }
  event.waitUntil(
    self.registration.showNotification(msg.title || 'Padel Buddy', {
      body: msg.body,
      icon: '/icon-192.png',
      tag: msg.tag,
      data: { url: msg.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = windows.find(w => new URL(w.url).origin === self.location.origin);
    if (open) {
      // Let the running app route in place; a navigation would reload it and lose unsaved input.
      await open.focus();
      open.postMessage({ type: 'NOTIFICATION_CLICK', url });
      return;
    }
    await self.clients.openWindow(url);
  })());
});
