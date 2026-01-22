-- Fix wallets table by renaming column if it exists
-- This handles the case where table was already created with 'address' column

DO $$ 
BEGIN
  -- Check if the column 'address' exists and rename it to 'wallet_address'
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'wallets' 
    AND column_name = 'address'
  ) THEN
    ALTER TABLE public.wallets RENAME COLUMN address TO wallet_address;
  END IF;

  -- Check if the column 'wallet_address' doesn't exist, create the table
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'wallets' 
    AND column_name = 'wallet_address'
  ) THEN
    -- Create table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.wallets (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id TEXT NOT NULL,
      wallet_address TEXT NOT NULL UNIQUE,
      encrypted_private_key TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON public.wallets(wallet_address);

-- Enable Row Level Security
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Service role can do everything" ON public.wallets;
DROP POLICY IF EXISTS "Users can read their own wallets" ON public.wallets;

-- Create policies
CREATE POLICY "Service role can do everything"
  ON public.wallets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read their own wallets"
  ON public.wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Add comment to table
COMMENT ON TABLE public.wallets IS 'Stores encrypted wallet private keys for users';
