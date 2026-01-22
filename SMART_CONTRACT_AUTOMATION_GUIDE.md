# Smart Contract Automation Guide for Student Konnect

## Table of Contents
1. [Fixing the Ethers Bundling Error](#fixing-the-ethers-bundling-error)
2. [Smart Contract Architecture Overview](#smart-contract-architecture-overview)
3. [Wallet Connection Flow](#wallet-connection-flow)
4. [Automating Smart Contract Interactions](#automating-smart-contract-interactions)
5. [Backend Integration](#backend-integration)
6. [Testing and Deployment](#testing-and-deployment)

---

## Fixing the Ethers Bundling Error

### Problem
The error `Unable to resolve "ethers" from "contexts\CryptoWalletContext.tsx"` occurs because **ethers.js v6** requires Node.js crypto polyfills that aren't available in React Native by default.

### Solution Applied

I've already fixed this issue in your repository with the following changes:

#### 1. **Installed Required Polyfills**
```bash
pnpm add react-native-crypto readable-stream buffer react-native-get-random-values
```

#### 2. **Updated `metro.config.js`**
Added resolver configuration to map Node.js modules to React Native equivalents:

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add resolver configuration for ethers and crypto polyfills
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    crypto: require.resolve("react-native-crypto"),
    stream: require.resolve("readable-stream"),
    buffer: require.resolve("buffer"),
  },
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  forceWriteFileSystem: true,
});
```

#### 3. **Updated `app/_layout.tsx`**
Added polyfill imports at the very top of the app entry point:

```typescript
import "react-native-get-random-values";
import { Buffer } from "buffer";
global.Buffer = Buffer;
import "@/global.css";
// ... rest of imports
```

### Verification
After pulling these changes from GitHub:
1. Run `pnpm install` to ensure all dependencies are installed
2. Clear Metro bundler cache: `npx expo start -c`
3. The bundling error should be resolved

---

## Smart Contract Architecture Overview

Your Student Konnect app has a **custom token ecosystem** with the following components:

### Deployed Smart Contracts

#### 1. **StudentToken.sol** (ERC20 Token)
- **Purpose**: Custom ERC20 token with configurable decimals
- **Features**:
  - Mintable (owner only)
  - Burnable
  - Configurable decimals (18 for SKETH/SKDAI, 6 for SKUSD, 8 for SKBTC)
- **Tokens Created**:
  - **SKETH** (Student Konnect ETH) - 18 decimals
  - **SKUSD** (Student Konnect USD) - 6 decimals
  - **SKBTC** (Student Konnect BTC) - 8 decimals
  - **SKDAI** (Student Konnect DAI) - 18 decimals

#### 2. **TokenSwap.sol** (DEX Contract)
- **Purpose**: Decentralized exchange for swapping tokens
- **Features**:
  - Configurable exchange rates
  - Swap fee (default 0.3%)
  - Slippage protection
  - Emergency withdrawal (owner only)
- **Exchange Rates**:
  - 1 SKETH = 2000 SKUSD
  - 1 SKETH = 0.05 SKBTC
  - 1 SKUSD = 1 SKDAI

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    React Native App                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │         CryptoWalletContext (Frontend)           │  │
│  │  - connectWallet()                               │  │
│  │  - sendToken()                                   │  │
│  │  - swapTokens()                                  │  │
│  │  - refreshBalances()                             │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓ HTTP API                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Backend Server                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Crypto API Endpoints                     │  │
│  │  POST /api/crypto/wallet/create                  │  │
│  │  POST /api/crypto/transaction/send               │  │
│  │  POST /api/crypto/transaction/swap               │  │
│  │  GET  /api/crypto/tokens                         │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓ ethers.js                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Blockchain (Hardhat Node)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ StudentToken │  │ StudentToken │  │  TokenSwap   │ │
│  │   (SKETH)    │  │   (SKUSD)    │  │   Contract   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Wallet Connection Flow

### Current Implementation

The `CryptoWalletContext` provides wallet functionality through a **backend-managed wallet** approach:

```typescript
const connectWallet = async () => {
  // Call backend API to create/retrieve wallet
  const response = await fetch("http://localhost:3000/api/crypto/wallet/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  
  const data = await response.json();
  setAddress(data.address);
  setIsConnected(true);
  
  // Load token configurations and balances
  await loadTokenConfigs();
  await refreshBalances();
};
```

### Wallet Connection Options

You have **three approaches** for wallet management:

#### Option 1: Backend-Managed Wallets (Current Implementation)
**Best for**: Simplified UX, no external wallet required

**Flow**:
1. User clicks "Connect Wallet"
2. Backend creates/retrieves a wallet for the user
3. Private key stored securely on backend
4. All transactions signed server-side

**Pros**:
- Simple user experience
- No external wallet installation needed
- Works on all platforms

**Cons**:
- Users don't control private keys
- Requires secure backend infrastructure
- Not truly decentralized

#### Option 2: WalletConnect Integration
**Best for**: Mobile users with external wallets (MetaMask, Trust Wallet)

**Implementation**:
```bash
pnpm add @walletconnect/react-native-dapp @walletconnect/web3-provider
```

**Flow**:
1. User scans QR code with mobile wallet
2. Wallet connects via WalletConnect protocol
3. Transactions signed in user's wallet
4. App receives signed transactions

#### Option 3: In-App Wallet Generation
**Best for**: Full decentralization with user-controlled keys

**Implementation**:
```typescript
import { ethers } from "ethers";
import * as SecureStore from "expo-secure-store";

const createWallet = async () => {
  // Generate new wallet
  const wallet = ethers.Wallet.createRandom();
  
  // Store encrypted private key
  await SecureStore.setItemAsync(
    "wallet_private_key",
    wallet.privateKey,
    { keychainAccessible: SecureStore.WHEN_UNLOCKED }
  );
  
  return {
    address: wallet.address,
    mnemonic: wallet.mnemonic.phrase, // Show to user for backup
  };
};
```

---

## Automating Smart Contract Interactions

### 1. Token Balance Queries

**Current Implementation** (Read-only, no gas fees):

```typescript
const getTokenBalance = async (tokenAddress: string): Promise<string> => {
  if (!address || !provider) return "0";

  const tokenABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
  const balance = await tokenContract.balanceOf(address);
  const decimals = await tokenContract.decimals();

  return ethers.formatUnits(balance, decimals);
};
```

**Automation Strategy**:
- Use **polling** or **WebSocket subscriptions** to refresh balances
- Implement **caching** to reduce RPC calls
- Use **multicall** contracts to batch balance queries

### 2. Sending Tokens

**Current Implementation** (Backend-signed):

```typescript
const sendToken = async (
  tokenAddress: string,
  to: string,
  amount: string
): Promise<string> => {
  // Call backend API to send tokens
  const response = await fetch("http://localhost:3000/api/crypto/transaction/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from: address,
      to,
      tokenAddress,
      amount,
    }),
  });

  const data = await response.json();
  return data.txHash;
};
```

**Backend Implementation** (server/api/crypto/transaction.ts):

```typescript
import { ethers } from "ethers";

export async function sendToken(
  from: string,
  to: string,
  tokenAddress: string,
  amount: string
) {
  // Connect to blockchain
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  
  // Load wallet (from secure storage/env)
  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, provider);
  
  // Create contract instance
  const tokenABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
  ];
  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);
  
  // Get decimals and parse amount
  const decimals = await tokenContract.decimals();
  const amountWei = ethers.parseUnits(amount, decimals);
  
  // Send transaction
  const tx = await tokenContract.transfer(to, amountWei);
  await tx.wait(); // Wait for confirmation
  
  return {
    txHash: tx.hash,
    from: wallet.address,
    to,
    amount,
    token: tokenAddress,
  };
}
```

### 3. Token Swapping

**Current Implementation**:

```typescript
const swapTokens = async (
  tokenInAddress: string,
  tokenOutAddress: string,
  amountIn: string,
  minAmountOut: string
): Promise<string> => {
  const response = await fetch("http://localhost:3000/api/crypto/transaction/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from: address,
      tokenInAddress,
      tokenOutAddress,
      amountIn,
      minAmountOut,
    }),
  });

  const data = await response.json();
  return data.txHash;
};
```

**Backend Implementation**:

```typescript
export async function swapTokens(
  from: string,
  tokenInAddress: string,
  tokenOutAddress: string,
  amountIn: string,
  minAmountOut: string
) {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, provider);
  
  // Load TokenSwap contract
  const swapAddress = process.env.TOKEN_SWAP_ADDRESS!;
  const swapABI = [
    "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) returns (uint256)",
  ];
  const swapContract = new ethers.Contract(swapAddress, swapABI, wallet);
  
  // Approve TokenSwap to spend tokens
  const tokenABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
  ];
  const tokenInContract = new ethers.Contract(tokenInAddress, tokenABI, wallet);
  
  const decimals = await tokenInContract.decimals();
  const amountInWei = ethers.parseUnits(amountIn, decimals);
  
  // Approve
  const approveTx = await tokenInContract.approve(swapAddress, amountInWei);
  await approveTx.wait();
  
  // Execute swap
  const minAmountOutWei = ethers.parseUnits(minAmountOut, decimals);
  const swapTx = await swapContract.swap(
    tokenInAddress,
    tokenOutAddress,
    amountInWei,
    minAmountOutWei
  );
  await swapTx.wait();
  
  return {
    txHash: swapTx.hash,
    from: wallet.address,
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn,
  };
}
```

### 4. Automated Transaction Monitoring

**Implementation**:

```typescript
import { ethers } from "ethers";

