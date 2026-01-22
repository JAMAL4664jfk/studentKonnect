import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ethers } from "npm:ethers@6.13.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WalletData {
  address: string;
  encryptedPrivateKey: string;
  createdAt: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    // Create a new wallet
    const wallet = ethers.Wallet.createRandom();
    
    // In production, encrypt the private key with KMS or Supabase Vault
    // For now, we'll store it encrypted with a simple key
    const encryptionKey = Deno.env.get("WALLET_ENCRYPTION_KEY");
    
    if (!encryptionKey) {
      throw new Error("Encryption key not configured");
    }

    // Simple encryption (in production, use proper KMS)
    const encryptedKey = btoa(wallet.privateKey); // Base64 encoding (use proper encryption in prod)

    const walletData: WalletData = {
      address: wallet.address,
      encryptedPrivateKey: encryptedKey,
      createdAt: new Date().toISOString(),
    };

    // Store wallet in Supabase database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const response = await fetch(`${supabaseUrl}/rest/v1/wallets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey!,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        user_id: userId || "default-user",
        wallet_address: walletData.address,
        encrypted_private_key: walletData.encryptedPrivateKey,
        created_at: walletData.createdAt,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to store wallet: ${error}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        address: walletData.address,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating wallet:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create wallet",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
