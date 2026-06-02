import { createClient } from '@supabase/supabase-js';

let _supabase = null;

export function getSupabase() {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === 'your-supabase-url-here') {
    return null;
  }

  _supabase = createClient(url, key);
  return _supabase;
}

export const supabase = typeof window !== 'undefined' ? getSupabase() : null;
