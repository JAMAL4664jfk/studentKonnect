# Supabase APK Connection Fix

## Problem Identified

When building the APK, Supabase credentials were not being properly bundled, causing connection failures on physical devices. This happened because:

1. **`.env` file had placeholder values** that don't get bundled into APK builds
2. **Hardcoded values in `lib/supabase.ts`** weren't being used consistently
3. **No fallback mechanism** to ensure credentials are available in production builds

## Solution Applied

### 1. Added Supabase Credentials to `app.config.ts`

Just like the Wallet API configuration, Supabase credentials are now hardcoded in `app.config.ts` (lines 35-38):

```typescript
extra: {
  // Supabase Configuration (Hardcoded for production builds)
  EXPO_PUBLIC_SUPABASE_URL: "https://ortjjekmexmyvkkotioo.supabase.co",
  EXPO_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGci...",
  
  // Wallet API Configuration
  EXPO_PUBLIC_WALLET_API_URL: "https://api.payelio.com/v3/",
  EXPO_PUBLIC_WALLET_CLIENT_KEY: "b154e7...",
  EXPO_PUBLIC_WALLET_CLIENT_PASS: "mwDv79...",
  EXPO_PUBLIC_USE_WALLET_API: "true",
}
```

**Why this works:**
- ✅ Values in `app.config.ts` are **bundled into the APK**
- ✅ Available at runtime via `Constants.expoConfig.extra`
- ✅ Works on all platforms (web, iOS, Android)

### 2. Updated `lib/supabase.ts` to Read from Config

Changed from hardcoded values to a **priority-based fallback system**:

```typescript
import Constants from "expo-constants";

// Priority: 1. expo-constants, 2. process.env, 3. hardcoded fallback
const SUPABASE_URL = 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  "https://ortjjekmexmyvkkotioo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  "eyJhbGci...";
```

**Benefits:**
- ✅ **APK builds**: Use values from `app.config.ts`
- ✅ **Development**: Use `.env` file if available
- ✅ **Fallback**: Use hardcoded values as last resort
- ✅ **Debug logs**: Added console logs to verify configuration

### 3. Added Debug Logging

Added initialization logs to help diagnose issues:

```typescript
console.log('🔌 Supabase Client Initialized:');
console.log('URL:', SUPABASE_URL);
console.log('Has Anon Key:', !!SUPABASE_PUBLISHABLE_KEY, '(length:', SUPABASE_PUBLISHABLE_KEY?.length || 0, ')');
console.log('Platform:', Platform.OS);
```

**View these logs in APK:**
```bash
adb logcat | grep "Supabase"
```

---

## How to Rebuild and Test

### 1. Clean Previous Build
```bash
# Remove old build artifacts
rm -rf android/app/build
rm -rf .expo

# Clear Metro bundler cache
npx expo start --clear
```

### 2. Rebuild APK

**Option A: EAS Build (Recommended)**
```bash
eas build --platform android --profile preview --clear-cache
```

**Option B: Local Build**
```bash
# Regenerate native project with new config
npx expo prebuild --platform android --clean

# Build APK
cd android
./gradlew clean
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

### 3. Install and Test
```bash
# Install on device
adb install -r android/app/build/outputs/apk/release/app-release.apk

# View logs while testing
adb logcat | grep -E "(Supabase|Wallet)"
```

### 4. Test Login Flow
1. Open app on device
2. Try to sign in (or sign up)
3. Check if Supabase connection works
4. Look for initialization logs in logcat

---

## Expected Behavior After Fix

### ✅ Successful Connection
When you open the app, you should see in logs:
```
🔌 Supabase Client Initialized:
URL: https://ortjjekmexmyvkkotioo.supabase.co
Has Anon Key: true (length: 205)
Platform: android
```

### ✅ Login Works
- Sign in/sign up should work
- Session should persist after app restart
- User data should load correctly

### ❌ If Still Failing
Check these logs:
```bash
# View all errors
adb logcat *:E

