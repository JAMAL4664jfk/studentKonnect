# Fully Automated Smart Contract Setup

## Overview

This project now features **fully automated smart contract deployment and wallet management**. You don't need to run any manual commands - everything happens automatically when you start the app!

## What's Automated

### 1. **Contract Compilation** ✅
- Contracts are automatically compiled when you run `pnpm dev`
- No need to run `npx hardhat compile` manually

### 2. **Contract Deployment** ✅
- Smart contracts automatically deploy when the server starts
- Deployment only happens once - subsequent starts use existing contracts
- All tokens (SKETH, SKUSD, SKBTC, SKDAI) and TokenSwap DEX are deployed automatically

### 3. **Exchange Rate Configuration** ✅
- Exchange rates are automatically set up between all token pairs
- TokenSwap contract is automatically funded with liquidity

### 4. **Wallet Creation** ✅
- New wallets are created automatically when users connect
- No manual wallet setup required

### 5. **Automatic Funding** ✅
- New wallets are automatically funded with initial tokens (development mode only)
- Each new wallet receives:
  - 100 SKETH
  - 10,000 SKUSD
  - 1 SKBTC
  - 5,000 SKDAI

---

## Quick Start (2 Steps Only!)

### Step 1: Start Hardhat Node

In one terminal:

```bash
cd blockchain
npx hardhat node
```

**Keep this terminal open** - this is your local blockchain.

### Step 2: Start the App

In another terminal:

```bash
pnpm dev
```

That's it! Everything else happens automatically:
- ✅ Contracts compile
- ✅ Contracts deploy
- ✅ Exchange rates configure
- ✅ Liquidity pools fund
- ✅ Server starts
- ✅ App opens

---

## How It Works

### Server Startup Sequence

When you run `pnpm dev`, the following happens automatically:

1. **Pre-dev script runs** (`blockchain/scripts/auto-compile.js`)
   - Checks if contract artifacts exist
   - Compiles contracts if needed
   - Skips compilation if already compiled

2. **Server starts** (`server/_core/index.ts`)
   - Loads environment variables
   - Registers API routes
   - Calls `initializeOnStartup()`

3. **Blockchain initialization** (`server/crypto/startup.ts`)
   - Checks if blockchain is available
   - Calls `ensureBlockchainInitialized()`

4. **Smart contract deployment** (`server/crypto/blockchain-init.ts`)
   - Checks if contracts are already deployed
   - If not deployed:
     - Deploys all 4 token contracts
     - Deploys TokenSwap DEX
     - Sets up exchange rates
     - Funds liquidity pools
     - Saves deployment info to `blockchain/deployments.json`
   - If already deployed:
     - Loads existing deployment info
     - Skips deployment

5. **Auto-funding service initializes** (`server/crypto/auto-funding.ts`)
   - Prepares to auto-fund new wallets
   - Uses Hardhat account #0 as funder

6. **Server ready** 🎉
   - All blockchain services operational
   - API endpoints ready to use
   - Frontend can connect

### Wallet Creation Flow

When a user connects their wallet in the app:

1. **Frontend calls** `POST /api/crypto/wallet/create`

2. **Backend automatically**:
   - Ensures blockchain is initialized (if not already)
   - Creates a new wallet
   - Encrypts and stores private key
   - Checks if wallet needs funding
   - Auto-funds wallet with initial tokens (dev mode only)
   - Returns wallet address to frontend

3. **Frontend receives** wallet address and loads balances

4. **User can immediately**:
   - View token balances
   - Send tokens
   - Swap tokens
   - No manual funding needed!

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Opens App                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      pnpm dev command                        │
│  1. Auto-compile contracts (if needed)                      │
│  2. Start server                                            │
│  3. Start Metro bundler                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Server Initialization                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  initializeOnStartup()                                │ │
│  │  ├─ Check blockchain availability                     │ │
│  │  ├─ ensureBlockchainInitialized()                     │ │
│  │  │  ├─ Check if contracts deployed                    │ │
│  │  │  ├─ Deploy if needed                               │ │
│  │  │  └─ Load deployment info                           │ │
│  │  └─ Initialize auto-funding service                   │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Server Ready - API Active                  │
│  ✅ Smart contracts deployed                                │
│  ✅ Exchange rates configured                               │
│  ✅ Liquidity pools funded                                  │
│  ✅ Auto-funding ready                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  User Connects Wallet in App                 │
│  POST /api/crypto/wallet/create                             │
│  ├─ Create wallet                                           │
│  ├─ Auto-fund with tokens                                   │
│  └─ Return address                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    User Can Immediately:                     │
│  ✅ View balances (100 SKETH, 10k SKUSD, etc.)             │
│  ✅ Send tokens                                             │
│  ✅ Swap tokens                                             │
│  ✅ View transaction history                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Files

