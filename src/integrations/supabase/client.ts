
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jouqghqhhccwstmjveen.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdXFnaHFoaGNjd3N0bWp2ZWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNzQ3NTgsImV4cCI6MjA1Mzg1MDc1OH0.YvH0FTszPZudNXZdCIBiCrXB5Ss1elWIZG3etGz87Rw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
