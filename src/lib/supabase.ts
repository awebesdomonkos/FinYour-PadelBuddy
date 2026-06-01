import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Config is loaded async from /api/config so we don't need VITE_ env vars.
// VITE_ vars still work as a local-dev override.
let _supabase: SupabaseClient | null = null;
let _initPromise: Promise<SupabaseClient> | null = null;

async function initSupabase(): Promise<SupabaseClient> {
  // Local dev override via VITE_ env vars
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (envUrl && envKey) {
    return createClient(envUrl, envKey);
  }

  // Fetch public config from server (server knows SUPABASE_URL + anon key)
  const res = await fetch('/api/config');
  if (!res.ok) throw new Error('Failed to load Supabase config from /api/config');
  const { supabaseUrl, supabaseAnonKey } = await res.json();
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Invalid Supabase config from server');
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

// Convenience: synchronous access after init (throws if called before init)
export function supabaseSync(): SupabaseClient {
  if (!_supabase) throw new Error('Supabase not initialized yet — await getSupabase() first');
  return _supabase;
}

// Re-export a proxy that auto-initializes for the common import pattern.
// Usage: import { supabase } from './lib/supabase'  — same as before
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) throw new Error('Supabase not initialized — call and await initSupabaseClient() first');
    return (_supabase as any)[prop];
  }
});

// Call this once at app startup before rendering
export async function initSupabaseClient(): Promise<void> {
  await getSupabase();
}
