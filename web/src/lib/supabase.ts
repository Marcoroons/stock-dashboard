import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { Database } from '@/types/database'

type Test =
  Database['public']['Tables']['analytics_events']['Row']

const testRow: Test = {
  id: '',
  user_id: '',
  event_name: '',
  properties: {},
  session_id: '',
  created_at: '',
}
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
