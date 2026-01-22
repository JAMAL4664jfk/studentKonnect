-- ============================================
-- Separate Fiat and Crypto Wallets
-- ============================================
-- This migration renames the existing wallets table to crypto_wallets
-- and creates a new fiat_wallets table for mobile money/fiat balance

-- Step 1: Rename existing wallets table to crypto_wallets
ALTER TABLE IF EXISTS public.wallets RENAME TO crypto_wallets;

-- Step 2: Rename indexes
ALTER INDEX IF EXISTS idx_wallets_user_id RENAME TO idx_crypto_wallets_user_id;
ALTER INDEX IF EXISTS idx_wallets_address RENAME TO idx_crypto_wallets_address;

-- Step 3: Drop old policies
DROP POLICY IF EXISTS "Service role can do everything" ON public.crypto_wallets;
DROP POLICY IF EXISTS "Users can read their own wallets" ON public.crypto_wallets;
DROP POLICY IF EXISTS "Users can read wallets" ON public.crypto_wallets;

-- Step 4: Create new policies for crypto_wallets
CREATE POLICY "Service role can do everything on crypto_wallets"
  ON public.crypto_wallets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read crypto wallets"
  ON public.crypto_wallets
  FOR SELECT
  TO authenticated
  USING (true);

-- Step 5: Create fiat_wallets table for mobile money/fiat balance
CREATE TABLE IF NOT EXISTS public.fiat_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES' NOT NULL,
  mobile_money_provider VARCHAR(50),
  mobile_money_number VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Step 6: Create indexes for fiat_wallets
CREATE INDEX idx_fiat_wallets_user_id ON public.fiat_wallets(user_id);

-- Step 7: Enable RLS on fiat_wallets
ALTER TABLE public.fiat_wallets ENABLE ROW LEVEL SECURITY;

-- Step 8: Create policies for fiat_wallets
CREATE POLICY "Users can read their own fiat wallet"
  ON public.fiat_wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own fiat wallet"
  ON public.fiat_wallets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fiat wallet"
  ON public.fiat_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can do everything on fiat_wallets"
  ON public.fiat_wallets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 9: Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_fiat_wallets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fiat_wallets_updated_at
  BEFORE UPDATE ON public.fiat_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_fiat_wallets_updated_at();

-- Step 10: Create function to auto-create fiat wallet on user signup
CREATE OR REPLACE FUNCTION create_fiat_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.fiat_wallets (user_id, balance, currency)
  VALUES (NEW.id, 0.00, 'KES')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create trigger to auto-create fiat wallet
DROP TRIGGER IF EXISTS on_auth_user_created_fiat_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_fiat_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_fiat_wallet_for_new_user();

-- Step 12: Add comments
COMMENT ON TABLE public.crypto_wallets IS 'Stores encrypted crypto wallet private keys for blockchain transactions';
COMMENT ON TABLE public.fiat_wallets IS 'Stores fiat/mobile money balance for users';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Now you have:
-- - crypto_wallets: For blockchain/crypto (SKETH, SKUSD, etc.)
-- - fiat_wallets: For mobile money/fiat balance (KES, USD, etc.)
