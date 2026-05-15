const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('🔄 Adding operational columns to bookings table...');
  
  // We'll use the RPC 'exec' if available, but since we probably don't have it,
  // we'll just advise the user to run it in the SQL Editor or try to use a dummy query
  // to check if columns exist.
  
  console.log('Please run this in your Supabase SQL Editor:');
  console.log(`
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS contract_status TEXT DEFAULT 'unsigned';
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false;
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS final_paid BOOLEAN DEFAULT false;
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS review_requested BOOLEAN DEFAULT false;
  `);
}

run();