export class TransactionMonitor {
  private provider: ethers.JsonRpcProvider;
  private listeners: Map<string, (tx: any) => void> = new Map();

  constructor(rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  // Monitor specific transaction
  async watchTransaction(txHash: string, callback: (receipt: any) => void) {
    const receipt = await this.provider.waitForTransaction(txHash);
    callback(receipt);
  }

  // Monitor all transactions for an address
  async watchAddress(address: string, callback: (tx: any) => void) {
    this.provider.on("block", async (blockNumber) => {
      const block = await this.provider.getBlock(blockNumber, true);
      
      if (block && block.transactions) {
        for (const tx of block.transactions) {
          if (typeof tx === "object" && (tx.from === address || tx.to === address)) {
            callback(tx);
          }
        }
      }
    });
  }

  // Monitor token transfers
  async watchTokenTransfers(
    tokenAddress: string,
    userAddress: string,
    callback: (event: any) => void
  ) {
    const tokenABI = [
      "event Transfer(address indexed from, address indexed to, uint256 value)",
    ];
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, this.provider);

    // Listen for transfers involving user
    tokenContract.on(
      tokenContract.filters.Transfer(userAddress, null),
      (from, to, value, event) => {
        callback({ from, to, value: value.toString(), txHash: event.log.transactionHash });
      }
    );

    tokenContract.on(
      tokenContract.filters.Transfer(null, userAddress),
      (from, to, value, event) => {
        callback({ from, to, value: value.toString(), txHash: event.log.transactionHash });
      }
    );
  }

