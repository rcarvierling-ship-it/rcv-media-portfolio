const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('🔄 Implementing Revenue Intelligence goal...');
  
  console.log('Please run this in your Supabase SQL Editor:');
  console.log(`
    ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS monthly_revenue_goal DECIMAL(10, 2) DEFAULT 2000.00;
  `);
}

run();
