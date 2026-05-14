-- ====================================================================
-- RCV Media Portfolio - Master Vault Storage Setup
-- ====================================================================
-- Run this script in your Supabase SQL Editor to initialize the 
-- master-collection bucket and set up security policies.

-- 1. Initialize the Master Vault Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('master-collection', 'master-collection', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Define High-Fidelity Security Policies
-- Allow anyone to download high-res masters (for client fulfillment)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'master-collection' );

-- Allow only you (authenticated admin) to upload masters
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'master-collection' AND auth.role() = 'authenticated' );

-- Allow you to manage (update/delete) your masters
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'master-collection' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'master-collection' AND auth.role() = 'authenticated' );
