-- ====================================================================
-- RCV Media Portfolio - Supabase Database Schema
-- ====================================================================

-- ====================================================================
-- 1. HOW TO CREATE YOUR FIRST ADMIN USER
-- ====================================================================
-- Since this is a fresh setup, you will need an admin user to upload
-- photos, create albums, and edit site settings.
-- 
-- Step 1: Go to the "Authentication" -> "Users" section in your Supabase Dashboard.
-- Step 2: Click "Add User" -> "Create New User" and create an account with your email and a strong password.
--         (Note: Make sure to auto-confirm the user if email confirmations are disabled).
-- Step 3: By default, the RLS policies below grant full access to ANY authenticated user.
--         Because you are the only one who can register accounts (if you disable public signups),
--         your newly created account acts as the admin.
-- 
-- IMPORTANT: Go to Authentication -> Providers -> Email -> and TURN OFF "Confirm email" and "Allow new users to sign up" 
-- AFTER you create your account. This prevents random people from signing up and gaining admin access.
-- ====================================================================


-- ====================================================================
-- 2. CREATE TABLES
-- ====================================================================

-- Create Albums Table
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Photos Table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  category TEXT,
  album_id UUID,
  is_featured BOOLEAN DEFAULT false,
  is_curated BOOLEAN DEFAULT false,
  iso INTEGER,
  aperture TEXT,
  shutter_speed TEXT,
  focal_length TEXT,
  camera_model TEXT,
  lens_model TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_photos_album FOREIGN KEY (album_id) REFERENCES public.albums (id) ON DELETE SET NULL
);

-- Create Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_image_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  instagram_url TEXT,
  contact_email TEXT,
  booking_min_advance_days INTEGER DEFAULT 21,
  booking_max_advance_days INTEGER DEFAULT 180,
  booking_is_active BOOLEAN DEFAULT true,
  monthly_revenue_goal DECIMAL(10, 2) DEFAULT 2000.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ====================================================================

-- Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON public.photos (album_id);

