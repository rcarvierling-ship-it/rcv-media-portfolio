const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const packages = [
  {
    name: 'Sports Shoot',
    price: '$80',
    features: ['Up to 2 hours coverage', '25+ edited photos', 'Online gallery', 'Standard turnaround'],
    accent_color: '#2563EB',
    sort_order: 1
  },
  {
    name: 'Single Game',
    price: '$125',
    features: ['Up to 2.5 hours coverage', '40+ edited photos', 'Online gallery', 'Action + detail shots', 'Standard turnaround'],
    accent_color: '#10B981',
    sort_order: 2
  },
  {
    name: 'Portrait Session',
    price: '$125',
    features: ['45–60 minute session', '1 location', '20+ edited photos', 'Online gallery'],
    accent_color: '#7C3AED',
    sort_order: 3
  },
  {
    name: 'Cap & Gown Session',
    price: '$100',
    features: ['30–45 minute session', '1 location', '15+ edited photos', 'Online gallery'],
    accent_color: '#D97706',
    sort_order: 4
  },
  {
    name: 'Athlete Session',
    price: '$175',
    features: ['1.5–2 hours coverage', 'Portraits + action photos', '35+ edited photos', 'Online gallery', 'Social media ready edits'],
    accent_color: '#9333EA',
    sort_order: 5
  },
  {
    name: 'Senior Session',
    price: '$180',
    features: ['1 hour session', '1 location', '25+ edited photos', 'Online gallery', 'Outfit change if time allows'],
    accent_color: '#DB2777',
    sort_order: 6
  },
  {
    name: 'Team Media Day',
    price: '$250',
    features: ['Up to 2 hours coverage', 'Individual player photos', 'Team photos', '50+ edited photos', 'Social media ready edits'],
    accent_color: '#16A34A',
    sort_order: 7
  },
  {
    name: 'Event Coverage',
    price: 'Starting at $250',
    features: ['Up to 2 hours coverage', '50+ edited photos', 'Online gallery', 'Standard turnaround'],
    accent_color: '#EA580C',
    sort_order: 8
  },
  {
    name: 'Tournament / Extended Coverage',
    price: 'Starting at $400',
    features: ['Full-day or extended coverage', '100+ edited photos', 'Online gallery', 'Priority delivery', 'Multiple games or locations'],
    accent_color: '#DC2626',
    sort_order: 9
  }
];

async function updatePackages() {
  console.log('🔄 Updating pricing packages...');

  // 1. Delete existing packages
  const { error: deleteError } = await supabase
    .from('pricing_packages')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.error('❌ Error deleting packages:', deleteError);
    return;
  }

  // 2. Insert new packages
  const { error: insertError } = await supabase
    .from('pricing_packages')
    .insert(packages);

  if (insertError) {
    console.error('❌ Error inserting packages:', insertError);
    return;
  }

  console.log('✅ Successfully updated 9 photography packages.');
}

updatePackages();
