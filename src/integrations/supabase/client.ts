import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kgiyhrfamrfftefvoqqo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnaXlocmZhbXJmZnRlZnZvcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzYxNzEsImV4cCI6MjA3MTIxMjE3MX0.fMF6x59MBzMLtjl8kmVHABRERoOjlg7l4O9y5FBt6w0";

// Validate required parameters
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Supabase URL and publishable key are required');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});