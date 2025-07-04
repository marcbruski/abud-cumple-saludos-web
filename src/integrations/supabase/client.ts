// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://decbthuhbpnvbvhkfyjd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY2J0aHVoYnBudmJ2aGtmeWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNDY2MDEsImV4cCI6MjA2NjgyMjYwMX0.8mq3-dLSX4h-GU4EuB5-0sZAZFVXPRlnYYW7BBn3R5A";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});