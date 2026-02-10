# Gazoo AI Edge Function Deployment Guide

## Current Issue
The Gazoo AI Edge Function is returning `401 Invalid JWT` errors because JWT verification is enabled by default on deployed functions.

## Solution
Deploy the function with the `--no-verify-jwt` flag to disable JWT verification.

---

## Prerequisites

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```
   This will open a browser window for authentication.

---

## Deployment Steps

### Option 1: Use the Deployment Script (Recommended)

```bash
cd /path/to/studentKonnect
./deploy-gazoo-ai.sh
```

The script will:
- ✅ Check if Supabase CLI is installed
- ✅ Verify you're logged in
- ✅ Link to your project
- ✅ Deploy with JWT verification disabled
- ✅ Remind you to set the OpenAI API key

---

### Option 2: Manual Deployment

**Step 1: Link to your Supabase project**
```bash
supabase link --project-ref ortjjekmexmyvkkotioo
```

**Step 2: Deploy the function**
```bash
supabase functions deploy gazoo-chat --no-verify-jwt
```

**Step 3: Set the OpenAI API key** (if not already set)
```bash
supabase secrets set OPENAI_API_KEY=your-openai-api-key-here
```

> **Note:** Replace `your-openai-api-key-here` with your actual OpenAI API key from https://platform.openai.com/api-keys

---

## Testing

After deployment, test the function:

```bash
curl -X POST 'https://ortjjekmexmyvkkotioo.supabase.co/functions/v1/gazoo-chat' \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Hello, can you help me with study tips?"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "message": "Hello! I'd be happy to help you with study tips...",
  "success": true
}
```

**If you get an error:**
- `401 Invalid JWT` → Function not deployed with `--no-verify-jwt`
- `OpenAI API key not configured` → Secret not set (run Step 3 above)
- `OpenAI API error` → Check if the API key is valid

---

## Verification in the App

1. Open the **Student Konnect** app
2. Go to **Home** page
3. Tap **"Chat with Gazoo AI"** button
4. Send a message like "Hello!"
5. ✅ You should get a response from Gazoo AI

---

## Troubleshooting

### "Supabase CLI not found"
Install it:
```bash
npm install -g supabase
```

### "Not logged in"
Login:
```bash
supabase login
```

### "Project not found"
Make sure you're using the correct project ref:
```bash
supabase link --project-ref ortjjekmexmyvkkotioo
```

### "Still getting 401 errors"
The function might have been deployed without the `--no-verify-jwt` flag. Redeploy:
```bash
supabase functions deploy gazoo-chat --no-verify-jwt
```

---

## Alternative: Dashboard Deployment

If CLI deployment doesn't work, you can also deploy via the Supabase Dashboard:

1. Go to https://supabase.com/dashboard/project/ortjjekmexmyvkkotioo/functions
2. Click on **gazoo-chat** function
3. Click **Deploy new version**
4. In the deployment settings, **disable JWT verification**
5. Upload the function code from `supabase/functions/gazoo-chat/index.ts`
6. Click **Deploy**

---

## Notes

- The `config.toml` file with `verify_jwt = false` only affects **local development**
- For **production** deployment, you must use the `--no-verify-jwt` flag
- The OpenAI API key is stored as a secret in Supabase (not in code)
- The function works without user authentication for easier access