### Automation Services

| File | Purpose |
|------|---------|
| `blockchain/scripts/auto-compile.js` | Auto-compiles contracts if artifacts don't exist |
| `server/crypto/blockchain-init.ts` | Auto-deploys contracts on server startup |
| `server/crypto/auto-funding.ts` | Auto-funds new wallets with initial tokens |
| `server/crypto/startup.ts` | Orchestrates all initialization on server start |
| `server/crypto/crypto-router.ts` | API endpoints with auto-initialization |
| `server/_core/index.ts` | Main server entry point with startup hook |

### Generated Files (Auto-created)

| File | Purpose |
|------|---------|
| `blockchain/artifacts/` | Compiled contract artifacts (auto-generated) |
| `blockchain/deployments.json` | Deployed contract addresses (auto-generated) |
| `blockchain/cache/` | Hardhat cache (auto-generated) |

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Blockchain Configuration
RPC_URL=http://localhost:8545
CHAIN_ID=1337

# Wallet Encryption
PRIVATE_KEY_ENCRYPTION_KEY=your-32-byte-hex-key-here

# Hardhat Default Account (from Hardhat node)
ADMIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Generate encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Development vs Production

### Development Mode (Current Setup)

- **Auto-funding**: ✅ Enabled
  - New wallets automatically receive tokens
  - No manual funding needed
  
- **Contract deployment**: Automatic
  - Deploys to local Hardhat node
  - Uses well-known test private keys

### Production Mode

To prepare for production:

1. **Disable auto-funding**:
   ```typescript
   // In auto-funding.ts, autoFundIfNeeded() checks:
   if (process.env.NODE_ENV === "production") {
     return; // Auto-funding disabled
   }
   ```

2. **Use secure key management**:
   - Replace environment variable keys with AWS KMS or HashiCorp Vault
   - Implement proper authentication
   - Add rate limiting

3. **Deploy to testnet/mainnet**:
   - Update RPC URL to testnet (e.g., Sepolia)
   - Use real private keys (never commit to git!)
   - Verify contracts on Etherscan

---

## Troubleshooting

### "Blockchain not available"

**Problem**: Server can't connect to Hardhat node

**Solution**: Make sure Hardhat node is running:
```bash
cd blockchain
npx hardhat node
```

### "Contract artifact not found"

**Problem**: Contracts haven't been compiled

**Solution**: Contracts should auto-compile, but you can manually compile:
```bash
cd blockchain
npx hardhat compile
```

### "Deployment failed"

**Problem**: Contract deployment encountered an error

**Solution**: 
1. Restart Hardhat node (Ctrl+C, then `npx hardhat node`)
2. Delete `blockchain/deployments.json`
3. Restart server (`pnpm dev`)

### "Auto-funding not working"

**Problem**: New wallets aren't receiving tokens

**Solution**:
1. Check that `NODE_ENV=development` in `.env`
2. Verify deployer has tokens (check Hardhat node output)
3. Check server logs for funding errors

---

## What You DON'T Need to Do

❌ **No manual contract compilation** - Happens automatically
❌ **No manual contract deployment** - Happens automatically  
❌ **No manual exchange rate setup** - Happens automatically
❌ **No manual liquidity funding** - Happens automatically
❌ **No manual wallet funding** - Happens automatically
❌ **No hardhat commands** - Only need to start the node
❌ **No deployment scripts** - Everything is automatic

---

## What You DO Need to Do

✅ **Start Hardhat node** - `cd blockchain && npx hardhat node`
✅ **Start the app** - `pnpm dev`
✅ **That's it!** Everything else is automatic

---

## Advanced: Customizing Auto-Funding

Edit `server/crypto/auto-funding.ts` to change initial funding amounts:

```typescript
const fundingAmounts = [
  { symbol: "SKETH", amount: "100", decimals: 18 },    // Change to "200" for more
  { symbol: "SKUSD", amount: "10000", decimals: 6 },   // Change to "20000" for more
  { symbol: "SKBTC", amount: "1", decimals: 8 },
  { symbol: "SKDAI", amount: "5000", decimals: 18 },
];
```

---

## Summary

This setup provides a **fully automated development experience** where:

1. You start Hardhat node (one command)
2. You start the app (one command)
3. Everything else happens automatically

No more manual deployment, no more funding scripts, no more configuration. Just start the node, start the app, and begin building!

**Happy coding!** 🚀
