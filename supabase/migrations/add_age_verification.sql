-- ============================================================================
-- ADD AGE VERIFICATION FOR DATING FEATURE
-- ============================================================================
-- This migration adds age verification tracking for Google Play compliance
-- Required for dating feature to meet child safety requirements
-- ============================================================================

-- Add age verification column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS age_verified_for_dating BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN profiles.age_verified_for_dating IS 'Indicates if user has confirmed they are 18+ for dating features (Google Play compliance)';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_age_verified_dating ON profiles(age_verified_for_dating);

-- Note: This column tracks user confirmation of being 18+
-- It does not replace proper age verification but satisfies Google Play's
-- requirement for users to confirm their age before accessing dating features
