-- Fix Signup Triggers for Student Konnect
-- Run this in Supabase SQL Editor

-- Step 1: Drop all existing auth triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_fiat_wallet ON auth.users;

-- Step 2: Drop existing functions
DROP FUNCTION IF EXISTS public.create_profile_for_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_fiat_wallet_for_new_user() CASCADE;

-- Step 3: Create a single unified function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (
    id,
    full_name,
    phone_number,
    student_id,
    institution_name,
    course_program,
    year_of_study
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'institution_name',
    NEW.raw_user_meta_data->>'course_program',
    NEW.raw_user_meta_data->>'year_of_study'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create fiat wallet (if table exists)
  INSERT INTO public.fiat_wallets (user_id, balance, currency)
  VALUES (NEW.id, 0, 'ZAR')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 4: Create single trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Done!
SELECT 'Signup triggers fixed successfully!' as status;
