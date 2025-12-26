import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging - remove after fixing env var issue
console.log('[Supabase Init] Environment check:', {
  VITE_SUPABASE_URL: supabaseUrl ? `SET (${supabaseUrl.substring(0, 30)}...)` : 'MISSING',
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? `SET (${supabaseAnonKey.substring(0, 20)}...)` : 'MISSING',
  allEnvKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')),
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase Init] FATAL: Missing environment variables!');
  throw new Error("Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "sb-auth-token", // Matches what your auth.ts is looking for
  },
});