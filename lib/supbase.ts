import { createClient } from '@supabase/supabase-js'

// These match the names in your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// This creates the connection to your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)