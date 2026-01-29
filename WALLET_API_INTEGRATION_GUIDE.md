# Wallet API Integration Guide

## Overview

This guide explains how to integrate the external Wallet API into StudentKonnect while preserving the existing design and functionality.

## Architecture

### Dual-Mode Operation

The app now supports two modes:
1. **Supabase Mode** (existing): For development and testing with local database
2. **Wallet API Mode** (new): For production with real wallet backend

### Files Created

1. **`lib/wallet-api.ts`** - Wallet API service layer
   - Handles authentication
   - Manages API calls
   - Provides fallback to mock data
   - Stores tokens securely

### Files to Update

1. **`.env`** - Add API credentials
2. **`contexts/WalletContext.tsx`** - Integrate API calls
3. **`app/financial-analytics.tsx`** - Use real transaction data
4. **`app/lifestyle-rewards.tsx`** - Use real vouchers data

## Setup Instructions

### Step 1: Environment Variables

Add these to your `.env` file:

```env
# Wallet API Configuration
EXPO_PUBLIC_WALLET_API_URL=https://your-wallet-api-url.com/
EXPO_PUBLIC_WALLET_CLIENT_KEY=your-client-key-here
EXPO_PUBLIC_WALLET_CLIENT_PASS=your-client-pass-here

# Optional: Enable/disable Wallet API
EXPO_PUBLIC_USE_WALLET_API=false  # Set to true when ready
```

### Step 2: Install Dependencies

```bash
npm install @react-native-async-storage/async-storage
```

### Step 3: Update WalletContext (Optional)

If you want to use the Wallet API for balance, update `contexts/WalletContext.tsx`:

```typescript
import { walletAPI } from '@/lib/wallet-api';

// In fetchWalletBalance function, add:
const useWalletAPI = process.env.EXPO_PUBLIC_USE_WALLET_API === 'true';

if (useWalletAPI) {
  const balanceData = await walletAPI.getBalance();
  setBalance(balanceData.available_balance);
  return;
}

// ... rest of existing Supabase code
```

### Step 4: Update Financial Analytics

Update `app/financial-analytics.tsx` to use real transaction data:

```typescript
import { walletAPI } from '@/lib/wallet-api';

// In component:
const [transactions, setTransactions] = useState([]);

useEffect(() => {
  loadTransactions();
}, []);

const loadTransactions = async () => {
  const data = await walletAPI.getTransactions(50, 0);
  setTransactions(data);
  // Calculate stats from real data
};
```

### Step 5: Update Lifestyle Rewards

Update `app/lifestyle-rewards.tsx` to use real vouchers:

```typescript
import { walletAPI } from '@/lib/wallet-api';

// In component:
const [vouchers, setVouchers] = useState([]);

useEffect(() => {
  loadVouchers();
}, []);

const loadVouchers = async () => {
  const data = await walletAPI.getVouchers();
  setVouchers(data);
};
```

## API Endpoints Used

### Authentication
- `POST /customer/login` - Login with phone and PIN
- `POST /customer/verify_token` - Verify token validity

### Wallet Operations
- `GET /customer/balance` - Get wallet balance
- `GET /transactions` - Get transaction history

### Customer Management
- `GET /customer/profile` - Get customer profile
- `GET /customer/vouchers` - Get available vouchers

## Error Handling

The API service automatically falls back to mock data if:
- API is unavailable
- Network error occurs
- Token is invalid or expired

This ensures the app continues to work even without API connectivity.

## Testing

### Test with Mock Data (Default)
```env
EXPO_PUBLIC_USE_WALLET_API=false
```

### Test with Real API
```env
EXPO_PUBLIC_USE_WALLET_API=true
EXPO_PUBLIC_WALLET_API_URL=https://qa-api.wallet.com/
EXPO_PUBLIC_WALLET_CLIENT_KEY=your-test-key
EXPO_PUBLIC_WALLET_CLIENT_PASS=your-test-pass
```

## Security Considerations

1. **Never commit API credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Tokens are stored** in AsyncStorage (encrypted on device)
4. **HTTPS only** - API calls use secure connections
5. **Token refresh** - Implement automatic token refresh before expiry

## Migration Strategy

### Phase 1: Parallel Operation (Recommended)
- Keep Supabase for app functionality
- Use Wallet API only for financial data
- Gradual rollout with feature flags

### Phase 2: Full Integration
- Replace Supabase wallet with Wallet API
- Migrate existing data
- Update all transaction flows

### Phase 3: Production
- Enable Wallet API in production
- Monitor error rates
- Keep Supabase as backup

## Troubleshooting

### API Not Responding
- Check environment variables
- Verify network connectivity
- Check API URL format (must end with `/`)
- Verify client credentials

### Token Expired
- Implement automatic token refresh
- Check token expiry time
- Re-login if refresh fails

### Balance Not Updating
- Check API response format
- Verify token is valid
- Check network logs

## Support

For API documentation and support:
- API Docs: [Contact your API provider]
- Postman Collection: `WalletAPI-StudentKonnect.postman_collection.json`

## Next Steps

1. ✅ API service layer created
2. ⏳ Add environment variables
3. ⏳ Test with mock data
4. ⏳ Test with real API (QA environment)
5. ⏳ Update UI components
6. ⏳ Deploy to production

---

**Note**: This integration preserves all existing UI/UX. No visual changes are made to the app.
