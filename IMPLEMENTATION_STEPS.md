# Smart Contract Automation - Step-by-Step Implementation Guide

## Overview

This guide provides detailed, actionable steps for implementing automated smart contract connections, wallet integration, and transaction signing in your Student Konnect Expo app. The implementation uses a **backend-managed wallet approach** where the server handles private key management and transaction signing, providing a seamless user experience.

---

## Prerequisites

Before starting, ensure you have completed the following:

1. **Fixed the ethers bundling error** (already done - changes pushed to GitHub)
2. **Installed all dependencies**: Run `pnpm install` in your project root
3. **Cleared Metro cache**: Run `npx expo start -c`
4. **Hardhat node running**: The blockchain backend must be operational

---

## Phase 1: Deploy Smart Contracts to Local Blockchain

### Step 1.1: Start Hardhat Node

The Hardhat node provides a local Ethereum blockchain for development and testing. It comes with 20 pre-funded test accounts.

```bash
cd blockchain
npx hardhat node
```

**Expected Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

**Important**: Keep this terminal window open. The Hardhat node must remain running for all subsequent steps.

### Step 1.2: Deploy Smart Contracts

In a new terminal window, deploy the token contracts and DEX:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

**Expected Output:**
```
🚀 Starting deployment...

Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 10000.0 ETH

📝 Deploying tokens...
✅ SKETH deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ SKUSD deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
✅ SKBTC deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
✅ SKDAI deployed to: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

📝 Deploying TokenSwap contract...
✅ TokenSwap deployed to: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

⚙️  Setting up exchange rates...
✅ SKETH -> SKUSD rate set
✅ SKUSD -> SKETH rate set
...

📋 Deployment Summary:
========================
SKETH: 0x5FbDB2315678afecb367f032d93F642f64180aa3
SKUSD: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
SKBTC: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
SKDAI: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
TokenSwap: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
========================

✅ Deployment info saved to deployments.json
🎉 Deployment completed successfully!
```

### Step 1.3: Verify Deployment

Check that the deployment information was saved:

```bash
cat blockchain/deployments.json
```

You should see a JSON file with all contract addresses. This file is automatically loaded by your backend server.

---

## Phase 2: Configure Backend Server

### Step 2.1: Set Up Environment Variables

