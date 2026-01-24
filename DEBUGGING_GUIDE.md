# 🐛 Debugging Guide - Accommodation Loading Issues

## Problem: "Failed to load accommodations" & No logs in VS Code

### Why Logs Don't Appear in VS Code Terminal

**Reason:** When running Expo on a physical device, console.log statements don't automatically appear in the VS Code terminal. They appear in:
1. **Expo DevTools** (browser)
2. **React Native Debugger** (if installed)
3. **Device logs** (via adb for Android or Xcode for iOS)

---

## ✅ Solutions Applied

### 1. Enhanced Error Handling
- Added connection tests before fetching data
- Better error messages with specific details
- Toast notifications show errors directly in the app

### 2. Debug Logger
Created `lib/debug-logger.ts` with:
- Console logging with timestamps
- Optional toast notifications
- Connection test function

### 3. Debug Screen
Created `app/debug.tsx` - A dedicated screen to:
- Test database connections
- View logs directly in the app
- Check configuration
- Verify auth session

---

## 🔍 How to Debug

### Method 1: Use the Debug Screen (Easiest)
1. In your app, navigate to `/debug`
2. Tap "Run Test" button
3. Watch logs appear in real-time
4. Check for errors

**What to look for:**
- ✅ Green checkmarks = Working
- ❌ Red X = Error (read the message)
- ℹ️  Info = Status update

### Method 2: View Logs in Expo DevTools
1. When Expo is running, look for the URL in terminal
2. Open in browser (usually `http://localhost:19002` or shown in terminal)
3. Click on your device
4. View logs in the browser console

### Method 3: Enable Remote Debugging
1. Shake your device (or press Cmd+D on iOS simulator)
2. Tap "Debug Remote JS"
3. Browser opens with Chrome DevTools
4. View Console tab for all logs

### Method 4: Use React Native Debugger (Advanced)
1. Install: `brew install --cask react-native-debugger` (Mac)
2. Open React Native Debugger
3. Enable "Debug Remote JS" in app
4. View logs in the debugger

---

## 🔧 Common Issues & Fixes

### Issue 1: "Connection Error: Database connection failed"

**Possible Causes:**
- No internet connection
- Wrong Supabase URL/keys
- Supabase project paused
- RLS policies blocking access

**Solutions:**
1. Check internet connection on device
2. Verify `.env` file exists with correct credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://ortjjekmexmyvkkotioo.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here
   ```
3. Restart Expo: `npm start -- --clear`
4. Check Supabase dashboard - is project active?

### Issue 2: "No Accommodations: No listings available"

**Possible Causes:**
- Database is empty
- All items have `isAvailable = false`
- RLS policies filtering out data

**Solutions:**
1. Check if data exists in Supabase dashboard
2. Run seed script:
   ```bash
   node scripts/seed-demo-data.js
   ```
3. Verify RLS policies allow reading:
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM accommodations;
   ```

### Issue 3: "Failed to fetch data"

**Possible Causes:**
- Network timeout
- Table doesn't exist
- Column mismatch

**Solutions:**
1. Use the Debug screen to test connection
2. Check table exists in Supabase dashboard
3. Verify migrations were run
4. Check column names match the schema

### Issue 4: No logs appear anywhere

**Possible Causes:**
- App crashed before logging
- Console is filtered
- Wrong log level

**Solutions:**
1. Check if app is actually running (not crashed)
2. Look for error screens or blank screens
3. Use the Debug screen instead
4. Check Expo DevTools in browser

---

## 📊 Testing Checklist

Run through these tests in order:

### Step 1: Basic Connection
- [ ] Open app
- [ ] Navigate to `/debug`
- [ ] Tap "Run Test"
- [ ] See "Connection test complete!"

### Step 2: Accommodation Screen
- [ ] Navigate to Accommodation tab
- [ ] See toast notification (success or error)
- [ ] If error, note the message
- [ ] If success, see listings

### Step 3: Marketplace Screen
- [ ] Navigate to Marketplace tab
- [ ] See toast notification
- [ ] Check if items load

### Step 4: Check Logs
- [ ] Open Expo DevTools in browser
- [ ] Look for `[ACCOMMODATION]` or `[MARKETPLACE]` prefixed logs
- [ ] Check for errors

