import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ensvlavbcalacfwqghru.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuc3ZsYXZiY2FsYWNmd3FnaHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDk1OTgsImV4cCI6MjA3MjY4NTU5OH0.zwucOBb7C7XUVyQ3WSCYm9Zy2Y7zBcsGcb-HveWl-Xc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);