# React Native Networking Solution

## The Problem

React Native apps (on physical devices and emulators) cannot directly access `localhost` or local IP addresses like web browsers can. This causes the "Network request failed" error when trying to connect to your local development server.

## The Solution: Ngrok Tunneling

I've implemented **ngrok tunneling** which creates a public URL that tunnels to your local development server. This works perfectly for React Native development!

---

## Quick Start

### Option 1: With Ngrok Tunnel (Recommended for React Native)

**Step 1: Get Ngrok Auth Token** (One-time setup)

1. Go to [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. Sign up for a free account
3. Get your auth token from [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
4. Add it to your `.env` file:
   ```env
   NGROK_AUTHTOKEN=your_token_here
   ```

**Step 2: Start Everything with Tunnel**

Terminal 1 - Hardhat Node:
```bash
cd blockchain
npx hardhat node
```

Terminal 2 - Backend + App + Tunnel:
```bash
pnpm dev:tunnel
```

**Step 3: Use the App**

The app will automatically use the ngrok tunnel URL! You'll see:
```
🌐 Starting ngrok tunnel for backend server...
✅ Ngrok tunnel started!
📍 Public URL: https://abc123.ngrok.io
```

The React Native app will automatically detect and use this URL.

### Option 2: Without Tunnel (Web Only)

If you're only testing on web (not mobile):

```bash
pnpm dev
```

This works fine for web since web can access `localhost` directly.

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                          │
│                  (Phone/Emulator)                            │
└─────────────────────────────────────────────────────────────┘
                         ↓
                    (Internet)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   Ngrok Cloud Service                        │
│              https://abc123.ngrok.io                         │
└─────────────────────────────────────────────────────────────┘
                         ↓
                    (Tunnel)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Your Local Development Server                   │
│                  localhost:3000                              │
└─────────────────────────────────────────────────────────────┘
```

### What Happens

1. **Tunnel starts**: `pnpm dev:tunnel` starts ngrok tunnel
2. **Public URL created**: Ngrok gives you a public URL like `https://abc123.ngrok.io`
3. **URL saved**: The tunnel URL is saved to `.tunnel-url.json`
4. **App detects**: The app automatically loads and uses the tunnel URL
5. **Requests work**: All API requests go through the tunnel to your local server

### Platform Detection

The app intelligently chooses the best URL:

| Platform | Tunnel Available | URL Used |
|----------|------------------|----------|
| **Web** | Yes | `http://localhost:3000` (direct) |
| **Web** | No | `http://localhost:3000` (direct) |
| **React Native** | Yes | `https://abc123.ngrok.io` (tunnel) ✅ |
| **React Native** | No | `http://192.168.x.x:3000` (fallback) |

---

## Commands

### Development Commands

| Command | Description | Use When |
|---------|-------------|----------|
| `pnpm dev` | Start without tunnel | Testing on web only |
| `pnpm dev:tunnel` | Start with tunnel | Testing on React Native |
| `pnpm tunnel` | Start tunnel only | Tunnel stopped but server running |

### What Each Command Does

**`pnpm dev`** (No Tunnel)
- ✅ Compiles contracts
- ✅ Starts backend server
- ✅ Starts Metro bundler
- ❌ No tunnel (web only)

**`pnpm dev:tunnel`** (With Tunnel)
- ✅ Compiles contracts
- ✅ Starts backend server
- ✅ Starts Metro bundler
- ✅ Starts ngrok tunnel (React Native ready!)

---

## Setup Instructions

### First-Time Setup

1. **Clone and install:**
   ```bash
   git pull origin main
   pnpm install
   ```

2. **Get ngrok token:**
   - Sign up at [ngrok.com](https://dashboard.ngrok.com/signup)
   - Copy your auth token

3. **Add to `.env`:**
   ```env
   NGROK_AUTHTOKEN=your_token_here
   ```

4. **Start Hardhat node:**
   ```bash
   cd blockchain
   npx hardhat node
   ```

5. **Start with tunnel:**
   ```bash
   pnpm dev:tunnel
   ```

6. **Open app and test:**
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web
   - Connect wallet - should work!

### Daily Development

Once set up, just:

```bash
# Terminal 1
cd blockchain && npx hardhat node

# Terminal 2
pnpm dev:tunnel
```

---

## Troubleshooting

### Error: "authtoken not found"

**Problem:** Ngrok requires authentication

**Solution:**
1. Get token from [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
2. Add to `.env`:
   ```env
   NGROK_AUTHTOKEN=your_token_here
   ```
3. Restart: `pnpm dev:tunnel`

### Error: "Network request failed" (Still)

**Checklist:**
1. ✅ Is tunnel running? Look for "✅ Ngrok tunnel started!"
2. ✅ Is backend running? Look for "[api] server listening on port 3000"
3. ✅ Is Hardhat running? Look for "Started HTTP and WebSocket JSON-RPC server"
4. ✅ Did you restart the app after starting tunnel?

**Solution:**
```bash
# Stop everything (Ctrl+C)
# Restart Hardhat node
cd blockchain && npx hardhat node

# In new terminal, restart with tunnel
pnpm dev:tunnel

# Restart app (press 'r' in Metro bundler)
```

### Error: "Tunnel URL not loading"

**Problem:** `.tunnel-url.json` not found or stale

**Solution:**
1. Stop tunnel (Ctrl+C)
2. Delete old file: `rm .tunnel-url.json`
3. Restart: `pnpm dev:tunnel`
4. Restart app

### Tunnel URL Changes

**Problem:** Ngrok free tier gives you a new URL each time

**Impact:** You need to restart the app when tunnel restarts

**Solution:**
- Keep tunnel terminal open during development
- If tunnel stops, restart and reload app
- For permanent URL, upgrade to ngrok paid plan

### App Still Uses Old URL

**Problem:** App cached old configuration

**Solution:**
```bash
# Clear Metro cache and restart
npx expo start -c
```

---

## Console Output Examples

### Successful Startup

```
🌐 Starting ngrok tunnel for backend server...

✅ Ngrok tunnel started!
📍 Public URL: https://abc123.ngrok.io

💾 Tunnel URL saved to .tunnel-url.json

📱 To use this tunnel in your React Native app:
   1. The app will automatically use: https://abc123.ngrok.io
   2. Just restart your app to pick up the new URL

⚠️  Keep this terminal open to maintain the tunnel!
   Press Ctrl+C to stop the tunnel
```

### In React Native App

```
🌐 Using ngrok tunnel: https://abc123.ngrok.io
Connecting to API: https://abc123.ngrok.io
Connecting to RPC: http://192.168.0.134:8545
```

---

## Why Ngrok?

### The Problem with Direct Connection

React Native apps run in a sandboxed environment:

- **Android Emulator**: Can't access `localhost` (needs `10.0.2.2`)
- **iOS Simulator**: Can access `localhost` but not always reliable
- **Physical Devices**: Can't access `localhost` at all (needs computer's IP)
- **IP Addresses**: Require same WiFi network and firewall configuration

### The Ngrok Solution

✅ **Works everywhere**: Internet-accessible URL works on any device
✅ **No network config**: No WiFi requirements or firewall setup
✅ **Automatic**: App detects and uses tunnel automatically
✅ **Reliable**: Stable connection through ngrok's infrastructure
✅ **Free tier**: Perfect for development (paid plans for production)

---

## Advanced: Manual Tunnel Control

### Start Tunnel Separately

If you want to control the tunnel independently:

```bash
# Terminal 1: Hardhat
cd blockchain && npx hardhat node

# Terminal 2: Backend
pnpm dev:server

# Terminal 3: Metro
pnpm dev:metro

# Terminal 4: Tunnel
pnpm tunnel
```

### Check Tunnel Status

```bash
# Check if tunnel URL exists
cat .tunnel-url.json

# Output:
# {
#   "url": "https://abc123.ngrok.io",
#   "timestamp": "2026-01-22T10:30:00.000Z"
# }
```

### Stop Tunnel Only

Press `Ctrl+C` in the tunnel terminal. The backend and Metro will keep running.

---

## Production Considerations

### For Production Deployment

**Don't use ngrok in production!** Instead:

1. **Deploy backend to cloud:**
   - Vercel, Railway, Render, AWS, etc.
   - Get a real production URL

2. **Update `.env`:**
   ```env
   EXPO_PUBLIC_API_URL=https://your-production-api.com
   NODE_ENV=production
   ```

3. **Build production app:**
   ```bash
   eas build --platform android
   eas build --platform ios
   ```

### Ngrok is for Development Only

✅ **Good for:**
- Local development
- Testing on physical devices
- Sharing with team members temporarily
- Quick demos

❌ **Not for:**
- Production apps
- Long-term hosting
- High traffic
- Sensitive data (use HTTPS and proper security)

---

## Summary

### The Fix

I've implemented automatic ngrok tunneling that:

1. ✅ Creates a public URL for your local server
2. ✅ Automatically saves the URL for the app to use
3. ✅ Works on all React Native platforms
4. ✅ Requires minimal setup (just add ngrok token once)
5. ✅ Integrates seamlessly with existing workflow

### What You Need to Do

1. **One-time:** Get ngrok token and add to `.env`
2. **Daily:** Use `pnpm dev:tunnel` instead of `pnpm dev`
3. **That's it!** Everything else is automatic

### Files Changed

**New Files:**
- `scripts/start-tunnel.js` - Ngrok tunnel starter
- `REACT_NATIVE_NETWORKING.md` - This guide

**Updated Files:**
- `utils/api-config.ts` - Detects and uses tunnel URL
- `package.json` - Added `dev:tunnel` and `tunnel` scripts
- `.gitignore` - Ignores `.tunnel-url.json`

---

## Need Help?

If you're still having issues:

1. Check that all three services are running:
   - Hardhat node
   - Backend server
   - Ngrok tunnel

2. Look for these success messages:
   - "✅ Ngrok tunnel started!"
   - "🎉 All blockchain services are ready!"
   - "Started HTTP and WebSocket JSON-RPC server"

3. Check the console in your app:
   - Should see: "🌐 Using ngrok tunnel: https://..."
   - Should see: "Connecting to API: https://..."

4. Try restarting everything:
   ```bash
   # Kill all processes
   # Start fresh
   cd blockchain && npx hardhat node
   # New terminal
   pnpm dev:tunnel
   ```

**Happy developing!** 🚀
