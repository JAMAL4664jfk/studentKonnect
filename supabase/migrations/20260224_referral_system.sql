-- ============================================================
-- Referral System Tables and Policies
-- ============================================================

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts on re-run
DROP POLICY IF EXISTS "Users can view their own referral code" ON public.referral_codes;
DROP POLICY IF EXISTS "Users can create their own referral code" ON public.referral_codes;
DROP POLICY IF EXISTS "Anyone can look up a referral code by value" ON public.referral_codes;

-- Owner can read their own code
CREATE POLICY "Users can view their own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

-- Any authenticated user can look up a code by its value
-- (needed during signup to validate a friend's referral code)
CREATE POLICY "Anyone can look up a referral code by value"
  ON public.referral_codes FOR SELECT
  TO authenticated
  USING (true);

-- Only the owner can create their own code
CREATE POLICY "Users can create their own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create referral_signups table to track who signed up with which code
CREATE TABLE IF NOT EXISTS public.referral_signups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id uuid NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  -- Prevent duplicate signups
  UNIQUE(referred_user_id)
);

ALTER TABLE public.referral_signups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts on re-run
DROP POLICY IF EXISTS "Users can view signups for their referral code" ON public.referral_signups;
DROP POLICY IF EXISTS "Authenticated users can record referral signup" ON public.referral_signups;

-- Referrer can see who signed up with their code
CREATE POLICY "Users can view signups for their referral code"
  ON public.referral_signups FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.referral_codes
    WHERE referral_codes.id = referral_signups.referral_code_id
    AND referral_codes.user_id = auth.uid()
  ));

-- Allow authenticated users to record their own signup with a referral code
CREATE POLICY "Authenticated users can record referral signup"
  ON public.referral_signups FOR INSERT
  WITH CHECK (auth.uid() = referred_user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_signups_code_id ON public.referral_signups(referral_code_id);
