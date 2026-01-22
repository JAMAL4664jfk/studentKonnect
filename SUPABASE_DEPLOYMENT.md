# Supabase Edge Functions Deployment Guide

## Overview

This guide will help you deploy the crypto backend to Supabase Edge Functions, eliminating all local networking issues and providing a permanent public API URL that works on all platforms.

---

## Benefits of Supabase Deployment

✅ **No More Networking Issues**: Works on all devices immediately
✅ **Permanent Public URL**: No ngrok, no local IPs, no configuration
✅ **Production Ready**: Scales automatically
✅ **Free Tier Available**: Perfect for development and small apps
✅ **Secure**: Built-in authentication and encryption
✅ **Fast**: Edge functions run close to your users

---

## Prerequisites

1. **Supabase Account** (free): [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Supabase CLI** installed
3. **Node.js** and **pnpm** installed

---

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

---

## Step 2: Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Name**: studentKonnect
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait for project to be ready (~2 minutes)

---

## Step 3: Link Your Local Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

**To find your project ref:**
- Go to your project dashboard
- Click "Settings" → "General"
- Copy the "Reference ID"

---

## Step 4: Set Up Database

Run the migration to create the wallets table:

```bash
supabase db push
```

This creates the `wallets` table in your Supabase database.

---

## Step 5: Configure Environment Variables

### In Supabase Dashboard

1. Go to your project dashboard
2. Click "Edge Functions" → "Settings"
3. Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `WALLET_ENCRYPTION_KEY` | (generate with command below) | Encrypts wallet private keys |
| `RPC_URL` | Your blockchain RPC URL | e.g., Alchemy, Infura, or local |
| `TOKEN_SKETH_ADDRESS` | Deployed SKETH address | From blockchain deployment |
| `TOKEN_SKUSD_ADDRESS` | Deployed SKUSD address | From blockchain deployment |
| `TOKEN_SKBTC_ADDRESS` | Deployed SKBTC address | From blockchain deployment |
| `TOKEN_SKDAI_ADDRESS` | Deployed SKDAI address | From blockchain deployment |
| `TOKEN_SWAP_ADDRESS` | Deployed TokenSwap address | From blockchain deployment |

**Generate encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### In Your Local `.env` File

Add these to your `.env` file:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Blockchain Configuration (for local development)
RPC_URL=http://localhost:8545
```

**To find your Supabase keys:**
- Go to project dashboard
- Click "Settings" → "API"
- Copy "Project URL" and "anon public" key

---

## Step 6: Deploy Edge Functions

Deploy all functions at once:

```bash
supabase functions deploy create-wallet
supabase functions deploy send-token
supabase functions deploy swap-token
supabase functions deploy get-tokens
```

Or deploy all with one command:

```bash
supabase functions deploy
```

---

## Step 7: Test the Deployment

### Test from Command Line

```bash
# Test create-wallet function
curl -X POST \
  'https://your-project-ref.supabase.co/functions/v1/create-wallet' \
  -H 'Authorization: Bearer your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{"userId": "test-user"}'
```

### Test from Your App

1. Make sure `.env` has your Supabase URL and key
2. Restart your app: `npx expo start -c`
3. Try connecting wallet - should work!

---

## Step 8: Deploy Smart Contracts to Testnet

For production, deploy your contracts to a testnet (e.g., Sepolia):

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network sepolia
```

Update the contract addresses in Supabase Edge Functions settings.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                          │
│              (iOS, Android, Web)                             │
└─────────────────────────────────────────────────────────────┘
                         ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Functions                         │
│  https://your-project.supabase.co/functions/v1              │
│                                                              │
│  ├─ /create-wallet  - Create new wallet                    │
│  ├─ /send-token     - Send tokens                          │
│  ├─ /swap-token     - Swap tokens                          │
│  └─ /get-tokens     - Get token addresses                  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  Supabase PostgreSQL                         │
│              (Encrypted Wallet Storage)                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  Blockchain Network                          │
│           (Ethereum, Polygon, etc.)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Edge Functions Overview

### 1. create-wallet

**Endpoint**: `/create-wallet`

**Request**:
```json
{
  "userId": "user-123"
}
```

**Response**:
```json
{
  "success": true,
  "address": "0x..."
}
```

**What it does**:
- Creates new Ethereum wallet
- Encrypts private key
- Stores in Supabase database
- Returns wallet address

### 2. send-token

**Endpoint**: `/send-token`

**Request**:
```json
{
  "from": "0x...",
  "to": "0x...",
  "tokenAddress": "0x...",
  "amount": "10"
}
```

**Response**:
```json
{
  "success": true,
  "transactionHash": "0x..."
}
```

**What it does**:
- Retrieves encrypted private key
- Signs transaction
- Sends tokens on blockchain
- Returns transaction hash

### 3. swap-token

**Endpoint**: `/swap-token`

**Request**:
```json
{
  "from": "0x...",
  "tokenInAddress": "0x...",
  "tokenOutAddress": "0x...",
  "amountIn": "10",
  "minAmountOut": "9"
}
```

**Response**:
```json
{
  "success": true,
  "transactionHash": "0x..."
}
```

**What it does**:
- Approves TokenSwap contract
- Executes swap
- Returns transaction hash

### 4. get-tokens

**Endpoint**: `/get-tokens`

**Response**:
```json
{
  "success": true,
  "tokens": {
    "SKETH": "0x...",
    "SKUSD": "0x...",
    "SKBTC": "0x...",
    "SKDAI": "0x..."
  },
  "swapAddress": "0x..."
}
```

**What it does**:
- Returns deployed token addresses
- Returns TokenSwap address

---

## Security Considerations

### ✅ Implemented

- **Encrypted Private Keys**: Keys stored encrypted in database
- **CORS Protection**: Only your app can access functions
- **Row Level Security**: Database access controlled
- **Service Role Only**: Functions use service role for database access

### 🔒 For Production

1. **Use Supabase Vault**: Store encryption keys in Supabase Vault
2. **Implement Rate Limiting**: Prevent abuse
3. **Add User Authentication**: Require auth tokens
4. **Use Hardware Security Module (HSM)**: For production key management
5. **Enable Logging**: Monitor all transactions
6. **Add 2FA**: For sensitive operations

---

## Monitoring and Logs

### View Function Logs

```bash
supabase functions logs create-wallet
```

### View All Logs

```bash
supabase functions logs
```

### Real-time Logs

```bash
supabase functions logs --tail
```

---

## Updating Functions

After making changes to function code:

```bash
# Deploy single function
supabase functions deploy create-wallet

# Deploy all functions
supabase functions deploy
```

---

## Costs

### Supabase Free Tier

- ✅ 500MB database storage
- ✅ 2GB file storage
- ✅ 2 million Edge Function invocations/month
- ✅ 50,000 monthly active users

**Perfect for development and small apps!**

### Pro Tier ($25/month)

- 8GB database storage
- 100GB file storage
- Unlimited Edge Function invocations
- 100,000 monthly active users

---

## Troubleshooting

### "Module not found" Error

**Problem**: Edge function can't find npm package

**Solution**: Supabase Edge Functions use Deno, which imports npm packages differently:
```typescript
import { ethers } from "npm:ethers@6.13.0";
```

### "CORS Error"

**Problem**: Browser blocks request

**Solution**: Edge functions already have CORS headers. Make sure you're using the correct Supabase URL and anon key.

### "Unauthorized"

**Problem**: Missing or invalid API key

**Solution**: Add `EXPO_PUBLIC_SUPABASE_ANON_KEY` to `.env` file.

### "Wallet not found"

**Problem**: Wallet doesn't exist in database

**Solution**: Call `/create-wallet` first before sending transactions.

---

## Local Development

You can run Edge Functions locally for testing:

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve
```

Functions will be available at `http://localhost:54321/functions/v1/`

---

## Migration from Local Backend

### Before (Local Backend)

```typescript
// Had to use different URLs for different platforms
const url = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
```

### After (Supabase)

```typescript
// One URL works everywhere!
const url = 'https://your-project.supabase.co/functions/v1';
```

---

## Summary

### What You Get

✅ **Permanent Public URL**: Works on all devices
✅ **No Local Server**: No need to run backend locally
✅ **No Networking Issues**: No ngrok, no IP addresses
✅ **Production Ready**: Scales automatically
✅ **Secure**: Encrypted storage, RLS, authentication
✅ **Free Tier**: Perfect for development

### Steps to Deploy

1. Create Supabase project
2. Link local project
3. Push database migration
4. Configure environment variables
5. Deploy Edge Functions
6. Update `.env` with Supabase URL and key
7. Test in your app

### Result

Your app now works on **all platforms** without any networking configuration!

---

## Next Steps

1. **Deploy to Testnet**: Deploy contracts to Sepolia or Polygon Mumbai
2. **Add Authentication**: Implement user login with Supabase Auth
3. **Add Monitoring**: Set up logging and alerts
4. **Optimize**: Add caching and rate limiting
5. **Go to Production**: Deploy to mainnet when ready

**Happy deploying!** 🚀
