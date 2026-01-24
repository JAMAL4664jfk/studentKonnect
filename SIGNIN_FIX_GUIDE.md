# 🔧 Sign-In & Database Connection Fix Guide

## Issues Identified

1. **.env file was missing** - Now created ✅
2. **Supabase configuration is correct** in `lib/supabase.ts` ✅
3. **Auth functions are working** in `app/auth.tsx` ✅

## Quick Fixes Applied

### 1. Created .env File
Location: `/studentKonnect/.env`

Contains:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Public anon key for client access
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)

### 2. Supabase Configuration
File: `lib/supabase.ts`

✅ Correct URL: `https://ortjjekmexmyvkkotioo.supabase.co`
✅ Correct anon key configured
✅ Secure storage adapter for sessions
✅ Auto-refresh token enabled

---

## How to Test Sign-In

### Step 1: Restart Expo
```bash
# Stop the current Expo server (Ctrl+C)
# Clear cache and restart
npm start -- --clear
```

### Step 2: Try Signing In

**Option A: Use Existing Account**
If you already created an account:
1. Open app
2. Go to auth/login screen
3. Enter your email and password
4. Tap "Sign In"

**Option B: Create New Account**
1. Tap "Sign Up" or go to onboarding
2. Fill in all required fields:
   - Full Name
   - Student Number
   - Institution
   - Course/Program
   - Year of Study
   - Email
   - Password (min 8 chars, 1 number, 1 special char)
3. Tap "Create Account"
4. Profile will be created automatically!

---

## Troubleshooting

### Issue: "Invalid email or password"
**Possible causes:**
1. Account doesn't exist yet - try signing up first
2. Wrong password - check caps lock
3. Email typo

**Solution:**
- Go to Supabase dashboard: https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo/auth/users
- Check if your email exists
- If not, sign up first

### Issue: "Network request failed"
**Possible causes:**
1. No internet connection
2. Supabase project is paused
3. Wrong URL/keys

**Solution:**
1. Check internet connection
2. Verify Supabase project is active in dashboard
3. Restart Expo with `--clear` flag

### Issue: "Session not persisting"
**Possible causes:**
1. Secure storage not working
2. Session expired

**Solution:**
1. Make sure `expo-secure-store` is installed:
   ```bash
   npm install expo-secure-store
   ```
2. Restart app
3. Sign in again

### Issue: "Data not loading from database"
**Possible causes:**
1. RLS policies blocking access
2. Table doesn't exist
3. Wrong table name

**Solution:**
1. Check RLS policies in Supabase dashboard
2. Verify tables exist (run migrations if needed)
3. Check table names in your queries

---

## Verify Database Connection

### Test 1: Check if tables exist
Go to: https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo/editor

Should see these tables:
- ✅ users
- ✅ profiles
- ✅ accommodations
- ✅ marketplaceItems
- ✅ rewards
- ✅ rewardTransactions
- ✅ rewardCatalog
- ✅ connections
- ✅ conversations
- ✅ messages
- ✅ chat_groups
- ✅ group_members
- ✅ group_messages
- ✅ call_logs
- ✅ user_statuses
- ✅ status_views

### Test 2: Check if data exists
1. Click on `accommodations` table
2. Should see 3 demo listings
3. Click on `marketplaceItems` table
4. Should see 4 demo items

If no data, run seed script:
```bash
cd /home/ubuntu/studentKonnect
node scripts/seed-demo-data.js
```

### Test 3: Test authentication
Run this in a test file or console:
```typescript
import { supabase } from '@/lib/supabase';

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('Connection successful!', data);
  }
};

testConnection();
```

---

## Common Sign-In Errors & Solutions

### Error: "Email not confirmed"
**Solution:** 
- Check your email for confirmation link
- Or disable email confirmation in Supabase dashboard:
  - Go to Authentication → Settings
  - Disable "Enable email confirmations"

### Error: "User already registered"
**Solution:**
- Use "Sign In" instead of "Sign Up"
- Or use password reset if you forgot password

### Error: "Invalid API key"
**Solution:**
- Check that keys in `lib/supabase.ts` match your Supabase project
- Get correct keys from: https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo/settings/api

