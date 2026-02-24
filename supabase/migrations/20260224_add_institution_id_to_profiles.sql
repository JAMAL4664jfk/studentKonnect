-- Add institution_id column to profiles table if it doesn't exist
-- This column is used by InstitutionContext to track which institution the user belongs to
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS institution_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_institution_id ON public.profiles(institution_id);

-- Add university column alias if needed (some screens use 'university' text field)
-- The institution_id stores the SA_INSTITUTIONS id (e.g. "uct", "wits", "unisa")
-- The university column stores the display name
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS university TEXT;

COMMENT ON COLUMN public.profiles.institution_id IS 'SA institution identifier matching SA_INSTITUTIONS constant (e.g. uct, wits, unisa)';
COMMENT ON COLUMN public.profiles.university IS 'Human-readable university/institution name';
