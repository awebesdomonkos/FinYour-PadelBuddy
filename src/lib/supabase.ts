import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _initPromise: Promise<SupabaseClient> | null = null;

async function initSupabase(): Promise<SupabaseClient> {
  // Local dev override via VITE_ env vars (safe: build-time, not runtime)
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (envUrl && envKey) {
    return createClient(envUrl, envKey);
  }

  // Production: fetch public config from server.
  // Server only exposes SUPABASE_ANON_KEY (never service_role key).
  const res = await fetch('/api/config');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Config fetch failed (${res.status}). Add SUPABASE_ANON_KEY to Vercel env vars.`);
  }
  const { supabaseUrl, supabaseAnonKey } = await res.json();
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Invalid Supabase config. Add SUPABASE_ANON_KEY to Vercel env vars.');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export function getSupabase(): Promise<SupabaseClient> {
  if (_supabase) return Promise.resolve(_supabase);
  if (!_initPromise) {
    _initPromise = initSupabase().then(client => {
      _supabase = client;
      return client;
    });
  }
  return _initPromise;
}

// Synchronous accessor — only safe after initSupabaseClient() resolves
export function supabaseSync(): SupabaseClient {
  if (!_supabase) throw new Error('Supabase not initialized yet — await initSupabaseClient() first');
  return _supabase;
}

// Proxy for the common `import { supabase } from './lib/supabase'` pattern.
// Works after initSupabaseClient() has resolved.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) throw new Error('Supabase not initialized — await initSupabaseClient() first');
    return (_supabase as any)[prop];
  }
});

export async function initSupabaseClient(): Promise<void> {
  await getSupabase();
}
