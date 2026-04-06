import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avrmnneeceztwgtihxue.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cm1ubmVlY2V6dHdndGloeHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjA1MjQsImV4cCI6MjA5MDk5NjUyNH0.TNyc0ciWXjF-cfNSifhiCOLOY5x4CYdiBMMYvUIofsc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)