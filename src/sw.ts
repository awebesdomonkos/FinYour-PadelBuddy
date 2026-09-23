/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute, type PrecacheEntry } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<PrecacheEntry | string> };

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Serve the precached app shell for every in-app route, so the app opens offline.
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/api\//] }));

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
