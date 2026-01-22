# Crypto Wallet Architecture

## Overview
This document outlines the architecture for integrating Web3 cryptocurrency wallet functionality into the studentKonnect app.

## Architecture Components

### 1. Frontend (React Native)
- **Tabbed Navigation**: Switch between Banking and Crypto views
- **Crypto Wallet UI**: Display wallet balance, tokens, and blockchain data
- **Token Management**: View, swap, and send multiple tokens
- **Charts & Visualization**: Real-time blockchain data visualization
- **MetaMask Integration**: Connect to MetaMask mobile wallet

### 2. Backend Service (Node.js + Express)
- **Wallet Management API**: Auto-generate and manage Ethereum wallets
- **Hardhat Integration**: Local blockchain for development/testing
- **Smart Contract Deployment**: Deploy and interact with contracts
- **Transaction Processing**: Handle token swaps and transfers
- **Key Management**: Secure storage of private keys (encrypted)

### 3. Blockchain Layer
- **Ethers.js**: Web3 library for Ethereum interactions
- **Hardhat**: Development environment and local blockchain
- **OpenZeppelin Contracts**: Secure, audited smart contract templates
- **ERC-20 Tokens**: Standard token implementation

## Directory Structure

```
studentKonnect/
├── app/
│   └── crypto-wallet.tsx          # New crypto wallet screen
├── components/
│   ├── crypto/
│   │   ├── CryptoWalletTab.tsx    # Crypto tab component
│   │   ├── TokenList.tsx          # Display token balances
│   │   ├── SwapInterface.tsx      # Token swap UI
│   │   ├── SendTokens.tsx         # Send tokens UI
│   │   └── BlockchainChart.tsx    # Blockchain visualization
│   └── wallet/
│       └── WalletTabs.tsx         # Tabbed navigation component
├── contexts/
│   └── CryptoWalletContext.tsx    # Crypto wallet state management
├── blockchain/
│   ├── contracts/
│   │   ├── Token.sol              # ERC-20 token contract
│   │   └── TokenSwap.sol          # Token swap contract
│   ├── scripts/
│   │   ├── deploy.ts              # Deployment scripts
│   │   └── setup-tokens.ts        # Token setup
│   ├── test/
│   │   └── Token.test.ts          # Contract tests
│   └── hardhat.config.ts          # Hardhat configuration
├── server/
│   └── crypto/
│       ├── wallet-service.ts      # Wallet generation & management
│       ├── blockchain-service.ts  # Blockchain interactions
│       └── crypto-router.ts       # API routes for crypto
└── lib/
    └── web3/
        ├── ethers-config.ts       # Ethers.js configuration
        ├── token-icons.ts         # Token icon mappings
        └── chain-config.ts        # Network configurations
```

## Data Flow

### Wallet Connection Flow
1. User clicks "Connect Wallet" in Crypto tab
2. App checks if wallet exists in backend
3. If not, backend auto-generates wallet using Hardhat
4. Private key stored encrypted in backend
5. Public address returned to frontend
6. Frontend connects to MetaMask (optional) or uses generated wallet

### Token Swap Flow
1. User selects tokens to swap (Token A → Token B)
2. Frontend calls backend API with swap parameters
3. Backend interacts with smart contract via Ethers.js
4. Transaction signed and submitted to blockchain
5. Transaction hash returned to frontend
6. Frontend polls for transaction confirmation
7. UI updates with new balances

### Send Token Flow
1. User enters recipient address and amount
2. Frontend validates inputs
3. Backend creates and signs transaction
4. Transaction submitted to blockchain
5. Confirmation displayed to user

## Security Considerations

1. **Private Key Storage**: Encrypted at rest, never exposed to frontend
2. **Transaction Signing**: All signing done on backend
3. **Input Validation**: Strict validation of addresses and amounts
4. **Rate Limiting**: API rate limits to prevent abuse
5. **HTTPS Only**: All communications encrypted

## Token Support

### Initial Tokens
- ETH (Ethereum)
- USDT (Tether)
- USDC (USD Coin)
- DAI (Dai Stablecoin)
- WBTC (Wrapped Bitcoin)

### Token Icons
- Use official token logos from trusted sources
- Fallback to generic icon if logo unavailable
- Cache icons locally for performance

## Blockchain Visualization

### Charts
- **Balance History**: Line chart showing balance over time
- **Transaction Volume**: Bar chart of daily transaction volume
- **Token Distribution**: Pie chart of token holdings
- **Gas Fees**: Historical gas fee trends

### Data Sources
- On-chain data via Ethers.js
- Historical data from backend database
- Real-time updates via WebSocket

## Implementation Phases

1. ✅ **Phase 1**: Architecture design
2. **Phase 2**: Setup Hardhat and smart contracts
3. **Phase 3**: Backend wallet service
4. **Phase 4**: Frontend crypto components
5. **Phase 5**: Token swap functionality
6. **Phase 6**: Blockchain visualization
7. **Phase 7**: Testing and deployment
8. **Phase 8**: Integration with existing wallet

## Technical Stack

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Blockchain**: Hardhat, Ethers.js v6
- **Smart Contracts**: Solidity, OpenZeppelin
- **Database**: MySQL (existing)
- **Charts**: react-native-chart-kit or Victory Native
- **State Management**: React Context API

## Environment Variables

```env
# Blockchain
HARDHAT_NETWORK=localhost
ETHEREUM_RPC_URL=http://localhost:8545
PRIVATE_KEY_ENCRYPTION_KEY=<generated-key>

# Token Contracts
TOKEN_A_ADDRESS=<deployed-address>
TOKEN_B_ADDRESS=<deployed-address>
SWAP_CONTRACT_ADDRESS=<deployed-address>
```

## API Endpoints

### Wallet Management
- `POST /api/crypto/wallet/create` - Create new wallet
- `GET /api/crypto/wallet/:address` - Get wallet info
- `GET /api/crypto/wallet/:address/balance` - Get token balances

### Transactions
- `POST /api/crypto/transaction/send` - Send tokens
- `POST /api/crypto/transaction/swap` - Swap tokens
- `GET /api/crypto/transaction/:hash` - Get transaction status
- `GET /api/crypto/transaction/history/:address` - Get transaction history

### Tokens
- `GET /api/crypto/tokens` - List supported tokens
- `GET /api/crypto/tokens/:address/price` - Get token price
- `GET /api/crypto/tokens/:address/info` - Get token info

## Next Steps

1. Install dependencies (ethers, hardhat, openzeppelin)
2. Initialize Hardhat project
3. Create smart contracts
4. Implement backend wallet service
5. Build frontend components
6. Integrate with existing app
7. Test thoroughly
8. Deploy to production
