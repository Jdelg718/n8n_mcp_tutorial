-- Supabase Storage setup for meal images
-- Apply via Supabase Dashboard: SQL Editor > New query > Run

-- Create meal-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can INSERT only to their own folder (user_id/filename pattern)
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meal-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Policy: Users can SELECT only their own images
CREATE POLICY "Users can view own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'meal-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Policy: Users can UPDATE only their own images
CREATE POLICY "Users can update own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'meal-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
)
WITH CHECK (
  bucket_id = 'meal-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Policy: Users can DELETE only their own images
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'meal-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Note: Bucket configuration (max file size, allowed MIME types)
-- must be set via Supabase Dashboard:
-- Storage > meal-images > Settings > Configuration:
--   - Max file size: 10485760 (10MB)
--   - Allowed MIME types: image/jpeg, image/png, image/webp
