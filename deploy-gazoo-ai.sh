#!/bin/bash

# Deploy Gazoo AI Edge Function to Supabase
# This script deploys the function with JWT verification disabled

echo "🚀 Deploying Gazoo AI Edge Function..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed!"
    echo ""
    echo "Install it with:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if logged in
echo "Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase!"
    echo ""
    echo "Login with:"
    echo "supabase login"
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

# Link to project if not already linked
echo "Linking to project ortjjekmexmyvkkotioo..."
supabase link --project-ref ortjjekmexmyvkkotioo

echo ""
echo "📦 Deploying gazoo-chat function with JWT verification disabled..."
echo ""

# Deploy the function with --no-verify-jwt flag
supabase functions deploy gazoo-chat --no-verify-jwt

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔑 Don't forget to set the OPENAI_API_KEY secret:"
echo "supabase secrets set OPENAI_API_KEY=your-openai-api-key-here"
echo ""
echo "🧪 Test the function with:"
echo "curl -X POST 'https://ortjjekmexmyvkkotioo.supabase.co/functions/v1/gazoo-chat' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"messages\": [{\"role\": \"user\", \"content\": \"Hello!\"}]}'"
echo ""