  stopAll() {
    this.provider.removeAllListeners();
  }
}
```

**Usage in Backend**:

```typescript
const monitor = new TransactionMonitor("http://localhost:8545");

// Watch for incoming token transfers
monitor.watchTokenTransfers(
  "0x...", // SKETH address
  userWalletAddress,
  (event) => {
    console.log("Token transfer detected:", event);
    // Update database, send notification, etc.
  }
);
```

---

## Backend Integration

### Complete Backend API Structure

Create these files in your `server/` directory:

#### `server/api/crypto/wallet.ts`

```typescript
import { ethers } from "ethers";
import * as crypto from "crypto";

// In production, use a proper key management service (AWS KMS, HashiCorp Vault)
const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY!;

interface WalletData {
  address: string;
  encryptedPrivateKey: string;
}

// Store wallets in database (example using in-memory for demo)
const wallets = new Map<string, WalletData>();

export async function createWallet(userId: string): Promise<{ address: string }> {
  // Check if wallet already exists
  if (wallets.has(userId)) {
    return { address: wallets.get(userId)!.address };
  }

  // Generate new wallet
  const wallet = ethers.Wallet.createRandom();

  // Encrypt private key
  const cipher = crypto.createCipher("aes-256-cbc", ENCRYPTION_KEY);
  let encryptedPrivateKey = cipher.update(wallet.privateKey, "utf8", "hex");
  encryptedPrivateKey += cipher.final("hex");

  // Store wallet
  wallets.set(userId, {
    address: wallet.address,
    encryptedPrivateKey,
  });

  return { address: wallet.address };
}

