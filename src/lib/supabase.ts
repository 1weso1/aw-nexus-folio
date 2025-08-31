import { createClient } from '@supabase/supabase-js';

// Using hardcoded values since Lovable doesn't support VITE_ env variables
const url = "https://ugjeubqwmgnqvohmrkyv.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamV1YnF3bWducXZvaG1ya3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzc5NDEsImV4cCI6MjA3MjA1Mzk0MX0.esXYyxM-eQbKBXhG2NKrzLsdiveNo4lBsK_rlv_ebjo";

if (!url || !key) {
  // visible at runtime so we instantly know if env is missing
  // eslint-disable-next-line no-console
  console.error('Supabase env missing:', { url: !!url, key: !!key });
}

export const supabase = createClient(url, key);