Create a `.env` file in your project root (if it doesn't exist):

```bash
# Project root directory
touch .env
```

Add the following configuration:

```env
# Blockchain Configuration
RPC_URL=http://localhost:8545
CHAIN_ID=1337

# Wallet Encryption (generate a secure random key)
PRIVATE_KEY_ENCRYPTION_KEY=your-32-byte-hex-key-here

# Hardhat Default Account (from Hardhat node output)
ADMIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Generate a secure encryption key:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as the value for `PRIVATE_KEY_ENCRYPTION_KEY`.

### Step 2.2: Verify Backend Server Structure

Your backend already has the necessary files in place. Verify the structure:

```
server/
├── crypto/
│   ├── wallet-service.ts          # Wallet creation and management
│   ├── blockchain-service.ts      # Smart contract interactions
│   ├── crypto-router.ts           # API endpoints
│   └── transaction-monitor.ts     # Transaction monitoring (new)
├── _core/
│   └── index.ts                   # Main server entry point
└── routers.ts                     # Router registration
```

### Step 2.3: Update Server Entry Point

Ensure the crypto router is registered in `server/_core/index.ts`. The file should already include:

```typescript
import cryptoRouter from "../crypto/crypto-router";

// Register routes
app.use("/api/crypto", cryptoRouter);
```

If this is missing, add it after other router registrations.

### Step 2.4: Start the Backend Server

In a new terminal window:

```bash
# From project root
pnpm dev:server
```

**Expected Output:**
```
Server starting...
Loaded deployment info: { network: 'hardhat', deployer: '0x...', ... }
Server listening on http://localhost:3000
```

**Troubleshooting:**
- If you see "Deployment info not found", ensure `blockchain/deployments.json` exists
- If the server fails to start, check that port 3000 is not already in use

---

## Phase 3: Test Backend API Endpoints

Before integrating with the frontend, verify that all API endpoints are working correctly.

### Step 3.1: Create a Wallet

```bash
curl -X POST http://localhost:3000/api/crypto/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-1"}'
```

**Expected Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Save this address** - you'll need it for subsequent tests.

### Step 3.2: Check Token Balances

Replace `YOUR_WALLET_ADDRESS` with the address from Step 3.1:

```bash
curl http://localhost:3000/api/crypto/wallet/YOUR_WALLET_ADDRESS/balance
```

**Expected Response:**
```json
{
  "success": true,
  "balances": {
    "SKETH": "0.0",
    "SKUSD": "0.0",
    "SKBTC": "0.0",
    "SKDAI": "0.0"
  }
}
```

The balances are zero because this is a new wallet. We'll fund it in the next step.

### Step 3.3: Fund the Test Wallet

We need to transfer some tokens from the deployer account (which has all the initial supply) to our test wallet.

First, get the deployed token addresses:

```bash
curl http://localhost:3000/api/crypto/tokens
```

**Expected Response:**
```json
{
  "success": true,
  "tokens": {
    "SKETH": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "SKUSD": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "SKBTC": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    "SKDAI": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    "TokenSwap": "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
  }
}
```

Now, create a script to fund the wallet. Create `blockchain/scripts/fund-wallet.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const recipientAddress = process.argv[2];
  
  if (!recipientAddress) {
    console.error("Usage: npx hardhat run scripts/fund-wallet.ts --network localhost <address>");
    process.exit(1);
  }

  console.log(`Funding wallet: ${recipientAddress}\n`);

  const [deployer] = await ethers.getSigners();
  
  // Load deployment info
  const fs = require("fs");
  const deploymentInfo = JSON.parse(
    fs.readFileSync("./deployments.json", "utf8")
  );

  // Fund with each token
  const tokens = [
    { name: "SKETH", amount: "100", decimals: 18 },
    { name: "SKUSD", amount: "10000", decimals: 6 },
    { name: "SKBTC", amount: "1", decimals: 8 },
    { name: "SKDAI", amount: "5000", decimals: 18 },
  ];

  for (const token of tokens) {
    const tokenAddress = deploymentInfo.contracts[token.name];
    const tokenContract = await ethers.getContractAt("StudentToken", tokenAddress);
    
    const amount = ethers.parseUnits(token.amount, token.decimals);
    const tx = await tokenContract.transfer(recipientAddress, amount);
    await tx.wait();
    
    console.log(`✅ Transferred ${token.amount} ${token.name} to ${recipientAddress}`);
  }

  console.log("\n🎉 Wallet funded successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Run the script:

```bash
cd blockchain
npx hardhat run scripts/fund-wallet.ts --network localhost YOUR_WALLET_ADDRESS
```

**Expected Output:**
```
Funding wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

✅ Transferred 100 SKETH to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
✅ Transferred 10000 SKUSD to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
✅ Transferred 1 SKBTC to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
✅ Transferred 5000 SKDAI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

🎉 Wallet funded successfully!
```

### Step 3.4: Verify Funded Balances

Check the balances again:

```bash
curl http://localhost:3000/api/crypto/wallet/YOUR_WALLET_ADDRESS/balance
```

**Expected Response:**
```json
{
  "success": true,
  "balances": {
    "SKETH": "100.0",
    "SKUSD": "10000.0",
    "SKBTC": "1.0",
    "SKDAI": "5000.0"
  }
}
```

### Step 3.5: Test Token Transfer

Create a second test wallet to send tokens to:

```bash
curl -X POST http://localhost:3000/api/crypto/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-2"}'
```

Save the address, then send tokens:

```bash
curl -X POST http://localhost:3000/api/crypto/transaction/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "YOUR_FIRST_WALLET_ADDRESS",
    "to": "YOUR_SECOND_WALLET_ADDRESS",
    "tokenAddress": "SKETH_TOKEN_ADDRESS",
    "amount": "10"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "txHash": "0x..."
}
```

Verify the transfer by checking both wallets' balances.

### Step 3.6: Test Token Swap

Get a swap quote first:

```bash
curl -X POST http://localhost:3000/api/crypto/swap/quote \
  -H "Content-Type: application/json" \
  -d '{
    "tokenInAddress": "SKETH_TOKEN_ADDRESS",
    "tokenOutAddress": "SKUSD_TOKEN_ADDRESS",
    "amountIn": "1"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "amountOut": "1994.0",
  "fee": "6.0"
}
```

The quote shows you'll receive approximately 1994 SKUSD (minus a 6 SKUSD fee) for 1 SKETH.

Now execute the swap:

```bash
curl -X POST http://localhost:3000/api/crypto/transaction/swap \
  -H "Content-Type: application/json" \
  -d '{
    "from": "YOUR_WALLET_ADDRESS",
    "tokenInAddress": "SKETH_TOKEN_ADDRESS",
    "tokenOutAddress": "SKUSD_TOKEN_ADDRESS",
    "amountIn": "1",
    "minAmountOut": "1900"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "txHash": "0x...",
  "amountOut": "1994.0"
}
```

---

## Phase 4: Update Frontend Context

Now that the backend is working, update the frontend to use the correct API endpoints.

### Step 4.1: Update CryptoWalletContext API URLs

Open `contexts/CryptoWalletContext.tsx` and update all API calls to use the correct base URL:

```typescript
// At the top of the file, add a constant
const API_BASE_URL = "http://localhost:3000/api/crypto";

// Update connectWallet function
const connectWallet = async () => {
  try {
    setIsLoading(true);

    // Generate a unique user ID (in production, use authenticated user ID)
    const userId = `user_${Date.now()}`;

    const response = await fetch(`${API_BASE_URL}/wallet/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to create wallet");
    }

    const data = await response.json();
    setAddress(data.address);
    setIsConnected(true);

    // Store userId for future requests
    await AsyncStorage.setItem("crypto_user_id", userId);

    // Load token configurations from backend
    await loadTokenConfigs();
    await refreshBalances();

    Toast.show({
      type: "success",
      text1: "Wallet Connected",
      text2: `Address: ${data.address.slice(0, 6)}...${data.address.slice(-4)}`,
    });
  } catch (error: any) {
    console.error("Error connecting wallet:", error);
    Toast.show({
      type: "error",
      text1: "Connection Failed",
      text2: error.message || "Failed to connect wallet",
    });
  } finally {
    setIsLoading(false);
  }
};
```

### Step 4.2: Update loadTokenConfigs Function

```typescript
const loadTokenConfigs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tokens`);
    if (response.ok) {
      const data = await response.json();
      // Update TOKEN_CONFIGS with deployed addresses
      TOKEN_CONFIGS.forEach((config, index) => {
        if (data.tokens[config.symbol]) {
          TOKEN_CONFIGS[index].address = data.tokens[config.symbol];
        }
      });
    }
  } catch (error) {
    console.error("Error loading token configs:", error);
  }
};
```

