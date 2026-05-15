const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('🔄 Implementing Content Vault...');
  
  console.log('Please run this in your Supabase SQL Editor:');
  console.log(`
    CREATE TABLE IF NOT EXISTS public.marketing_vault (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    ALTER TABLE public.marketing_vault ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public select" ON public.marketing_vault FOR SELECT USING (true);
    CREATE POLICY "Admin full access" ON public.marketing_vault FOR ALL USING (auth.role() = 'authenticated');
  `);

  console.log('🔄 Seeding initial tactical content...');

  const initialContent = [
    {
      category: 'captions',
      title: 'Senior Session Reveal',
      content: 'Class of 2026, the wait is over. 🎓 So hyped to reveal [Client Name]\'s senior session. We hit [Location] and caught that perfect golden hour vibe. Which look is your favorite? 1, 2, or 3?\n\nNow booking summer/fall seniors. Tap the link in bio to grab your date.'
    },
    {
      category: 'hashtags',
      title: 'Sports Photography Set',
      content: '#sportsphotography #athleteportraits #gameday #actionphotography #highschoolsports #seniorportraits #rcvmedia #sportscreatives'
    },
    {
      category: 'promo',
      title: 'Limited Weekend Opening',
      content: '🚨 TACTICAL OPENING: I had a spot open up for this Saturday afternoon. Perfect for a quick portrait session or a team media day. First person to DM "READY" gets it with a $25 credit toward their gallery.'
    },
    {
      category: 'pricing',
      title: 'Standard Response: Why the Athlete Session?',
      content: 'The Athlete Session is designed specifically for players who want both high-end portraits and actual game-time action. Most photographers do one or the other—we do both in a single session so you have professional content for recruitment and social media.'
    }
  ];

  for (const item of initialContent) {
    const { error } = await supabase.from('marketing_vault').insert([item]);
    if (error) console.error(`Error seeding ${item.title}:`, error.message);
    else console.log(`✅ Seeded: ${item.title}`);
  }
}

run();
