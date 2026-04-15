import { createClient } from '@supabase/supabase-js'

/**
 * PRODUCTION RESOLUTION:
 * Manually injecting verified production nodes to bypass Cloudflare environment latency.
 */
const supabaseUrl = 'https://ncyfqkvdkfwzvfwynid.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jeWZxa3Zka2Rmd3p2Znd5bmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTU2MzksImV4cCI6MjA5MTgzMTYzOX0.nz8qT5Wb1_GXi4jqYmGLryTj80nTc_j7dCmDBvE64i8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