export function getWallet(userId: string): ethers.Wallet {
  const walletData = wallets.get(userId);
  if (!walletData) {
    throw new Error("Wallet not found");
  }

  // Decrypt private key
  const decipher = crypto.createDecipher("aes-256-cbc", ENCRYPTION_KEY);
  let privateKey = decipher.update(walletData.encryptedPrivateKey, "hex", "utf8");
  privateKey += decipher.final("utf8");

  // Create wallet instance
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
  return new ethers.Wallet(privateKey, provider);
}
```

#### `server/api/crypto/tokens.ts`

```typescript
import { ethers } from "ethers";

const TOKEN_ADDRESSES = {
  SKETH: process.env.SKETH_ADDRESS!,
  SKUSD: process.env.SKUSD_ADDRESS!,
  SKBTC: process.env.SKBTC_ADDRESS!,
  SKDAI: process.env.SKDAI_ADDRESS!,
};

export async function getTokens() {
  return {
    tokens: TOKEN_ADDRESSES,
  };
}

export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
  
  const tokenABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];
  
  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
  const balance = await tokenContract.balanceOf(walletAddress);
  const decimals = await tokenContract.decimals();
  
  return ethers.formatUnits(balance, decimals);
}
```

#### `server/api/crypto/transactions.ts`

```typescript
import { ethers } from "ethers";
import { getWallet } from "./wallet";

export async function sendToken(
  userId: string,
  to: string,
  tokenAddress: string,
  amount: string
) {
  const wallet = getWallet(userId);
  
  const tokenABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
  ];
  
  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);
  const decimals = await tokenContract.decimals();
  const amountWei = ethers.parseUnits(amount, decimals);
  
  const tx = await tokenContract.transfer(to, amountWei);
  const receipt = await tx.wait();
  
  return {
    txHash: tx.hash,
    status: receipt.status === 1 ? "confirmed" : "failed",
    from: wallet.address,
    to,
    amount,
  };
}

export async function swapTokens(
  userId: string,
  tokenInAddress: string,
  tokenOutAddress: string,
  amountIn: string,
  minAmountOut: string
) {
  const wallet = getWallet(userId);
  const swapAddress = process.env.TOKEN_SWAP_ADDRESS!;
  
  // Approve
  const tokenABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
  ];
  const tokenInContract = new ethers.Contract(tokenInAddress, tokenABI, wallet);
  const decimals = await tokenInContract.decimals();
  const amountInWei = ethers.parseUnits(amountIn, decimals);
  
  const approveTx = await tokenInContract.approve(swapAddress, amountInWei);
  await approveTx.wait();
  
  // Swap
  const swapABI = [
    "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) returns (uint256)",
  ];
  const swapContract = new ethers.Contract(swapAddress, swapABI, wallet);
  const minAmountOutWei = ethers.parseUnits(minAmountOut, decimals);
  
  const swapTx = await swapContract.swap(
    tokenInAddress,
    tokenOutAddress,
    amountInWei,
    minAmountOutWei
  );
  const receipt = await swapTx.wait();
  
  return {
    txHash: swapTx.hash,
    status: receipt.status === 1 ? "confirmed" : "failed",
  };
}
```

---

## Testing and Deployment

### 1. Local Development Setup

#### Start Hardhat Node

```bash
cd blockchain
npx hardhat node
```

This starts a local blockchain at `http://localhost:8545` with 20 test accounts.