### Step 4.3: Update refreshBalances Function

```typescript
const refreshBalances = async () => {
  if (!address) return;

  try {
    setIsLoading(true);

    const response = await fetch(`${API_BASE_URL}/wallet/${address}/balance`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch balances");
    }

    const data = await response.json();
    const balances = data.balances;

    const updatedTokens: Token[] = TOKEN_CONFIGS.map((config) => ({
      ...config,
      balance: balances[config.symbol] || "0",
    }));

    setTokens(updatedTokens);
  } catch (error) {
    console.error("Error refreshing balances:", error);
    Toast.show({
      type: "error",
      text1: "Failed to Refresh",
      text2: "Could not load token balances",
    });
  } finally {
    setIsLoading(false);
  }
};
```

### Step 4.4: Update sendToken Function

```typescript
const sendToken = async (
  tokenAddress: string,
  to: string,
  amount: string
): Promise<string> => {
  if (!address) throw new Error("Wallet not connected");

  try {
    const response = await fetch(`${API_BASE_URL}/transaction/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: address,
        to,
        tokenAddress,
        amount,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send transaction");
    }

    const data = await response.json();

    Toast.show({
      type: "success",
      text1: "Transaction Sent",
      text2: "Your transaction is being processed",
    });

    // Refresh balances after transaction
    setTimeout(() => refreshBalances(), 3000);

    return data.txHash;
  } catch (error: any) {
    console.error("Error sending token:", error);
    Toast.show({
      type: "error",
      text1: "Transaction Failed",
      text2: error.message || "Failed to send transaction",
    });
    throw error;
  }
};
```

### Step 4.5: Update swapTokens Function

```typescript
const swapTokens = async (
  tokenInAddress: string,
  tokenOutAddress: string,
  amountIn: string,
  minAmountOut: string
): Promise<string> => {
  if (!address) throw new Error("Wallet not connected");

  try {
    // First, get a quote
    const quoteResponse = await fetch(`${API_BASE_URL}/swap/quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tokenInAddress,
        tokenOutAddress,
        amountIn,
      }),
    });

    if (!quoteResponse.ok) {
      throw new Error("Failed to get swap quote");
    }

    const quote = await quoteResponse.json();
    console.log(`Swap quote: ${quote.amountOut} (fee: ${quote.fee})`);

    // Execute swap
    const response = await fetch(`${API_BASE_URL}/transaction/swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: address,
        tokenInAddress,
        tokenOutAddress,
        amountIn,
        minAmountOut,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to swap tokens");
    }

    const data = await response.json();

    Toast.show({
      type: "success",
      text1: "Swap Successful",
      text2: `Received ${data.amountOut} tokens`,
    });

    // Refresh balances after swap
    setTimeout(() => refreshBalances(), 3000);

    return data.txHash;
  } catch (error: any) {
    console.error("Error swapping tokens:", error);
    Toast.show({
      type: "error",
      text1: "Swap Failed",
      text2: error.message || "Failed to swap tokens",
    });
    throw error;
  }
};
```

---

## Phase 5: Test the Complete Flow in the App

### Step 5.1: Start the Expo Development Server

```bash
# From project root
npx expo start -c
```

### Step 5.2: Open the App

- **Web**: Press `w` to open in browser
- **iOS**: Press `i` to open in iOS simulator (requires Xcode)
- **Android**: Press `a` to open in Android emulator (requires Android Studio)
- **Physical Device**: Scan the QR code with Expo Go app

### Step 5.3: Test Wallet Connection

1. Navigate to the wallet or crypto section of your app
2. Click "Connect Wallet"
3. Verify that a wallet address is displayed
4. Check that token balances load correctly (should show 0 for a new wallet)

### Step 5.4: Fund Your App Wallet

Use the funding script from Phase 3, Step 3.3 to send tokens to your app wallet address.

### Step 5.5: Test Token Transfer

1. In the app, navigate to the send/transfer screen
2. Enter a recipient address (you can use the second test wallet from Phase 3)
3. Select a token and enter an amount
4. Submit the transaction
5. Verify that:
   - A success toast appears
   - The transaction hash is displayed
   - Balances update after a few seconds

### Step 5.6: Test Token Swap

1. Navigate to the swap screen
2. Select input token (e.g., SKETH) and output token (e.g., SKUSD)
3. Enter an amount
4. Review the swap quote
5. Execute the swap
6. Verify that:
   - The swap completes successfully
   - Both token balances update correctly
   - The exchange rate matches expectations

---

## Phase 6: Add Transaction Monitoring (Optional but Recommended)

Transaction monitoring provides real-time updates on transaction status and enables features like transaction history.

### Step 6.1: Create Transaction History Endpoint

Add to `server/crypto/crypto-router.ts`:

```typescript
import { getTransactionMonitor } from "./transaction-monitor";

