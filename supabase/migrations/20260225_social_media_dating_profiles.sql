-- Add social media link columns to dating profiles tables
-- Handles both the camelCase (datingProfiles) and snake_case (dating_profiles) table names

-- For datingProfiles table (camelCase - original RN schema)
ALTER TABLE IF EXISTS "datingProfiles"
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS tiktok TEXT,
  ADD COLUMN IF NOT EXISTS twitter TEXT;

-- For dating_profiles table (snake_case - web schema)
ALTER TABLE IF EXISTS dating_profiles
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS tiktok TEXT,
  ADD COLUMN IF NOT EXISTS twitter TEXT;

-- Also add to profiles table for main user profile social links
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS tiktok TEXT,
  ADD COLUMN IF NOT EXISTS twitter TEXT,
  ADD COLUMN IF NOT EXISTS facebook TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT;
