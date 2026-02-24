-- ============================================================
-- Fix marketplace listing insert issues
-- ============================================================

-- 1. Ensure the marketplaceItems table has the correct userId column type
-- The table was originally created with INTEGER userId but Supabase auth uses UUID.
-- We need to ensure userId accepts UUID values.

-- Check and alter userId column to UUID if it's still INTEGER
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marketplaceItems'
    AND column_name = 'userId'
    AND data_type = 'integer'
  ) THEN
    -- Drop the old FK constraint if it exists
    ALTER TABLE "marketplaceItems" DROP CONSTRAINT IF EXISTS "marketplaceItems_userId_fkey";
    ALTER TABLE "marketplaceItems" DROP CONSTRAINT IF EXISTS "marketplaceItems_user_id_fkey";
    -- Change column type to UUID
    ALTER TABLE "marketplaceItems" ALTER COLUMN "userId" TYPE UUID USING NULL;
    -- Add FK to auth.users
    ALTER TABLE "marketplaceItems"
      ADD CONSTRAINT "marketplaceItems_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Fix RLS policies to use the correct camelCase column name
ALTER TABLE "marketplaceItems" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all marketplace items" ON "marketplaceItems";
DROP POLICY IF EXISTS "Users can insert their own marketplace items" ON "marketplaceItems";
DROP POLICY IF EXISTS "Users can update their own marketplace items" ON "marketplaceItems";
DROP POLICY IF EXISTS "Users can delete their own marketplace items" ON "marketplaceItems";

CREATE POLICY "Users can view all marketplace items"
ON "marketplaceItems" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own marketplace items"
ON "marketplaceItems" FOR INSERT TO authenticated
WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own marketplace items"
ON "marketplaceItems" FOR UPDATE TO authenticated
USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can delete their own marketplace items"
ON "marketplaceItems" FOR DELETE TO authenticated
USING (auth.uid() = "userId");

-- 3. Create the marketplace-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-images',
  'marketplace-images',
  true,
  10485760, -- 10 MB per image
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 4. Storage policies for marketplace-images bucket
DROP POLICY IF EXISTS "Authenticated users can upload marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own marketplace images" ON storage.objects;

CREATE POLICY "Authenticated users can upload marketplace images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'marketplace-images');

CREATE POLICY "Public read access for marketplace images"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-images');

CREATE POLICY "Users can delete own marketplace images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'marketplace-images' AND auth.uid() = owner);