/**
 * GET /api/crypto/wallet/:address/transactions
 * Get transaction history for a wallet
 */
router.get("/wallet/:address/transactions", async (req, res) => {
  try {
    const { address } = req.params;
    const { fromBlock = 0, toBlock = "latest" } = req.query;

    const monitor = getTransactionMonitor();
    const transactions = await monitor.getTransactionHistory(
      address,
      Number(fromBlock),
      toBlock as number | "latest"
    );

    res.json({
      success: true,
      transactions,
    });
  } catch (error: any) {
    console.error("Error getting transaction history:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get transaction history",
    });
  }
});

/**
 * GET /api/crypto/wallet/:address/token-transfers/:tokenAddress
 * Get token transfer history
 */
router.get("/wallet/:address/token-transfers/:tokenAddress", async (req, res) => {
  try {
    const { address, tokenAddress } = req.params;
    const { fromBlock = 0, toBlock = "latest" } = req.query;

    const monitor = getTransactionMonitor();
    const transfers = await monitor.getTokenTransferHistory(
      tokenAddress,
      address,
      Number(fromBlock),
      toBlock as number | "latest"
    );

    res.json({
      success: true,
      transfers,
    });
  } catch (error: any) {
    console.error("Error getting token transfers:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get token transfers",
    });
  }
});
```

### Step 6.2: Add Transaction History to Frontend

Add to `CryptoWalletContext.tsx`:

```typescript
const [transactionHistory, setTransactionHistory] = useState<CryptoTransaction[]>([]);

const loadTransactionHistory = async () => {
  if (!address) return;

  try {
    const response = await fetch(`${API_BASE_URL}/wallet/${address}/transactions`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch transaction history");
    }

    const data = await response.json();
    setTransactionHistory(data.transactions);
  } catch (error) {
    console.error("Error loading transaction history:", error);
  }
};

