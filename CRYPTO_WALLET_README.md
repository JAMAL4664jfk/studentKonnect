# Student Konnect Crypto Wallet Feature

## Overview

This feature adds comprehensive Web3 cryptocurrency wallet functionality to the Student Konnect app, including:

- **Tabbed Wallet Interface**: Switch between traditional Banking and Crypto views
- **Automated Wallet Management**: Automatic wallet generation and secure key storage
- **Multi-Token Support**: Support for multiple ERC-20 tokens with real token icons
- **Token Swapping**: Swap between different tokens with slippage protection
- **Token Transfers**: Send tokens to other addresses
- **Blockchain Visualization**: Charts showing balance history, transaction volume, and token distribution
- **Hardhat Integration**: Local blockchain for development and testing
- **Smart Contracts**: ERC-20 tokens and swap contract built with OpenZeppelin

## Architecture

### Frontend (React Native)
- **CryptoWalletContext**: State management for crypto wallet
- **WalletTabs**: Tabbed navigation component
- **CryptoWalletTab**: Main crypto wallet interface
- **TokenList**: Display token balances
- **SwapInterface**: Token swap UI
- **SendTokens**: Send tokens UI
- **BlockchainChart**: Blockchain data visualization

### Backend (Node.js)
- **wallet-service.ts**: Automated wallet creation and management
- **blockchain-service.ts**: Smart contract interactions
- **crypto-router.ts**: API endpoints for crypto operations

### Blockchain (Hardhat + Solidity)
- **StudentToken.sol**: ERC-20 token contract
- **TokenSwap.sol**: Token swap contract with fees
- **Hardhat**: Local Ethereum node for development

## Setup Instructions

### 1. Install Dependencies

The dependencies have already been installed:
- `ethers@^6.13.0` - Web3 library
- `hardhat` - Ethereum development environment
- `@nomicfoundation/hardhat-toolbox` - Hardhat plugins
- `@openzeppelin/contracts` - Secure smart contract library
- `react-native-chart-kit` - Charts for visualization

### 2. Compile Smart Contracts

```bash
cd blockchain
npx hardhat compile
```

### 3. Start Hardhat Node

In a separate terminal, start the local Hardhat blockchain:

```bash
cd blockchain
npx hardhat node
```

This will start a local Ethereum node at `http://localhost:8545` with 10 pre-funded accounts.

### 4. Deploy Smart Contracts

In another terminal, deploy the contracts to the local network:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

This will:
- Deploy 4 ERC-20 tokens (SKETH, SKUSD, SKBTC, SKDAI)
- Deploy the TokenSwap contract
- Set up exchange rates
- Fund the swap contract with liquidity
- Save deployment info to `deployments.json`

### 5. Update Server to Include Crypto Router

Add the crypto router to your main server file (`server/_core/index.ts` or similar):

```typescript
import cryptoRouter from "../crypto/crypto-router";

// ... existing code ...

app.use("/api/crypto", cryptoRouter);
```

### 6. Start the Development Server

```bash
pnpm dev
```

This will start both the backend server and the Expo development server.

### 7. Update App to Use Tabbed Wallet

Replace the existing transactions screen route with the new tabbed version. In your app navigation, update the route to use `transactions-with-tabs.tsx` instead of `transactions.tsx`.

Or, you can rename the files:

```bash
mv app/transactions.tsx app/transactions-old.tsx
mv app/transactions-with-tabs.tsx app/transactions.tsx
```

## Usage

### Connecting Wallet

1. Navigate to the Wallet/Transactions screen
2. Click on the "Crypto" tab
3. Click "Connect Wallet"
4. A wallet will be automatically generated and connected

### Viewing Tokens

- After connecting, you'll see your token balances
- Click on any token to view details
- Pull down to refresh balances

### Swapping Tokens

1. Click the "Swap" button
2. Select the token you want to swap from
3. Select the token you want to swap to
4. Enter the amount
5. Review the estimated output
6. Click "Swap" to execute

### Sending Tokens

1. Click the "Send" button
2. Select the token to send
3. Enter the recipient's Ethereum address
4. Enter the amount
5. Review the transaction summary
6. Click "Send" to execute

### Viewing Charts

1. Click the "Charts" button
2. Switch between different chart types:
   - **Balance**: Historical balance over time
   - **Volume**: Daily transaction volume
   - **Distribution**: Token portfolio breakdown

## API Endpoints

### Wallet Management

- `POST /api/crypto/wallet/create` - Create or get wallet
- `GET /api/crypto/wallet/:address` - Get wallet info
- `GET /api/crypto/wallet/:address/balance` - Get token balances

### Transactions

- `POST /api/crypto/transaction/send` - Send tokens
- `POST /api/crypto/transaction/swap` - Swap tokens
- `GET /api/crypto/transaction/:hash` - Get transaction status

