import { trackedFetch } from './connectivityStore.ts';

export type PushSupport = 'supported' | 'needs-install' | 'unsupported';

const SUBSCRIBE_TIMEOUT_MS = 20_000;

// iOS/iPadOS only exposes PushManager to a PWA launched from the Home Screen (16.4+).
export function getPushSupport(): PushSupport {
  if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) return 'supported';
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  return isIOS && !standalone ? 'needs-install' : 'unsupported';
}

let vapidKeyPromise: Promise<string> | null = null;

export function getVapidPublicKey(): Promise<string> {
  vapidKeyPromise ??= fetch('/api/config')
    .then(r => (r.ok ? r.json() : {}))
    .then((c: { vapidPublicKey?: string }) => c.vapidPublicKey || '')
    .catch(() => {
      vapidKeyPromise = null;
      return '';
    });
  return vapidKeyPromise;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

function sameKey(a: ArrayBuffer | null | undefined, b: Uint8Array): boolean {
  if (!a) return false;
  const x = new Uint8Array(a);
  return x.length === b.length && x.every((v, i) => v === b[i]);
}

async function registration(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) throw new Error('no-service-worker');
  return reg;
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (getPushSupport() !== 'supported') return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}

async function saveSubscription(sub: PushSubscription, token: string) {
  const res = await trackedFetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(sub.toJSON()),
  });
  if (!res.ok) throw new Error('subscribe-failed');
}

// Must be called from a user gesture (permission prompt).
export async function enablePush(token: string): Promise<NotificationPermission> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission;
  const key = await getVapidPublicKey();
  if (!key) throw new Error('push-not-configured');
  const serverKey = urlBase64ToUint8Array(key);
  const reg = await registration();
  let sub = await reg.pushManager.getSubscription();
  // A subscription made with a rotated VAPID key can't receive our pushes anymore.
  if (sub && !sameKey(sub.options.applicationServerKey, serverKey)) {
    await sub.unsubscribe();
    sub = null;
  }
  // subscribe() can hang indefinitely when the browser's push service is unreachable
  // (blocked networks, some Chromium forks) — fail instead of spinning forever.
  sub ??= await Promise.race([
    reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: serverKey }),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('push-subscribe-timeout')), SUBSCRIBE_TIMEOUT_MS)),
  ]);
  await saveSubscription(sub, token);
  return permission;
}

// Re-attach an existing browser subscription to the current account (e.g. after a re-login).
export async function syncExistingSubscription(token: string) {
  const sub = await getExistingSubscription();
  if (sub && Notification.permission === 'granted') await saveSubscription(sub, token).catch(() => {});
}

export async function disablePush(token: string | null) {
  const sub = await getExistingSubscription().catch(() => null);
  if (!sub) return;
  if (token) {
    await trackedFetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    }).catch(() => {});
  }
  await sub.unsubscribe().catch(() => {});
}
