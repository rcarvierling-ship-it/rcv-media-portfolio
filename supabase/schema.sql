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
CREATE TABLE public.albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Photos Table
CREATE TABLE public.photos (
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
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_photos_album FOREIGN KEY (album_id) REFERENCES public.albums (id) ON DELETE SET NULL
);

-- Create Site Settings Table
CREATE TABLE public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_image_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  instagram_url TEXT,
  contact_email TEXT,
  booking_min_advance_days INTEGER DEFAULT 21,
  booking_max_advance_days INTEGER DEFAULT 180,
  booking_is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ====================================================================

-- Foreign Key Indexes
CREATE INDEX idx_photos_album_id ON public.photos (album_id);

-- Sorting and Filtering Indexes
CREATE INDEX idx_photos_created_at ON public.photos (created_at DESC);
CREATE INDEX idx_photos_sort_order ON public.photos (sort_order ASC);
CREATE INDEX idx_photos_is_featured ON public.photos (is_featured);
CREATE INDEX idx_albums_created_at ON public.albums (created_at DESC);
CREATE INDEX idx_albums_is_public ON public.albums (is_public);

-- ====================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================================

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 5. DEFINE RLS POLICIES
-- ====================================================================

-- Policies for public access (Read-Only)
CREATE POLICY "Public can view photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Public can view public albums" ON public.albums FOR SELECT USING (is_public = true);
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);

-- Policies for authenticated access (Admin: Create, Read, Update, Delete)
CREATE POLICY "Admin full access photos" ON public.photos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access albums" ON public.albums FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access site settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

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
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  shoot_type TEXT NOT NULL,
  package_selected TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Blocked Dates Table
CREATE TABLE public.blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_status ON public.bookings (status);
CREATE INDEX idx_bookings_event_date ON public.bookings (event_date);
CREATE INDEX idx_blocked_dates_date ON public.blocked_dates (date);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Booking Policies
-- Anyone can insert a booking
CREATE POLICY "Public can insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
-- Only authenticated (admin) can read/update bookings
CREATE POLICY "Admin full access bookings" ON public.bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Blocked Dates Policies
-- Public can read blocked dates to disable them in the calendar
CREATE POLICY "Public can view blocked dates" ON public.blocked_dates FOR SELECT USING (true);
-- Only authenticated (admin) can manage blocked dates
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
  accent_color TEXT DEFAULT 'blue-600',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Pricing
ALTER TABLE public.pricing_packages ENABLE ROW LEVEL SECURITY;

-- Pricing Policies
CREATE POLICY "Public can view active packages" ON public.pricing_packages FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access pricing" ON public.pricing_packages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed Initial Packages
INSERT INTO public.pricing_packages (name, price, features, accent_color, sort_order)
VALUES 
('Gameday Core', '', ARRAY['1.5 Hours Coverage', '25+ High-Res Edits', 'Digital Gallery', 'Standard Turnaround'], 'zinc-500', 1),
('Athlete Spotlight', '', ARRAY['3 Hours Coverage', 'Portrait Session + Action', '50+ High-Res Edits', '48-Hour Turnaround'], 'blue-600', 2),
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
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#3b82f6';
