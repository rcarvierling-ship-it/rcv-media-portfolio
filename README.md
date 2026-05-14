# RCV.Media Portfolio

A premium sports and lifestyle photography portfolio built with Next.js, Tailwind CSS, Framer Motion, Supabase, and Cloudinary.

## Architecture

This project uses a clean, production-ready architecture:
- **Frontend**: Next.js 16 (App Router), Tailwind CSS (Dark Luxury Theme), Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Image Storage**: Cloudinary

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root of the project:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_if_needed

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Cloudinary Setup
1. Create a free Cloudinary account.
2. Navigate to your Dashboard and copy your Cloud Name, API Key, and API Secret into your `.env.local` file.
3. Your uploads will automatically be organized into an `rcv_media` folder.

### 3. Supabase Setup

1. Create a new Supabase project.
2. Go to the **SQL Editor** and run the following script to create your tables:

```sql
-- Create Photos Table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  category TEXT NOT NULL,
  album_id UUID,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Albums Table
CREATE TABLE albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Site Settings Table
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_image_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  instagram_url TEXT,
  contact_email TEXT
);
```

#### Row Level Security (RLS) Policies
To secure your database, run these commands in the SQL Editor:

```sql
-- Enable RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Public can view albums" ON albums FOR SELECT USING (is_public = true);
CREATE POLICY "Public can view site_settings" ON site_settings FOR SELECT USING (true);

-- Allow authenticated users (Admin) full access
CREATE POLICY "Admin full access photos" ON photos FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access albums" ON albums FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access site_settings" ON site_settings FOR ALL TO authenticated USING (true);
```

### 4. Authentication
1. In your Supabase dashboard, go to **Authentication -> Providers**.
2. Ensure **Email** provider is enabled.
3. Go to **Authentication -> Users** and create a new user with your email and a strong password. You will use these credentials to log in at `/login` to access your `/dashboard`.

## Running Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the public site.
Visit `http://localhost:3000/login` to access the admin dashboard.

## Deployment

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. In the Vercel project settings, add all the environment variables from your `.env.local`.
4. Click **Deploy**. Vercel will build and host your Next.js application automatically.

# Deployment Pulse: Thu May 14 14:17:40 EDT 2026
