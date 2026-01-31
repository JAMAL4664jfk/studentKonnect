# Wallet Session Storage - Database Implementation

## Overview

This document describes the implementation of persistent wallet session storage using Supabase PostgreSQL database. This allows users to stay logged in across app restarts and enables automatic token refresh to maintain active sessions.

## Architecture

### Components

1. **Database Schema** (`drizzle/schema.ts`)
   - `walletSessions` table stores user tokens and session metadata
   - Includes access token, refresh token, and expiry timestamps
   - Indexed on phoneNumber and userId for fast lookups

2. **Server-Side API** (`server/routes/wallet-session.ts`)
   - REST API endpoints for token CRUD operations
   - Keeps database credentials secure on server
   - Endpoints:
     - `POST /api/wallet-session/store` - Store/update session
     - `GET /api/wallet-session/:phoneNumber` - Get session by phone
     - `POST /api/wallet-session/refresh` - Update access token
     - `POST /api/wallet-session/logout` - Deactivate session

3. **Database Service** (`server/wallet-session-db.ts`)
   - Drizzle ORM queries for database operations
   - Token expiry checking logic
   - Session activation/deactivation

4. **Client Service** (`lib/wallet-session-client.ts`)
   - Mobile app interface to server API
   - Caches phone number and user ID in AsyncStorage
   - Session restoration on app startup

5. **Wallet API Integration** (`lib/wallet-api.ts`)
   - Updated to use database storage instead of AsyncStorage
   - Automatic fallback to AsyncStorage if database unavailable
   - Retrieves tokens from database for API calls

6. **App Initialization** (`app/_layout.tsx`)
   - Restores session on app startup
   - Logs session status for debugging

## Database Schema

```sql
CREATE TABLE "walletSessions" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
  "customerId" VARCHAR(255),
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL,
  "accessTokenExpiresAt" TIMESTAMP NOT NULL,
  "refreshTokenExpiresAt" TIMESTAMP NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastRefreshedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Flow Diagrams

### Login Flow

```
User enters phone + PIN
  ↓
walletAPI.login(phone, pin, userId)
  ↓
Wallet API returns tokens
  ↓
storeTokens() called
  ↓
storeWalletSession() → Server API
  ↓
Database stores tokens
  ↓
Phone number cached in AsyncStorage
  ↓
User navigates to dashboard
```

### Session Restoration Flow

```
App starts
  ↓
restoreSession() called
  ↓
Get cached phone number from AsyncStorage
  ↓
getWalletSession(phone) → Server API
  ↓
Database returns session
  ↓
Check if refresh token expired
  ↓
If valid: User stays logged in
If expired: User must login again
```

### Token Refresh Flow

```
API call initiated
  ↓
getHeaders() checks token expiry
  ↓
If expiring in < 5 minutes:
  ↓
refreshAccessToken() called
  ↓
Wallet API /auth/refreshToken
  ↓
New access token returned
  ↓
updateAccessTokenInDB() → Server API
  ↓
Database updates access token
  ↓
Original API call proceeds with fresh token
```

## Usage

### For New Users (Registration)

```typescript
// After PIN creation in wallet-create-pin.tsx
const loginResponse = await walletAPI.login(phoneNumber, pin, userId);
// Tokens automatically stored in database
```

### For Existing Users (Login)

```typescript
// In wallet-login.tsx
const response = await walletAPI.login(phoneNumber, pin, userId);
// Tokens automatically stored in database
```

### Session Restoration

```typescript
// Automatically called in app/_layout.tsx on startup
const session = await restoreSession();
if (session) {
  // User is logged in
  // Tokens available for API calls
} else {
  // User needs to login
}
```

### Logout

```typescript
const phoneNumber = await getCachedPhoneNumber();
await logoutWalletSession(phoneNumber);
// Session deactivated in database
// Local cache cleared
```

## Migration Instructions

### 1. Run Database Migration

```bash
# Apply the migration to your Supabase database
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/20260131_wallet_sessions.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

### 2. Update Environment Variables

Ensure your `.env` file has the correct Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

### 3. Start the Server

```bash
cd server
npm run dev
```

The server must be running for the mobile app to store/retrieve tokens from the database.

### 4. Update API Base URL (Production)

In `lib/wallet-session-client.ts`, update the API_BASE_URL for production:

```typescript
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api'
  : 'https://your-production-server.com/api'; // Update this
```

## Security Considerations

1. **Database Credentials**: Never expose database credentials in the mobile app. Always use server API.

2. **Token Encryption**: Consider encrypting tokens before storing in database (future enhancement).

3. **Session Expiry**: Refresh tokens expire after 30 days. Users must re-login after that.

4. **Automatic Cleanup**: Consider adding a cron job to delete expired sessions from database.

5. **Rate Limiting**: Add rate limiting to session API endpoints to prevent abuse.

## Troubleshooting

### Tokens Not Storing

Check console logs for:
- `💾 Storing tokens in database...`
- `✅ Session stored successfully`

If you see `⚠️ Missing phone number or user ID, falling back to AsyncStorage`, ensure:
1. User ID is passed to login method
2. Phone number is cached in AsyncStorage

### Session Not Restoring

Check console logs on app startup:
- `🔄 [App Startup] Attempting to restore wallet session...`
- `✅ [App Startup] Session restored successfully`

If you see `ℹ️ No valid session found`, the user needs to login again.

### Database Connection Issues

Ensure:
1. Server is running (`npm run dev` in server folder)
2. DATABASE_URL is correct in `.env`
3. Supabase database is accessible
4. Migration has been applied

## Future Enhancements

1. **Token Encryption**: Encrypt tokens before storing in database
2. **Multi-Device Support**: Allow users to have multiple active sessions
3. **Session Management UI**: Show user their active sessions and allow logout from specific devices
4. **Automatic Cleanup**: Cron job to delete expired sessions
5. **Push Notifications**: Notify users when their session is about to expire
6. **Biometric Authentication**: Add fingerprint/face ID for quick re-authentication

## Testing

### Manual Testing Checklist

- [ ] New user registration stores tokens in database
- [ ] Existing user login stores tokens in database
- [ ] App restart restores session successfully
- [ ] Token refresh updates database
- [ ] Logout deactivates session in database
- [ ] Expired refresh token requires re-login
- [ ] Fallback to AsyncStorage works when database unavailable

### Console Log Verification

Look for these logs during testing:

**Login:**
```
🔐 Attempting login for: 0844050611
✅ Login successful, tokens stored
📊 Token expires in: 12000 seconds
💾 Storing tokens in database with expiry: 12000s (200 minutes)
✅ [WalletSessionClient] Session stored successfully
```

**App Startup:**
```
🔄 [App Startup] Attempting to restore wallet session...
✅ [App Startup] Session restored successfully
📱 User phone: 0844050611
🕒 Access token expires: 2026-01-31T14:30:00.000Z
🔄 Refresh token expires: 2026-02-30T12:00:00.000Z
```

**Token Refresh:**
```
🔍 Token expiry check: EXPIRED
🔄 Token expired, attempting refresh...
✅ Token refresh successful
✅ [WalletSessionClient] Access token updated successfully
```

## Support

For issues or questions, check:
1. Console logs for error messages
2. Server logs for API errors
3. Supabase dashboard for database errors
4. This documentation for troubleshooting steps