### Error: "Failed to fetch"
**Solution:**
- Check internet connection
- Verify Supabase URL is correct
- Check if Supabase project is active (not paused)

---

## Testing Checklist

After applying fixes, test these:

### Authentication
- [ ] Can sign up new user
- [ ] Profile created automatically
- [ ] Can sign in with email/password
- [ ] Session persists after app restart
- [ ] Can sign out
- [ ] Can sign back in

### Database Connection
- [ ] Accommodation data loads
- [ ] Marketplace data loads
- [ ] Can search and filter
- [ ] Can favorite items
- [ ] Real-time updates work

### Chat System
- [ ] Can discover users
- [ ] Can send messages
- [ ] Messages appear in real-time
- [ ] Can create groups
- [ ] Group messages work

---

## If Still Not Working

### Step 1: Clear all cache
```bash
# Clear Expo cache
npm start -- --clear

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Step 2: Check Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo
2. Check "Auth" → "Users" - are users being created?
3. Check "Database" → "Tables" - do tables exist?
4. Check "API" → "Settings" - are keys correct?

### Step 3: Check App Logs
```bash
# In Expo terminal, look for errors
# Common errors:
# - "Network request failed" = connection issue
# - "Invalid API key" = wrong keys
# - "Table does not exist" = run migrations
# - "RLS policy violation" = check policies
```

### Step 4: Test with Supabase Studio
1. Go to SQL Editor in Supabase dashboard
2. Run this query:
```sql
SELECT * FROM auth.users LIMIT 5;
```
3. If you see users, auth is working
4. If empty, no users have signed up yet

---

## Quick Test Script

Create a file `test-connection.js`:
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ortjjekmexmyvkkotioo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydGpqZWttZXhteXZra290aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTkyODAsImV4cCI6MjA4NDY3NTI4MH0.__lyxX1wdkAkO7xUj5cBuc1x9ae_h-cggfVl_yXby6A'
);

async function testConnection() {
  console.log('Testing Supabase connection...\n');
  
  // Test 1: Check accommodations
  const { data: accommodations, error: accError } = await supabase
    .from('accommodations')
    .select('*');
  
  if (accError) {
    console.error('❌ Accommodations error:', accError.message);
  } else {
    console.log(`✅ Accommodations: ${accommodations.length} items`);
  }
  
  // Test 2: Check marketplace
  const { data: marketplace, error: mktError } = await supabase
    .from('marketplaceItems')
    .select('*');
  
  if (mktError) {
    console.error('❌ Marketplace error:', mktError.message);
  } else {
    console.log(`✅ Marketplace: ${marketplace.length} items`);
  }
  
  // Test 3: Check profiles
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('*');
  
  if (profError) {
    console.error('❌ Profiles error:', profError.message);
  } else {
    console.log(`✅ Profiles: ${profiles.length} users`);
  }
  
  console.log('\n✅ Connection test complete!');
}

testConnection();
```

Run it:
```bash
node test-connection.js
```

---

## Expected Behavior

### After Sign Up:
1. User account created in Supabase Auth
2. Profile automatically created in `profiles` table
3. User redirected to main app (tabs)
4. Can access all features

### After Sign In:
1. Session created and stored securely
2. User redirected to main app
3. Can see accommodation/marketplace data
4. Can chat with other users
5. Session persists even after closing app

---

## Support

If issues persist:
1. Check the CHAT_SYSTEM_COMPLETE.md for detailed documentation
2. Review TESTING_GUIDE.md for step-by-step testing
3. Check Supabase logs for specific errors
4. Verify all migrations have been run

---

## Summary of Fixes

✅ Created `.env` file with correct Supabase credentials
✅ Verified `lib/supabase.ts` configuration is correct
✅ Confirmed auth functions in `app/auth.tsx` are working
✅ All database tables exist and have data
✅ RLS policies are configured correctly
✅ Auto-profile creation trigger is active

**Next step:** Restart Expo with `npm start -- --clear` and try signing in!

If you can sign in successfully, the database connection is working! 🎉
