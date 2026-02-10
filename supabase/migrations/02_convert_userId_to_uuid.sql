-- ============================================================================
-- MIGRATION: Convert userId from INTEGER to UUID
-- ============================================================================
-- This migration fixes the type mismatch between userId (integer) and profiles.id (uuid)
-- Run this BEFORE running 01_fixed_master_migration.sql
-- ============================================================================

-- ============================================================================
-- STEP 1: Convert marketplaceItems.userId from INTEGER to UUID
-- ============================================================================

-- Drop the old userId column and create a new one with UUID type
-- Note: This will clear existing data in userId column
-- If you have existing data, you'll need to manually map integer IDs to UUIDs first

ALTER TABLE "marketplaceItems" 
DROP COLUMN IF EXISTS "userId";

ALTER TABLE "marketplaceItems"
ADD COLUMN "userId" UUID;

COMMENT ON COLUMN "marketplaceItems"."userId" IS 'User ID (UUID) who created this marketplace item. References profiles(id)';

-- ============================================================================
-- STEP 2: Convert accommodations.userId from INTEGER to UUID
-- ============================================================================

ALTER TABLE accommodations 
DROP COLUMN IF EXISTS "userId";

ALTER TABLE accommodations
ADD COLUMN "userId" UUID;

COMMENT ON COLUMN accommodations."userId" IS 'User ID (UUID) who created this accommodation listing. References profiles(id)';

-- ============================================================================
-- STEP 3: Add Foreign Key Constraints
-- ============================================================================

-- Add foreign key for marketplaceItems
ALTER TABLE "marketplaceItems"
ADD CONSTRAINT "marketplaceItems_userId_fkey" 
FOREIGN KEY ("userId") 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Add foreign key for accommodations
ALTER TABLE accommodations
ADD CONSTRAINT "accommodations_userId_fkey" 
FOREIGN KEY ("userId") 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- ============================================================================
-- STEP 4: Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS "idx_marketplaceItems_userId" ON "marketplaceItems"("userId");
CREATE INDEX IF NOT EXISTS idx_accommodations_userId ON accommodations("userId");

-- ============================================================================
-- STEP 5: Add RLS Policies
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE "marketplaceItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;

-- marketplaceItems RLS Policies
DROP POLICY IF EXISTS "marketplaceItems_select_policy" ON "marketplaceItems";
CREATE POLICY "marketplaceItems_select_policy"
  ON "marketplaceItems"
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "marketplaceItems_insert_policy" ON "marketplaceItems";
CREATE POLICY "marketplaceItems_insert_policy"
  ON "marketplaceItems"
  FOR INSERT
  WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "marketplaceItems_update_policy" ON "marketplaceItems";
CREATE POLICY "marketplaceItems_update_policy"
  ON "marketplaceItems"
  FOR UPDATE
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "marketplaceItems_delete_policy" ON "marketplaceItems";
CREATE POLICY "marketplaceItems_delete_policy"
  ON "marketplaceItems"
  FOR DELETE
  USING (auth.uid() = "userId");

-- accommodations RLS Policies
DROP POLICY IF EXISTS "accommodations_select_policy" ON accommodations;
CREATE POLICY "accommodations_select_policy"
  ON accommodations
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "accommodations_insert_policy" ON accommodations;
CREATE POLICY "accommodations_insert_policy"
  ON accommodations
  FOR INSERT
  WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "accommodations_update_policy" ON accommodations;
CREATE POLICY "accommodations_update_policy"
  ON accommodations
  FOR UPDATE
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "accommodations_delete_policy" ON accommodations;
CREATE POLICY "accommodations_delete_policy"
  ON accommodations
  FOR DELETE
  USING (auth.uid() = "userId");

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify the migration worked)
-- ============================================================================

-- Check column types
-- SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'marketplaceItems' AND column_name = 'userId';
-- SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'accommodations' AND column_name = 'userId';

-- Check foreign keys
-- SELECT constraint_name, table_name FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_name IN ('marketplaceItems', 'accommodations');

-- Check RLS policies
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename IN ('marketplaceItems', 'accommodations');
