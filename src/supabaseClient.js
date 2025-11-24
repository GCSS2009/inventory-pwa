// src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
// These can safely be public in a frontend app.
// Use the values from your Supabase project settings (Project Settings → API).
const supabaseUrl = "https://jylxizselxfrwhvgjqqi.supabase.co";
const supabaseAnonKey = "YOeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bHhpenNlbHhmcndodmdqcXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjkxNTgsImV4cCI6MjA3ODU0NTE1OH0.IE0IeP2zu44hKroQXeyhcq2y9PDlpxBcH91AA5KlCn8";
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
