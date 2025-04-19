// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xppqzfzlafvzkdywiged.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcHF6ZnpsYWZ2emtkeXdpZ2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNzI5NjEsImV4cCI6MjA2MDY0ODk2MX0.CtACYbpBqwDdxqsVJEgljxNZZ4SaTCACr0WGgvZc3OY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
