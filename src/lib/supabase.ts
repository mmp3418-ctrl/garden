import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmwyfskcznbwxdfsnvat.supabase.co'
const supabaseAnonKey = 'sb_publishable_0xhNbRPzH1NbQfTSA89-uA_MrYnOHfq'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const MEDIA_BUCKET = 'media'
