# New Supabase Database Setup

## ✅ Step 1: Test Connection (Do This First!)

Run this command to test if the app can connect to your new database:

```bash
node scripts/test-supabase-connection.js
```

This will verify:
- Connection is working
- Check if wallets table exists
- List all tables in your database

## 📊 Step 2: Create Wallets Table

Go to your Supabase dashboard SQL Editor:
**https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo/sql**

Run this SQL:

```sql
-- Create wallets table
CREATE TABLE public.wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL UNIQUE,
  encrypted_private_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_wallets_address ON public.wallets(wallet_address);

-- Enable Row Level Security
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

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

-- Add comment
COMMENT ON TABLE public.wallets IS 'Stores encrypted wallet private keys for users';
```

## 🚀 Step 3: Deploy Edge Functions

### Option A: Manual Deployment (Easiest)

1. Go to **Edge Functions** in your Supabase dashboard:
   **https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo/functions**

2. Click **"Create a new function"** for each function below

3. Copy the code from the files in `supabase/functions/`

### Option B: CLI Deployment

If you get the Supabase CLI working:

```bash
npx supabase link --project-ref ortjjekmexmyvkkotioo
npx supabase functions deploy
```

## 🔐 Step 4: Set Edge Function Secrets

Go to **Edge Functions → Settings**:
**https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo/settings/functions**

Add these secrets:

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `WALLET_ENCRYPTION_KEY` | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Encryption key |
| `RPC_URL` | Your blockchain RPC URL | e.g., `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY` or `http://localhost:8545` |
| `TOKEN_SKETH_ADDRESS` | Your deployed SKETH address | From blockchain deployment |
| `TOKEN_SKUSD_ADDRESS` | Your deployed SKUSD address | From blockchain deployment |
| `TOKEN_SKBTC_ADDRESS` | Your deployed SKBTC address | From blockchain deployment |
| `TOKEN_SKDAI_ADDRESS` | Your deployed SKDAI address | From blockchain deployment |
| `TOKEN_SWAP_ADDRESS` | Your deployed TokenSwap address | From blockchain deployment |

## 🧪 Step 5: Test the App

1. Pull latest code: `git pull origin main`
2. Install dependencies: `pnpm install`
3. Start app: `npx expo start`
4. Try connecting wallet in the app

## 📝 Your New Database Info

```
Project URL: https://ortjjekmexmyvkkotioo.supabase.co
Project Ref: ortjjekmexmyvkkotioo
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: (keep this secret!)
```

## ✅ Checklist

- [ ] Test connection with `node scripts/test-supabase-connection.js`
- [ ] Create wallets table in SQL Editor
- [ ] Deploy 4 Edge Functions
- [ ] Set Edge Function secrets
- [ ] Test wallet connection in app

## 🔗 Quick Links

- **Dashboard:** https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo
- **SQL Editor:** https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo/sql
- **Edge Functions:** https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo/functions
- **Settings:** https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo/settings/general

---

**Ready to go!** Start with Step 1 (test connection) and work your way through. 🚀
