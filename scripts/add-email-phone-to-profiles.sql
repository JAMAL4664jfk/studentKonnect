-- Add email and phone_number columns to profiles table
-- Run this migration in your Supabase SQL Editor

-- Add columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS institution_id TEXT;

-- Add unique constraint on email (optional but recommended)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON profiles(email) WHERE email IS NOT NULL;

-- Add index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS profiles_phone_number_idx ON profiles(phone_number) WHERE phone_number IS NOT NULL;

-- Update RLS policies to allow users to read their own email and phone
-- (Existing policies should already cover this, but let's be explicit)

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile including email and phone
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile during signup
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Optional: Add a function to sync email from auth.users to profiles
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new user signs up, copy their email to the profile
  INSERT INTO profiles (id, email, full_name, phone_number, student_id, institution_id, institution_name, course_program, year_of_study)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'institution_id',
    NEW.raw_user_meta_data->>'institution_name',
    NEW.raw_user_meta_data->>'course_program',
    NEW.raw_user_meta_data->>'year_of_study'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    student_id = COALESCE(EXCLUDED.student_id, profiles.student_id),
    institution_id = COALESCE(EXCLUDED.institution_id, profiles.institution_id),
    institution_name = COALESCE(EXCLUDED.institution_name, profiles.institution_name),
    course_program = COALESCE(EXCLUDED.course_program, profiles.course_program),
    year_of_study = COALESCE(EXCLUDED.year_of_study, profiles.year_of_study);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically sync email on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_email();

-- Backfill existing users' emails from auth.users to profiles
UPDATE profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.id = auth.users.id
AND profiles.email IS NULL;

COMMENT ON COLUMN profiles.email IS 'User email address synced from auth.users';
COMMENT ON COLUMN profiles.phone_number IS 'User phone number in E.164 format (+27...)';
COMMENT ON COLUMN profiles.institution_id IS 'Institution ID from SA_INSTITUTIONS constant';
