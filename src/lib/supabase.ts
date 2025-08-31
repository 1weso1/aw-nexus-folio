import { createClient } from '@supabase/supabase-js';

// Use environment variables from Vite
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Supabase env check:', { 
  url: url ? 'present' : 'missing', 
  key: key ? 'present' : 'missing',
  fullUrl: url,
  keyPreview: key ? key.substring(0, 20) + '...' : 'missing'
});

if (!url || !key) {
  // visible at runtime so we instantly know if env is missing
  // eslint-disable-next-line no-console
  console.error('Supabase env missing:', { url: !!url, key: !!key });
}

export const supabase = createClient(url, key);