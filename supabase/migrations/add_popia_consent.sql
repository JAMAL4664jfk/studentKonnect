-- Add POPIA consent fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS popia_consent BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS popia_consent_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN profiles.popia_consent IS 'User consent to POPIA (Protection of Personal Information Act) terms. NULL = not asked, TRUE = accepted, FALSE = declined';
COMMENT ON COLUMN profiles.popia_consent_date IS 'Timestamp when user provided POPIA consent';

-- Create index for querying users by consent status
CREATE INDEX IF NOT EXISTS idx_profiles_popia_consent ON profiles(popia_consent);