#### Deploy Contracts

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

This deploys all tokens and the TokenSwap contract, and saves addresses to `blockchain/deployments.json`.

#### Update Environment Variables

Create `.env` file in project root:

```env
# Blockchain
RPC_URL=http://localhost:8545
WALLET_ENCRYPTION_KEY=your-secret-encryption-key-here

# Contract Addresses (from deployments.json)
SKETH_ADDRESS=0x...
SKUSD_ADDRESS=0x...
SKBTC_ADDRESS=0x...
SKDAI_ADDRESS=0x...
TOKEN_SWAP_ADDRESS=0x...

# Deployer wallet (from Hardhat node output)
WALLET_PRIVATE_KEY=0x...
```

### 2. Testing Smart Contract Interactions

#### Test Token Transfer

```bash
curl -X POST http://localhost:3000/api/crypto/transaction/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x...",
    "to": "0x...",
    "tokenAddress": "0x...",
    "amount": "100"
  }'
```

#### Test Token Swap

```bash
curl -X POST http://localhost:3000/api/crypto/transaction/swap \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x...",
    "tokenInAddress": "0x...",
    "tokenOutAddress": "0x...",
    "amountIn": "1",
    "minAmountOut": "1900"
  }'
```

### 3. Production Deployment

#### Deploy to Testnet (e.g., Sepolia)

1. **Update `hardhat.config.ts`**:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

2. **Deploy**:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

3. **Verify Contracts** (optional):

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "Constructor" "Args"
```

### 4. Security Best Practices

#### For Production:

1. **Use Hardware Security Modules (HSM)** or **Key Management Services** (AWS KMS, Google Cloud KMS)
2. **Implement rate limiting** on API endpoints
3. **Add transaction signing approvals** (2FA, biometric)
4. **Monitor for suspicious activity**
5. **Use multi-signature wallets** for high-value operations
6. **Implement gas price optimization**
7. **Add circuit breakers** for emergency stops
8. **Regular security audits** of smart contracts

---

## Next Steps

### Immediate Actions:

1. **Pull the fixes from GitHub**:
   ```bash
   git pull origin main
   pnpm install
   npx expo start -c
   ```

2. **Start local blockchain**:
   ```bash
   cd blockchain
   npx hardhat node
   ```

3. **Deploy contracts**:
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

4. **Update environment variables** with deployed contract addresses

5. **Implement backend API endpoints** using the code examples above

6. **Test wallet connection and transactions** in the app

### Advanced Features to Add:

- **Transaction history** with pagination
- **Gas estimation** before transactions
- **Transaction queueing** for batch operations
- **Price feeds** for real-time token prices
- **Notifications** for transaction confirmations
- **Multi-wallet support** (allow users to create multiple wallets)
- **Wallet backup/recovery** with mnemonic phrases
- **Biometric authentication** for transaction signing

---

## Support and Resources

- **Ethers.js Documentation**: https://docs.ethers.org/v6/
- **Hardhat Documentation**: https://hardhat.org/docs
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts
- **React Native Crypto**: https://github.com/tradle/react-native-crypto
- **Expo SecureStore**: https://docs.expo.dev/versions/latest/sdk/securestore/

---

**Questions or Issues?**

If you encounter any problems or need clarification on any part of this guide, feel free to ask!
