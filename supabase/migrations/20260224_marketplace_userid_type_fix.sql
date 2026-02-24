-- ============================================================
-- CRITICAL FIX: marketplaceItems userId column type
-- The original table was created with userId as INTEGER but
-- Supabase auth.uid() returns UUID. This migration fixes it.
-- ============================================================

-- Step 1: Drop ALL policies on marketplaceItems dynamically (regardless of name)
-- PostgreSQL cannot alter a column type if ANY policy references it
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'marketplaceItems'
      AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON "marketplaceItems"', pol.policyname);
  END LOOP;
END $$;

-- Step 2: Disable RLS temporarily
ALTER TABLE "marketplaceItems" DISABLE ROW LEVEL SECURITY;

-- Drop all dependent constraints and indexes
ALTER TABLE "marketplaceItems" DROP CONSTRAINT IF EXISTS "marketplaceItems_userId_fkey";
ALTER TABLE "marketplaceItems" DROP CONSTRAINT IF EXISTS "marketplaceItems_user_id_fkey";
DROP INDEX IF EXISTS "idx_marketplaceItems_userId";
DROP INDEX IF EXISTS "idx_marketplaceItems_user_id";

-- Step 3: Clear old integer data (if any) and change column type to UUID
-- We truncate old test data since integer userIds are not valid UUIDs
DELETE FROM "marketplaceItems" WHERE "userId"::text ~ '^[0-9]+$';

-- Step 4: Alter the column type to UUID
ALTER TABLE "marketplaceItems" ALTER COLUMN "userId" TYPE UUID USING NULL;

-- Step 5: Add FK constraint to auth.users
ALTER TABLE "marketplaceItems"
  ADD CONSTRAINT "marketplaceItems_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 6: Recreate index
CREATE INDEX "idx_marketplaceItems_userId" ON "marketplaceItems"("userId");

-- Step 7: Re-enable RLS with correct policies
ALTER TABLE "marketplaceItems" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketplaceItems_select_policy"
ON "marketplaceItems" FOR SELECT TO authenticated USING (true);

CREATE POLICY "marketplaceItems_insert_policy"
ON "marketplaceItems" FOR INSERT TO authenticated
WITH CHECK (auth.uid() = "userId");

CREATE POLICY "marketplaceItems_update_policy"
ON "marketplaceItems" FOR UPDATE TO authenticated
USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY "marketplaceItems_delete_policy"
ON "marketplaceItems" FOR DELETE TO authenticated
USING (auth.uid() = "userId");

-- Step 8: Create marketplace-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-images',
  'marketplace-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- Step 9: Storage policies
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