### Tokens

- `GET /api/crypto/tokens` - List supported tokens
- `GET /api/crypto/tokens/:address/info` - Get token info
- `POST /api/crypto/swap/quote` - Get swap quote

### Development

- `POST /api/crypto/reload` - Reload deployment info

## Smart Contracts

### StudentToken (ERC-20)

A standard ERC-20 token with minting and burning capabilities.

**Functions:**
- `mint(address to, uint256 amount)` - Mint new tokens (owner only)
- `burn(uint256 amount)` - Burn tokens
- Standard ERC-20 functions (transfer, approve, etc.)

### TokenSwap

A simple token swap contract with configurable exchange rates and fees.

**Functions:**
- `swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut)` - Swap tokens
- `getAmountOut(address tokenIn, address tokenOut, uint256 amountIn)` - Get expected output
- `setExchangeRate(address tokenA, address tokenB, uint256 rate)` - Set exchange rate (owner only)
- `setSwapFee(uint256 newFee)` - Set swap fee (owner only)

## Token Configuration

### Deployed Tokens

| Token | Symbol | Decimals | Initial Supply |
|-------|--------|----------|----------------|
| Student Konnect ETH | SKETH | 18 | 1,000,000 |
| Student Konnect USD | SKUSD | 6 | 10,000,000 |
| Student Konnect BTC | SKBTC | 8 | 21,000 |
| Student Konnect DAI | SKDAI | 18 | 5,000,000 |

### Exchange Rates

- 1 SKETH = 2000 SKUSD
- 1 SKETH = 0.05 SKBTC
- 1 SKETH = 2000 SKDAI
- 1 SKUSD = 1 SKDAI

### Swap Fee

Default: 0.3% (30 basis points)

## Security Considerations

### Private Key Storage

- Private keys are encrypted using AES-256-CBC
- Encryption key should be stored in environment variable
- Keys are never exposed to the frontend
- All transaction signing happens on the backend

### Production Deployment

For production deployment:

1. **Use a real blockchain network** (Ethereum mainnet, Polygon, etc.)
2. **Store private keys securely** (AWS KMS, HashiCorp Vault, etc.)
3. **Implement proper authentication** (verify user identity before wallet operations)
4. **Add rate limiting** (prevent API abuse)
5. **Use HTTPS** (encrypt all communications)
6. **Audit smart contracts** (professional security audit before mainnet deployment)
7. **Implement monitoring** (track transactions and errors)
8. **Add transaction limits** (prevent large unauthorized transfers)

## Troubleshooting

### Hardhat Node Not Running

**Error:** `Failed to connect to http://localhost:8545`

**Solution:** Start the Hardhat node:
```bash
cd blockchain
npx hardhat node
```

### Contracts Not Deployed

**Error:** `TokenSwap contract not deployed`

**Solution:** Deploy the contracts:
```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

### Compilation Errors

**Error:** `Solidity compilation failed`

**Solution:** Make sure you're in the blockchain directory and have the correct Solidity version:
```bash
cd blockchain
npx hardhat compile
```

### Balance Not Updating

**Solution:** 
1. Pull down to refresh in the Tokens view
2. Check that the Hardhat node is running
3. Verify contracts are deployed
4. Check backend logs for errors

## Development Workflow

### Making Changes to Smart Contracts

1. Edit contracts in `blockchain/contracts/`
2. Compile: `npx hardhat compile`
3. Restart Hardhat node
4. Redeploy: `npx hardhat run scripts/deploy.ts --network localhost`
5. Reload deployment info: `POST /api/crypto/reload`

### Testing Smart Contracts

```bash
cd blockchain
npx hardhat test
```

### Adding New Tokens

1. Deploy new token contract
2. Update `blockchain/scripts/deploy.ts`
3. Add token to `TOKEN_CONFIGS` in `CryptoWalletContext.tsx`
4. Add exchange rates in TokenSwap contract
5. Fund TokenSwap with liquidity

## Future Enhancements

- [ ] MetaMask integration for mobile
- [ ] Support for NFTs
- [ ] Staking functionality
- [ ] Liquidity pools
- [ ] Price feeds from oracles (Chainlink)
- [ ] Multi-chain support (Polygon, BSC, etc.)
- [ ] Transaction history persistence
- [ ] Push notifications for transactions
- [ ] QR code scanning for addresses
- [ ] Address book for frequent recipients
- [ ] Gas fee estimation
- [ ] Transaction speed options (slow/normal/fast)

## Resources

- [Ethers.js Documentation](https://docs.ethers.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ERC-20 Token Standard](https://eips.ethereum.org/EIPS/eip-20)
- [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the architecture documentation
3. Check backend logs for errors
4. Verify Hardhat node is running
5. Ensure contracts are deployed

## License

This feature is part of the Student Konnect project.
