import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const NEXT_PUBLIC_EMAIL_ADDRESS = process.env.NEXT_PUBLIC_EMAIL_ADDRESS;
