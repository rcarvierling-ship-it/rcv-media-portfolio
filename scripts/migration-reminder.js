const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Adding instagram_handle to bookings...');
  // Supabase JS doesn't support ALTER TABLE directly easily without RPC or similar
  // But we can try to use the REST API to check if it exists or just rely on the schema file
  console.log('Please run the following SQL in your Supabase SQL Editor:');
  console.log('ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS instagram_handle TEXT;');
}

run();
