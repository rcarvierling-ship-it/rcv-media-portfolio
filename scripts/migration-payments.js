const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('🔄 Refining manual payment tracking columns...');
  
  console.log('Please run this in your Supabase SQL Editor:');
  console.log(`
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10, 2) DEFAULT 0;
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_notes TEXT;
  `);
}

run();
