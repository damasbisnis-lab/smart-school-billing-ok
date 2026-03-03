// =====================================================
// SUPABASE CLIENT CONFIGURATION
// =====================================================
// Konfigurasi client Supabase untuk koneksi database
// =====================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Konfigurasi dari environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Buat client Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function untuk cek koneksi
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('sekolah').select('count', { count: 'exact', head: true });
    return !error;
  } catch {
    return false;
  }
}

// Export tipe untuk digunakan di seluruh aplikasi
export type SupabaseClient = typeof supabase;