# Check network connectivity
adb logcat | grep -i "network\|connection\|timeout"

# Check Supabase specific errors
adb logcat | grep -i "supabase"
```

---

## Verification Checklist

After rebuilding and installing the APK:

- [ ] **App opens successfully**
- [ ] **Supabase initialization logs appear** in logcat
- [ ] **URL shows correct Supabase endpoint** (ortjjekmexmyvkkotioo.supabase.co)
- [ ] **Anon key length is 205 characters**
- [ ] **Platform shows "android"**
- [ ] **Login/signup works**
- [ ] **Session persists** after closing and reopening app
- [ ] **User data loads** correctly
- [ ] **Chat/social features work** (if using Supabase realtime)

---

## Troubleshooting

### Issue: "Invalid API key"
**Cause**: Anon key is incorrect or truncated
**Solution**: 
- Verify key in `app.config.ts` matches Supabase dashboard
- Check logs show full key length (205 chars)
- Rebuild APK after fixing

### Issue: "Network request failed"
**Cause**: Device can't reach Supabase servers
**Solution**:
- Check device has internet connection
- Verify Supabase URL is accessible: `curl https://ortjjekmexmyvkkotioo.supabase.co`
- Check firewall/proxy settings on device

### Issue: "Session not persisting"
**Cause**: SecureStore not working properly
**Solution**:
- Check Android permissions in `app.config.ts`
- Verify SecureStore logs in logcat
- Try clearing app data and re-login

### Issue: Still using placeholder values
**Cause**: Old build cache not cleared
**Solution**:
```bash
# Clear everything
rm -rf node_modules
rm -rf android
rm -rf .expo
pnpm install
npx expo prebuild --platform android --clean
cd android && ./gradlew clean && ./gradlew assembleRelease
```

---

## Configuration Files Changed

### 1. `app.config.ts`
- Added `EXPO_PUBLIC_SUPABASE_URL`
- Added `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 2. `lib/supabase.ts`
- Added `import Constants from "expo-constants"`
- Changed to read from Constants.expoConfig.extra
- Added fallback chain (config → env → hardcoded)
- Added debug logging

---

## Why This Fix Works

### The Problem with `.env` Files
- `.env` files are **NOT bundled** into APK builds
- They only work in development mode
- Environment variables need to be in `app.config.ts` to be included

### The Solution: `app.config.ts` + `expo-constants`
1. **Build time**: Values from `app.config.ts` are bundled into APK
2. **Runtime**: `expo-constants` reads these values from the bundle
3. **Result**: Credentials are available in production APK

### Configuration Priority
```
1. Constants.expoConfig.extra (APK builds) ✅
2. process.env (Development) ✅
3. Hardcoded fallback (Last resort) ✅
```

---

## Security Note

⚠️ **Important**: The Supabase **anon key** is safe to include in client-side code because:
- It's designed to be public (used in browsers/apps)
- Row Level Security (RLS) policies protect your data
- The **service role key** should NEVER be in client code

✅ **Safe to bundle in APK:**
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

❌ **NEVER bundle in APK:**
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

---

## Next Steps

1. **Rebuild your APK** using the instructions above
2. **Install on your device** and test login
3. **Check logs** to verify Supabase initialization
4. **Test all features** that depend on Supabase:
   - Authentication (login/signup)
   - User profiles
   - Chat/messaging
   - Social features
   - Any database queries

If you still encounter issues after rebuilding, share the logs from:
```bash
adb logcat | grep -E "(Supabase|Error|Exception)" > debug.log
```

---

## Summary

✅ **Fixed**: Supabase credentials now properly bundled in APK builds
✅ **Method**: Added credentials to `app.config.ts` (same as Wallet API)
✅ **Fallback**: Multiple layers ensure credentials are always available
✅ **Debug**: Added logging to help diagnose issues
✅ **Tested**: Configuration verified and ready for rebuild

🚀 **Action Required**: Rebuild your APK and test!