// Call this after connecting wallet or periodically
useEffect(() => {
  if (isConnected && address) {
    loadTransactionHistory();
    const interval = setInterval(loadTransactionHistory, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }
}, [isConnected, address]);
```

---

## Phase 7: Production Considerations

### Security Best Practices

When moving to production, implement these security measures:

1. **Use a Hardware Security Module (HSM)** or **Key Management Service** (AWS KMS, Google Cloud KMS) instead of storing private keys in environment variables

2. **Implement proper authentication**: Replace the simple `userId` with authenticated user sessions

3. **Add rate limiting** to prevent abuse:
   ```typescript
   import rateLimit from "express-rate-limit";

   const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // Limit each IP to 100 requests per windowMs
   });

   app.use("/api/crypto", apiLimiter);
   ```

4. **Add transaction signing approvals**: Require 2FA or biometric authentication before signing transactions

5. **Monitor for suspicious activity**: Set up alerts for unusual transaction patterns

6. **Use multi-signature wallets** for high-value operations

7. **Implement gas price optimization**: Check gas prices before transactions and allow users to adjust

8. **Add circuit breakers**: Implement emergency stops for critical failures

9. **Regular security audits**: Have your smart contracts audited by professional security firms

### Deployment to Testnet

When ready to deploy to a public testnet (e.g., Sepolia):

1. **Update `hardhat.config.ts`**:
   ```typescript
   import { HardhatUserConfig } from "hardhat/config";

   const config: HardhatUserConfig = {
     solidity: "0.8.20",
     networks: {
       sepolia: {
         url: process.env.SEPOLIA_RPC_URL || "",
         accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
       },
     },
   };

   export default config;
   ```

2. **Get testnet ETH** from a faucet (e.g., https://sepoliafaucet.com/)

3. **Deploy to testnet**:
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

4. **Update environment variables** with testnet RPC URL and contract addresses

5. **Verify contracts** on Etherscan:
   ```bash
   npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "Constructor" "Args"
   ```

---

## Troubleshooting

### Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| "Cannot connect to Hardhat node" | Hardhat node not running | Start Hardhat node: `npx hardhat node` |
| "Deployment info not found" | Contracts not deployed | Run deployment script: `npx hardhat run scripts/deploy.ts --network localhost` |
| "Insufficient funds" | Wallet not funded | Use funding script to transfer tokens |
| "Transaction reverted" | Invalid parameters or insufficient allowance | Check transaction parameters and token approvals |
| "Metro bundler error" | Cache issue | Clear cache: `npx expo start -c` |
| "Cannot resolve ethers" | Polyfills not installed | Run `pnpm install` and restart Metro |

### Debug Mode

Enable detailed logging by adding to your `.env`:

```env
DEBUG=true
LOG_LEVEL=debug
```

Then update your backend to log more details:

```typescript
if (process.env.DEBUG === "true") {
  console.log("Transaction details:", {
    from,
    to,
    amount,
    tokenAddress,
  });
}
```

---

## Next Steps

After completing this implementation, consider adding these advanced features:

1. **Transaction queuing**: Allow users to queue multiple transactions for batch execution
2. **Gas estimation**: Show estimated gas costs before transactions
3. **Price feeds**: Integrate Chainlink or other oracles for real-time token prices
4. **Push notifications**: Notify users of transaction confirmations
5. **Multi-wallet support**: Allow users to create and manage multiple wallets
6. **Wallet backup/recovery**: Implement mnemonic phrase backup and recovery
7. **Biometric authentication**: Add fingerprint/face recognition for transaction signing
8. **DApp browser**: Allow users to interact with other DApps
9. **NFT support**: Add ERC-721 token support for NFTs
10. **Staking**: Implement token staking for rewards

---

## Support and Resources

- **Ethers.js Documentation**: https://docs.ethers.org/v6/
- **Hardhat Documentation**: https://hardhat.org/docs
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts
- **Expo Documentation**: https://docs.expo.dev/
- **React Native Crypto**: https://github.com/tradle/react-native-crypto

---

## Conclusion

You now have a fully functional smart contract automation system with wallet management and transaction signing. The backend handles all private key management and transaction signing, providing a seamless user experience while maintaining security.

The implementation follows industry best practices and is ready for development and testing. When moving to production, ensure you implement the security measures outlined in Phase 7.

**Happy building!** 🚀
