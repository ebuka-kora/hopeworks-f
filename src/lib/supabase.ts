import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in frontend/.env');
    }
    client = createClient(url, anonKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}

// Convenience alias used by AuthContext and apiClient
export const supabase = {
  auth: {
    getSession: () => getSupabase().auth.getSession(),
    onAuthStateChange: (...args: Parameters<SupabaseClient['auth']['onAuthStateChange']>) =>
      getSupabase().auth.onAuthStateChange(...args),
    signInWithPassword: (...args: Parameters<SupabaseClient['auth']['signInWithPassword']>) =>
      getSupabase().auth.signInWithPassword(...args),
    signUp: (...args: Parameters<SupabaseClient['auth']['signUp']>) =>
      getSupabase().auth.signUp(...args),
    signOut: () => getSupabase().auth.signOut(),
    resetPasswordForEmail: (...args: Parameters<SupabaseClient['auth']['resetPasswordForEmail']>) =>
      getSupabase().auth.resetPasswordForEmail(...args),
    updateUser: (...args: Parameters<SupabaseClient['auth']['updateUser']>) =>
      getSupabase().auth.updateUser(...args),
    signInWithOAuth: (...args: Parameters<SupabaseClient['auth']['signInWithOAuth']>) =>
      getSupabase().auth.signInWithOAuth(...args),
  },
};