---

## 🎯 Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop Expo (Ctrl+C)
# Clear cache
npm start -- --clear

# Or full reset
rm -rf node_modules
npm install
npm start -- --clear
```

### Fix 2: Verify Environment
```bash
# Check .env file exists
cat .env

# Should show:
# EXPO_PUBLIC_SUPABASE_URL=https://ortjjekmexmyvkkotioo.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### Fix 3: Test Database Directly
```bash
# Create test file
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ortjjekmexmyvkkotioo.supabase.co',
  'your-anon-key-here'
);
supabase.from('accommodations').select('*').then(({ data, error }) => {
  console.log('Data:', data?.length, 'items');
  console.log('Error:', error);
});
"
```

### Fix 4: Check Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo
2. Click "Table Editor"
3. Select "accommodations" table
4. Verify data exists
5. Try running query manually

---

## 📱 Device-Specific Issues

### Android
**View logs:**
```bash
adb logcat *:S ReactNative:V ReactNativeJS:V
```

**Clear cache:**
```bash
adb shell pm clear host.exp.exponent
```

### iOS
**View logs:**
- Open Xcode
- Window → Devices and Simulators
- Select your device
- Click "Open Console"

**Clear cache:**
- Delete app from device
- Reinstall

---

## 🔍 Advanced Debugging

### Enable Verbose Logging
Add to `lib/supabase.ts`:
```typescript
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-client-info': 'studentkonnect-app',
    },
  },
  // Add this for debugging
  realtime: {
    log_level: 'debug',
  },
});
```

### Add Network Inspector
```bash
npm install --save-dev react-native-network-inspector
```

Then in `App.tsx`:
```typescript
if (__DEV__) {
  require('react-native-network-inspector').setupNetworkInspector();
}
```

### Use Flipper (Advanced)
1. Install Flipper: https://fbflipper.com/
2. Run app with Flipper enabled
3. View network requests, logs, and database

---

## 📋 Diagnostic Information

When reporting issues, include:

1. **Error Message** (exact text from toast or log)
2. **Debug Screen Output** (screenshot or copy text)
3. **Expo DevTools Logs** (if accessible)
4. **Device Info**:
   - Device model
   - OS version
   - Expo Go version
5. **Network Status**: WiFi or Mobile data?
6. **Auth Status**: Logged in or not?

---

## ✅ Success Indicators

You know it's working when you see:

### In Debug Screen:
```
✅ Supabase client initialized
✅ Accommodations: Found 3 items
   First item: Modern Studio Near Campus
✅ Marketplace: Found 4 items
   First item: Calculus Textbook Bundle
✅ Profiles: Found X users
🎉 Connection test complete!
```

### In Accommodation Screen:
- Toast: "Loaded: Found 3 accommodations"
- 3 cards displayed with images
- Can search and filter

### In Marketplace Screen:
- Toast: "Loaded: Found 4 items"
- 4 cards in grid layout
- Can filter by category

---

## 🆘 Still Not Working?

If you've tried everything:

1. **Check Supabase Status**: https://status.supabase.com/
2. **Verify API Keys**: Get fresh keys from Supabase dashboard
3. **Test on Different Network**: Try WiFi vs Mobile data
4. **Try Web Version**: Press `w` in Expo terminal
5. **Check Firewall**: Some networks block Supabase

---

## 📞 Get Help

Include this information when asking for help:

```
Device: [Your device model]
OS: [iOS/Android version]
Expo Version: [Check package.json]
Error: [Exact error message]
Debug Output: [Copy from debug screen]
Network: [WiFi/Mobile]
Auth: [Logged in: Yes/No]
```

---

## 🎉 Summary

**What we fixed:**
✅ Added detailed error messages
✅ Created debug screen for in-app testing
✅ Enhanced logging with prefixes
✅ Added connection tests before fetching
✅ Toast notifications for all states

**How to use:**
1. Navigate to `/debug` screen
2. Run connection test
3. Check for errors
4. Fix issues based on error messages

**Most common fix:**
- Restart Expo with `--clear` flag
- Verify `.env` file exists
- Check internet connection
- Run seed script if no data

Your app should now show clear error messages and you can debug easily! 🚀
