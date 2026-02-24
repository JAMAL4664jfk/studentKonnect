-- Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create referral_signups table to track who signed up with which code
CREATE TABLE IF NOT EXISTS public.referral_signups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id uuid NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_signups ENABLE ROW LEVEL SECURITY;

-- Referrer can see who signed up with their code
CREATE POLICY "Users can view signups for their referral code"
  ON public.referral_signups FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.referral_codes
    WHERE referral_codes.id = referral_signups.referral_code_id
    AND referral_codes.user_id = auth.uid()
  ));

-- Allow insert for authenticated users (on signup)
CREATE POLICY "Authenticated users can record referral signup"
  ON public.referral_signups FOR INSERT
  WITH CHECK (auth.uid() = referred_user_id);
