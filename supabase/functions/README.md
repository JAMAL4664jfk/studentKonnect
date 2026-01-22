# Supabase Edge Functions

These Edge Functions handle all crypto wallet operations for the studentKonnect app.

## Functions

### 1. create-wallet
Creates a new Ethereum wallet and stores the encrypted private key in the database.

**Endpoint:** `/functions/v1/create-wallet`

**Request:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "address": "0x..."
}
```

### 2. send-token
Sends ERC20 tokens from one address to another.

**Endpoint:** `/functions/v1/send-token`

**Request:**
```json
{
  "from": "0x...",
  "to": "0x...",
  "tokenAddress": "0x...",
  "amount": "10"
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x..."
}
```

### 3. swap-token
Swaps tokens using the TokenSwap DEX contract.

**Endpoint:** `/functions/v1/swap-token`

**Request:**
```json
{
  "from": "0x...",
  "tokenInAddress": "0x...",
  "tokenOutAddress": "0x...",
  "amountIn": "10",
  "minAmountOut": "9"
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x..."
}
```

### 4. get-tokens
Returns the deployed token contract addresses.

**Endpoint:** `/functions/v1/get-tokens`

**Response:**
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

## Deployment

### Manual Deployment (Recommended for Windows)

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo/functions

2. Click "Create a new function"

3. For each function:
   - Set the name (e.g., `create-wallet`)
   - Copy the code from the corresponding `index.ts` file
   - Click "Deploy"

### CLI Deployment

```bash
npx supabase functions deploy create-wallet
npx supabase functions deploy send-token
npx supabase functions deploy swap-token
npx supabase functions deploy get-tokens
```

Or deploy all at once:
```bash
npx supabase functions deploy
```

## Required Secrets

Set these in Edge Functions → Settings:

| Secret | Description |
|--------|-------------|
| `WALLET_ENCRYPTION_KEY` | 32-byte hex string for encrypting private keys |
| `RPC_URL` | Blockchain RPC endpoint (Alchemy, Infura, or local) |
| `TOKEN_SKETH_ADDRESS` | Deployed SKETH token address |
| `TOKEN_SKUSD_ADDRESS` | Deployed SKUSD token address |
| `TOKEN_SKBTC_ADDRESS` | Deployed SKBTC token address |
| `TOKEN_SKDAI_ADDRESS` | Deployed SKDAI token address |
| `TOKEN_SWAP_ADDRESS` | Deployed TokenSwap contract address |

Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Testing

Test locally:
```bash
npx supabase functions serve
```

Test deployed function:
```bash
curl -X POST \
  'https://ortjjekmexmyvkkotioo.supabase.co/functions/v1/create-wallet' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"userId": "test-user"}'
```

## Architecture

```
React Native App
      ↓
Supabase Edge Functions (Deno)
      ↓
PostgreSQL Database (encrypted keys)
      ↓
Blockchain (Ethereum/Polygon/etc)
```

## Security

- Private keys are encrypted before storage
- Row Level Security (RLS) enabled on wallets table
- Service role required for Edge Functions
- CORS headers configured for your app only

## Logs

View function logs:
```bash
npx supabase functions logs create-wallet
```

Or in dashboard: https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo/logs/edge-functions
