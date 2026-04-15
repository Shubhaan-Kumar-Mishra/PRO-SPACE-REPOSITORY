import { createClient } from '@supabase/supabase-js'

// PRODUCTION HARDENING: Securely retrieve or fallback to environment nodes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('CRITICAL: Supabase Infrastructure nodes not found. System running in disconnected mode.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
)
