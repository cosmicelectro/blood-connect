import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
"https://uigazwsnwyhmwoqglxbp.supabase.co"

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpZ2F6d3Nud3lobXdvcWdseGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzkyNzIsImV4cCI6MjA5NjE1NTI3Mn0.5uFWchb_9asQ5BgBUpUeGH62EGnPwhiHUUuUZ7KY3FE";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);