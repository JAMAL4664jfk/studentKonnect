# Network Connection Troubleshooting Guide

## Error: "Network request failed"

This error occurs when the React Native app cannot connect to the backend server. Here's how to fix it:

---

## Quick Fix Checklist

### 1. ✅ Ensure Backend Server is Running

**Check if the server is running:**

Open a terminal and run:
```bash
pnpm dev
```

You should see output like:
```
🔄 Initializing blockchain services...
✅ Blockchain services initialized
✅ Auto-funding service ready
🎉 All blockchain services are ready!
[api] server listening on port 3000
```

If you don't see this, the server isn't running. Start it with `pnpm dev`.

### 2. ✅ Ensure Hardhat Node is Running

The backend needs a blockchain to connect to. In a **separate terminal**:

```bash
cd blockchain
npx hardhat node
```

You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

### 3. ✅ Check Your Platform

The fix I just implemented automatically detects your platform and uses the correct URL:

| Platform | API URL Used |
|----------|--------------|
| **Web** | `http://localhost:3000` |
| **iOS Simulator** | `http://localhost:3000` |
| **iOS Physical Device** | `http://YOUR_COMPUTER_IP:3000` |
| **Android Emulator** | `http://10.0.2.2:3000` |
| **Android Physical Device** | `http://YOUR_COMPUTER_IP:3000` |

---

## Platform-Specific Instructions

### Running on Web

**No special setup needed!** Just:
1. Start backend: `pnpm dev`
2. Open web: Press `w` in Expo
3. Connect wallet in the app

### Running on iOS Simulator

**No special setup needed!** Just:
1. Start backend: `pnpm dev`
2. Open iOS simulator: Press `i` in Expo
3. Connect wallet in the app

### Running on Android Emulator

**No special setup needed!** The app automatically uses `10.0.2.2` to reach your host machine.

1. Start backend: `pnpm dev`
2. Open Android emulator: Press `a` in Expo
3. Connect wallet in the app

### Running on Physical Device (iOS or Android)

**Requires your computer's IP address:**

1. **Find your computer's IP address:**

   **On Windows:**
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., `192.168.1.100`)

   **On Mac/Linux:**
   ```bash
   ifconfig
   ```
   Look for "inet" under your active network interface (e.g., `192.168.1.100`)

2. **Ensure your phone and computer are on the same WiFi network**

3. **The app will automatically detect and use your IP** when you scan the QR code with Expo Go

4. **If it still doesn't work**, you may need to allow firewall access:
   
   **Windows:**
   - Open Windows Defender Firewall
   - Click "Allow an app through firewall"
   - Find Node.js and check both Private and Public

   **Mac:**
   - System Preferences → Security & Privacy → Firewall
   - Click "Firewall Options"
   - Add Node.js if not listed

---

## Detailed Diagnostics

### Test Backend Connection

Open your browser and go to:
```
http://localhost:3000/api/health
```

You should see:
```json
{"ok": true, "timestamp": 1234567890}
```

If you get an error, the backend isn't running or isn't accessible.

### Test from Physical Device

If using a physical device, replace `localhost` with your computer's IP:
```
http://YOUR_IP:3000/api/health
```

Example:
```
http://192.168.1.100:3000/api/health
```

### Check Console Logs

In the app, check the console logs when connecting:

**You should see:**
```
Connecting to API: http://localhost:3000
Connecting to RPC: http://localhost:8545
```

**If you see:**
```
Error connecting wallet: [TypeError: Network request failed]
```

This means the app can't reach the backend. Follow the checklist above.

---

## Common Issues and Solutions

### Issue 1: "Cannot connect to server"

**Symptoms:**
- Error: "Network request failed"
- Console shows: "Cannot connect to server at http://localhost:3000"

**Solutions:**
1. Verify backend is running: `pnpm dev`
2. Check that port 3000 isn't blocked by another process
3. Try restarting the backend server

### Issue 2: "Blockchain not available"

**Symptoms:**
- Backend starts but shows: "❌ Failed to initialize blockchain services"
- Warning: "Please ensure Hardhat node is running"

**Solutions:**
1. Start Hardhat node: `cd blockchain && npx hardhat node`
2. Ensure port 8545 isn't blocked
3. Check that Hardhat node output shows "Started HTTP and WebSocket JSON-RPC server"

### Issue 3: Works on Web but not on Mobile

**Symptoms:**
- Web version connects fine
- Mobile shows "Network request failed"

**Solutions:**

**For Android Emulator:**
- The app should automatically use `10.0.2.2`
- If not working, restart the emulator

**For Physical Devices:**
1. Ensure phone and computer are on same WiFi
2. Check your computer's firewall settings
3. Verify you can access `http://YOUR_IP:3000/api/health` from phone's browser
4. Try restarting Expo: `npx expo start -c`

### Issue 4: "CORS Error" (Web only)

**Symptoms:**
- Console shows CORS policy error
- Backend is running but requests fail

**Solution:**
The backend already has CORS enabled. If you still see this:
1. Clear browser cache
2. Restart backend server
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue 5: Intermittent Connection Issues

**Symptoms:**
- Sometimes works, sometimes doesn't
- Random "Network request failed" errors

**Solutions:**
1. Restart Metro bundler: `npx expo start -c`
2. Restart backend server: `pnpm dev`
3. Clear Expo cache: `npx expo start -c --clear`
4. Check for port conflicts (another app using port 3000 or 8545)

---

## Testing the Fix

After pulling the latest changes, test the connection:

1. **Pull latest code:**
   ```bash
   git pull origin main
   pnpm install
   ```

2. **Start Hardhat node:**
   ```bash
   cd blockchain
   npx hardhat node
   ```

3. **Start backend (in new terminal):**
   ```bash
   pnpm dev
   ```

4. **Test API health:**
   - Open browser: `http://localhost:3000/api/health`
   - Should see: `{"ok": true, "timestamp": ...}`

5. **Open app:**
   - Web: Press `w`
   - iOS: Press `i`
   - Android: Press `a`

6. **Connect wallet:**
   - Click "Connect Wallet" button
   - Check console logs for connection messages
   - Should see wallet address appear

---

## What Changed

I've implemented automatic platform detection that:

✅ **Detects your platform** (web, iOS, Android)
✅ **Uses the correct URL** for each platform automatically
✅ **Handles physical devices** by detecting your computer's IP
✅ **Provides better error messages** when connection fails
✅ **Works across all platforms** without manual configuration

**New Files:**
- `utils/api-config.ts` - Smart API URL detection and configuration

**Updated Files:**
- `contexts/CryptoWalletContext.tsx` - Uses new API configuration

---

## Still Having Issues?

If you're still experiencing connection problems after following this guide:

1. **Check the console logs** - They now show which URL is being used
2. **Verify both services are running** - Hardhat node AND backend server
3. **Test the health endpoint** - `http://localhost:3000/api/health`
4. **Check your firewall** - Especially for physical devices
5. **Restart everything** - Sometimes a fresh start helps:
   ```bash
   # Kill all processes
   # Restart Hardhat node
   cd blockchain && npx hardhat node
   
   # In new terminal, restart app
   pnpm dev
   ```

---

## Summary

The "Network request failed" error is now automatically handled for all platforms. The app will:

1. Detect which platform you're using
2. Use the appropriate URL for that platform
3. Provide clear error messages if connection fails
4. Work seamlessly on web, simulators, and physical devices

Just make sure both the Hardhat node and backend server are running, and the app will handle the rest!