-- Sorting and Filtering Indexes
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_sort_order ON public.photos (sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_photos_is_featured ON public.photos (is_featured);
CREATE INDEX IF NOT EXISTS idx_albums_created_at ON public.albums (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_albums_is_public ON public.albums (is_public);

-- ====================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================================

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_vault ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 5. DEFINE RLS POLICIES
-- ====================================================================

-- Policies for public access (Read-Only)
DROP POLICY IF EXISTS "Public can view photos" ON public.photos;
CREATE POLICY "Public can view photos" ON public.photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view public albums" ON public.albums;
CREATE POLICY "Public can view public albums" ON public.albums FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view marketing vault" ON public.marketing_vault;
CREATE POLICY "Public can view marketing vault" ON public.marketing_vault FOR SELECT USING (true);

-- Policies for authenticated access (Admin: Create, Read, Update, Delete)
DROP POLICY IF EXISTS "Admin full access photos" ON public.photos;
CREATE POLICY "Admin full access photos" ON public.photos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access albums" ON public.albums;
CREATE POLICY "Admin full access albums" ON public.albums FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access site settings" ON public.site_settings;
CREATE POLICY "Admin full access site settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access marketing vault" ON public.marketing_vault;
CREATE POLICY "Admin full access marketing vault" ON public.marketing_vault FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ====================================================================
-- 6. SEED INITIAL DATA
-- ====================================================================

-- Create a single initial settings row so updates work immediately
INSERT INTO public.site_settings (hero_image_url, hero_title, hero_subtitle, instagram_url, contact_email) 
VALUES (
  'https://images.unsplash.com/photo-1541252876101-08144b679468?q=80&w=2070&auto=format&fit=crop',
  'RCV.Media',
  'Sports + Lifestyle Photography',
  'https://instagram.com',
  'contact@rcv-media.com'
) ON CONFLICT DO NOTHING;

-- ====================================================================
-- 7. BOOKING SYSTEM TABLES
-- ====================================================================

-- Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  instagram_handle TEXT,
  shoot_type TEXT NOT NULL,
  package_selected TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
  pipeline_stage TEXT DEFAULT 'lead', -- lead, confirmed, shooting, editing, delivered
  payment_status TEXT DEFAULT 'pending', -- pending, paid
  total_amount DECIMAL(10, 2) DEFAULT 0, -- Quoted Amount
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  payment_method TEXT, -- Venmo, Zelle, Cash, etc.
  payment_notes TEXT,
  linked_album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  contract_status TEXT DEFAULT 'unsigned', -- unsigned, signed
  deposit_paid BOOLEAN DEFAULT false,
  review_requested BOOLEAN DEFAULT false,
  team_name TEXT,
  estimated_count INTEGER,
  budget TEXT,
  coach_name TEXT,
  booking_type TEXT DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Blocked Dates Table
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Marketing Vault Table
CREATE TABLE IF NOT EXISTS public.marketing_vault (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- captions, hashtags, templates, copy
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON public.bookings (event_date);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON public.blocked_dates (date);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Booking Policies
-- Anyone can insert a booking
DROP POLICY IF EXISTS "Public can insert bookings" ON public.bookings;
CREATE POLICY "Public can insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
-- Only authenticated (admin) can read/update bookings
DROP POLICY IF EXISTS "Admin full access bookings" ON public.bookings;
CREATE POLICY "Admin full access bookings" ON public.bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Blocked Dates Policies
-- Public can read blocked dates to disable them in the calendar
DROP POLICY IF EXISTS "Public can view blocked dates" ON public.blocked_dates;
CREATE POLICY "Public can view blocked dates" ON public.blocked_dates FOR SELECT USING (true);
-- Only authenticated (admin) can manage blocked dates
DROP POLICY IF EXISTS "Admin full access blocked dates" ON public.blocked_dates;
CREATE POLICY "Admin full access blocked dates" ON public.blocked_dates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ====================================================================
-- 8. PRICING SYSTEM
-- ====================================================================

-- Create Pricing Packages Table
CREATE TABLE IF NOT EXISTS public.pricing_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  accent_color TEXT DEFAULT 'brand-accent',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Pricing
ALTER TABLE public.pricing_packages ENABLE ROW LEVEL SECURITY;

-- Pricing Policies
DROP POLICY IF EXISTS "Public can view active packages" ON public.pricing_packages;
CREATE POLICY "Public can view active packages" ON public.pricing_packages FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access pricing" ON public.pricing_packages;
CREATE POLICY "Admin full access pricing" ON public.pricing_packages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed Initial Packages
INSERT INTO public.pricing_packages (name, price, features, accent_color, sort_order)
VALUES 
('Gameday Core', '', ARRAY['1.5 Hours Coverage', '25+ High-Res Edits', 'Digital Gallery', 'Standard Turnaround'], 'zinc-500', 1),
('Athlete Spotlight', '', ARRAY['3 Hours Coverage', 'Portrait Session + Action', '50+ High-Res Edits', '48-Hour Turnaround'], 'brand-accent', 2),
('Tournament Elite', '', ARRAY['Full Day Coverage', 'Unlimited Photos', 'Highlight Reel Clips', 'Priority Delivery'], 'white', 3)
ON CONFLICT DO NOTHING;

-- Additional Base Packages
INSERT INTO public.pricing_packages (name, price, features, accent_color, sort_order)
VALUES 
('Media Day Special', '', ARRAY['2 Hours Coverage', 'Full Team Headshots', 'Social Media Ready', 'Team Graphics Included'], 'emerald-500', 4),
('Highlight Reel Plus', '', ARRAY['4 Hours Coverage', '40+ Edited Photos', '60s Video Highlight Reel', 'Cinematic Color Grade'], 'purple-600', 5)
ON CONFLICT DO NOTHING;

-- Update Albums for Client Portal
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS passcode TEXT;
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS vault_views INTEGER DEFAULT 0;
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0;

-- Update Policies for Privacy
DROP POLICY IF EXISTS "Public can view albums" ON public.albums;
CREATE POLICY "Public can view non-private albums" ON public.albums FOR SELECT USING (is_private = false);
-- Note: Gallery page will use service_role or specific logic to fetch private albums by passcode.

-- Update Site Settings for About Page
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS about_title_first TEXT DEFAULT 'Reese';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS about_title_last TEXT DEFAULT 'Vierling';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS about_bio TEXT DEFAULT 'I am a sports, lifestyle, and event photographer based in Louisville, KY. My work focuses on capturing the raw emotion, intensity, and fleeting moments that define the human experience in motion.';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS about_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1554046920-90dcac024a1e?q=80&w=1978&auto=format&fit=crop';

-- Update Site Settings for Global Vibe Switch
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#C8FF00';

-- Clear and replace pricing packages with updated photography-only tiers
TRUNCATE public.pricing_packages;

INSERT INTO public.pricing_packages (name, price, features, accent_color, sort_order)
VALUES 
('Sports Shoot', '$80', ARRAY['Up to 2 hours coverage', '25+ edited photos', 'Online gallery', 'Standard turnaround'], '#C8FF00', 1),
('Single Game', '$125', ARRAY['Up to 2.5 hours coverage', '40+ edited photos', 'Online gallery', 'Action + detail shots', 'Standard turnaround'], '#C8FF00', 2),
('Portrait Session', '$125', ARRAY['45–60 minute session', '1 location', '20+ edited photos', 'Online gallery'], '#C8FF00', 3),
('Cap & Gown Session', '$100', ARRAY['30–45 minute session', '1 location', '15+ edited photos', 'Online gallery'], '#C8FF00', 4),
('Athlete Session', '$175', ARRAY['1.5–2 hours coverage', 'Portraits + action photos', '35+ edited photos', 'Online gallery', 'Social media ready edits'], '#C8FF00', 5),
('Senior Session', '$180', ARRAY['1 hour session', '1 location', '25+ edited photos', 'Online gallery', 'Outfit change if time allows'], '#C8FF00', 6),
('Team Media Day', '$250', ARRAY['Up to 2 hours coverage', 'Individual player photos', 'Team photos', '50+ edited photos', 'Social media ready edits'], '#C8FF00', 7),
('Event Coverage', 'Starting at $250', ARRAY['Up to 2 hours coverage', '50+ edited photos', 'Online gallery', 'Standard turnaround'], '#C8FF00', 8),
('Tournament / Extended Coverage', 'Starting at $400', ARRAY['Full-day or extended coverage', '100+ edited photos', 'Online gallery', 'Priority delivery', 'Multiple games or locations'], '#C8FF00', 9);
-- General Inquiries Table
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new', -- new, read, replied
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for inquiries
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit an inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit an inquiry" ON public.inquiries
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view inquiries" ON public.inquiries;
CREATE POLICY "Admins can view inquiries" ON public.inquiries
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
CREATE POLICY "Admins can update inquiries" ON public.inquiries
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Master Collection Support
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS is_curated BOOLEAN DEFAULT false;

-- Allow public to view curated photos regardless of album privacy
DROP POLICY IF EXISTS "Public can view curated photos" ON public.photos;
CREATE POLICY "Public can view curated photos" ON public.photos
    FOR SELECT USING (is_curated = true);

-- ====================================================================
-- 9. CONTRACT & INVOICE SYSTEM
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft', -- draft, sent, signed, paid
  amount DECIMAL(10, 2),
  signed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Admins can manage contracts" ON public.contracts;
CREATE POLICY "Admins can manage contracts" ON public.contracts
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public can view their specific contract by ID (we will use UUID as a secure link)
DROP POLICY IF EXISTS "Public can view specific contract" ON public.contracts;
CREATE POLICY "Public can view specific contract" ON public.contracts
    FOR SELECT USING (true);


-- ====================================================================
-- 10. VISUAL INTELLIGENCE & ANALYTICS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'vault_view', 'photo_download', 'portfolio_view'
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL,
  client_ip TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_analytics_album_id ON public.analytics_events(album_id);
CREATE INDEX IF NOT EXISTS idx_analytics_photo_id ON public.analytics_events(photo_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.analytics_events;
CREATE POLICY "Admins can view all analytics" ON public.analytics_events
    FOR SELECT TO authenticated USING (true);

-- Public can INSERT analytics (triggered by their actions)
DROP POLICY IF EXISTS "Public can insert analytics" ON public.analytics_events;
CREATE POLICY "Public can insert analytics" ON public.analytics_events
    FOR INSERT TO anon, authenticated WITH CHECK (true);

