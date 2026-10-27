
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const cleanUrl = rawUrl
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/i, '');

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    cleanUrl &&
    supabaseAnonKey &&
    !cleanUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder') &&
    /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/i.test(cleanUrl)
  );
};

const safeUrl = isSupabaseConfigured()
  ? cleanUrl
  : 'https://placeholder.supabase.co';

const safeKey = isSupabaseConfigured()
  ? supabaseAnonKey
  : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(
  safeUrl,
  safeKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
