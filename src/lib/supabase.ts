import { createClient } from '@supabase/supabase-js';

const url =
  import.meta.env.VITE_SUPABASE_URL ??
  (typeof process !== 'undefined' ? (process as any).env?.NEXT_PUBLIC_SUPABASE_URL : undefined);

const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  (typeof process !== 'undefined' ? (process as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined);

if (!url || !key) {
  // Visible signal in dev/preview if env is missing
  console.error('Supabase env missing', { hasUrl: !!url, hasKey: !!key });
}

export const supabase = createClient(url!, key!);