import { createClient } from '@supabase/supabase-js'

// PRODUCTION FALLBACK: Ensuring stability on Cloudflare Pages
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ncyfqkvdkfwzvfwynid.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jeWZxa3Zka2Z3enZmd3luaWQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0NDczNDA2OSwiZXhwIjoyMDYwMzEwMDY5fQ.L-H_FzIqXG1XIsF1rN_X-uO3I_Y3X-uO3I_Y3X-uO3I' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
