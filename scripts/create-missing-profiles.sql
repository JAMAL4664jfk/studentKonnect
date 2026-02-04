-- Create Missing Profiles for Existing Users
-- This script creates profiles for users who have auth accounts but no profile

-- First, check which users are missing profiles
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- Create profiles for all users who don't have one
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  phone_number,
  student_id,
  institution_name,
  course_program,
  year_of_study,
  created_at,
  updated_at
)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) as full_name,
  u.email,
  u.raw_user_meta_data->>'phone_number',
  u.raw_user_meta_data->>'student_id',
  u.raw_user_meta_data->>'institution_name',
  u.raw_user_meta_data->>'course_program',
  u.raw_user_meta_data->>'year_of_study',
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify all users now have profiles
SELECT 
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(*) - COUNT(p.id) as users_without_profiles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- Done!
SELECT 'Missing profiles created successfully!' as status;
