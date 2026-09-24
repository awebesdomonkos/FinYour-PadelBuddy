export type ConnectivitySnapshot = {
  isOnline: boolean;
  backendDown: boolean;
  retrying: boolean;
};

type RetryFn = () => unknown;

const FAILURE_THRESHOLD = 2;
const BASE_BACKOFF_MS = 5_000;
const MAX_BACKOFF_MS = 60_000;

let snapshot: ConnectivitySnapshot = {
  isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
  backendDown: false,
  retrying: false,
};
const listeners = new Set<() => void>();
const retryFns = new Set<RetryFn>();
let consecutiveFailures = 0;
let backoffMs = BASE_BACKOFF_MS;
let backoffTimer: ReturnType<typeof setTimeout> | null = null;

function setSnapshot(patch: Partial<ConnectivitySnapshot>) {
  const next = { ...snapshot, ...patch };
  if (next.isOnline === snapshot.isOnline && next.backendDown === snapshot.backendDown && next.retrying === snapshot.retrying) return;
  snapshot = next;
  listeners.forEach(l => l());
}

function clearBackoff() {
  if (backoffTimer) clearTimeout(backoffTimer);
  backoffTimer = null;
}

function scheduleBackoff() {
  if (backoffTimer) return;
  backoffTimer = setTimeout(() => {
    backoffTimer = null;
    if (!snapshot.backendDown) return;
    backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
    // Offline: the 'online' event triggers the retry, just keep the loop alive.
    if (!snapshot.isOnline) { scheduleBackoff(); return; }
    void retryNow().finally(() => {
      if (snapshot.backendDown) scheduleBackoff();
    });
  }, backoffMs);
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getSnapshot() {
  return snapshot;
}

export function reportSuccess() {
  consecutiveFailures = 0;
  backoffMs = BASE_BACKOFF_MS;
  clearBackoff();
  setSnapshot({ backendDown: false });
}

// `definite`: the caller already retried internally (e.g. supabase-js auth), so trip immediately.
export function reportFailure(opts: { definite?: boolean } = {}) {
  consecutiveFailures += opts.definite ? FAILURE_THRESHOLD : 1;
  if (consecutiveFailures >= FAILURE_THRESHOLD) {
    setSnapshot({ backendDown: true });
    scheduleBackoff();
  }
}

export function registerRetry(fn: RetryFn) {
  retryFns.add(fn);
  return () => { retryFns.delete(fn); };
}

export async function retryNow() {
  if (snapshot.retrying) return;
  setSnapshot({ retrying: true });
  try {
    await Promise.allSettled([...retryFns].map(fn => Promise.resolve().then(fn)));
  } finally {
    setSnapshot({ retrying: false });
  }
}

// Every client call to our API should go through here so outages are detected in one place.
// Only network failures and 5xx count as "backend down"; 4xx means the backend answered.
export async function trackedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch (err) {
    reportFailure();
    throw err;
  }
  if (response.status >= 500) reportFailure();
  else if (response.ok) reportSuccess();
  return response;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setSnapshot({ isOnline: true });
    void retryNow();
  });
  window.addEventListener('offline', () => setSnapshot({ isOnline: false }));
}
