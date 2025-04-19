import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://frjabqpvtjqfhfscapke.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyamFicXB2dGpxZmhmc2NhcGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MDk5MzksImV4cCI6MjA1ODQ4NTkzOX0.Ft-AVyorIDFchJJqcKUjBH1cnIMgQa2hrmLJO3e_LHY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;