# 🔄 How to Reload Environment Variables in Expo

## Problem
After changing `.env` file, the app still uses old/cached values because Expo caches environment variables.

## Solution

### Option 1: Clear Cache & Restart (Recommended)
```bash
# Stop the dev server (Ctrl+C)

# Clear Expo cache
pnpm expo start --clear

# Or use npx
npx expo start --clear
```

### Option 2: Full Clean Restart
```bash
# Stop the dev server (Ctrl+C)

# Remove all caches
rm -rf node_modules/.cache
rm -rf .expo

# Restart
pnpm dev:metro
```

### Option 3: Rebuild the App
For native changes (Android/iOS), you need to rebuild:
```bash
# For Android
pnpm android

# For iOS  
pnpm ios
```

## Verify Environment Variables Are Loaded

After restarting, check the console logs when you try to login. You should see:

```
🔐 Wallet API Login Request:
URL: https://api.payelio.com/v3/customer/login  ✅ (not api.wallet.example.com)
Headers: {
  "client-key": "b154e7-b21b2f-f0a14d-96affa-6d3fb9",  ✅ (not empty)
  "client-pass": "mwDv794ZLsTi0ezF3EBK4ZMsHtAWH1cR"   ✅ (not empty)
}
```

## Current .env Configuration

Your `.env` file should have:
```env
EXPO_PUBLIC_WALLET_API_URL=https://api.payelio.com/v3/
EXPO_PUBLIC_WALLET_CLIENT_KEY=b154e7-b21b2f-f0a14d-96affa-6d3fb9
EXPO_PUBLIC_WALLET_CLIENT_PASS=mwDv794ZLsTi0ezF3EBK4ZMsHtAWH1cR
EXPO_PUBLIC_USE_WALLET_API=true
```

## Important Notes

1. **Always restart with `--clear` flag** after changing `.env`
2. **Environment variables must start with `EXPO_PUBLIC_`** to be available in the app
3. **Native changes require rebuild** (not just restart)
4. **Web doesn't cache as aggressively** as mobile

## Troubleshooting

If environment variables still don't load:

1. Check `.env` file exists in project root
2. Verify variable names start with `EXPO_PUBLIC_`
3. Make sure no typos in variable names
4. Try full clean restart (Option 2 above)
5. Check console logs to verify values

## Quick Test

Run this in your app to check if env vars are loaded:
```typescript
console.log('ENV CHECK:', {
  url: process.env.EXPO_PUBLIC_WALLET_API_URL,
  hasKey: !!process.env.EXPO_PUBLIC_WALLET_CLIENT_KEY,
  hasPass: !!process.env.EXPO_PUBLIC_WALLET_CLIENT_PASS,
});
```
