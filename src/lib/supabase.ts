import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safe diagnostic log (does not print secrets)
if (typeof window !== 'undefined') {
  const hasUrl = Boolean(supabaseUrl);
  const hasKey = Boolean(supabaseAnonKey);
  if (!hasUrl || !hasKey) {
    // eslint-disable-next-line no-console
    console.warn('[supabase] Missing env vars:', { hasUrl, hasKey });
  }
}

// Create a mock client when environment variables are not available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : null;

export default supabase;