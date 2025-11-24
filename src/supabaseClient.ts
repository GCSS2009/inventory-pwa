// src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jylxizselxfrwhvgjqqi.supabase.co";

// 👇 your anon public key from Supabase API settings
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bHhpenNlbHhmcndodmdqcXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjkxNTgsImV4cCI6MjA3ODU0NTE1OH0.IE0IeP2zu44hKroQXeyhcq2y9PDlpxBcH91AA5KlCn8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
