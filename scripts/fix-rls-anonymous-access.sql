-- Fix RLS policies to allow anonymous (unauthenticated) access to accommodations and marketplace

-- Step 1: Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Anyone can read accommodations" ON "accommodations";
DROP POLICY IF EXISTS "Service role can do everything on accommodations" ON "accommodations";
DROP POLICY IF EXISTS "Anyone can read marketplace items" ON "marketplaceItems";
DROP POLICY IF EXISTS "Service role can do everything on marketplaceItems" ON "marketplaceItems";

-- Step 2: Create new policies that explicitly allow anonymous access
-- For accommodations table
CREATE POLICY "Public read access for accommodations"
  ON "accommodations"
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access to accommodations"
  ON "accommodations"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For marketplaceItems table
CREATE POLICY "Public read access for marketplace items"
  ON "marketplaceItems"
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access to marketplace items"
  ON "marketplaceItems"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 3: Verify RLS is enabled (should already be enabled)
ALTER TABLE "accommodations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "marketplaceItems" ENABLE ROW LEVEL SECURITY;

-- Step 4: Verify the policies
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('accommodations', 'marketplaceItems')
ORDER BY tablename, policyname;
