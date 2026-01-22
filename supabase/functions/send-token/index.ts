import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ethers } from "npm:ethers@6.13.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { from, to, tokenAddress, amount } = await req.json();

    // Get wallet private key from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const walletResponse = await fetch(
      `${supabaseUrl}/rest/v1/wallets?wallet_address=eq.${from}&select=encrypted_private_key`,
      {
        headers: {
          "apikey": supabaseKey!,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    const wallets = await walletResponse.json();
    if (!wallets || wallets.length === 0) {
      throw new Error("Wallet not found");
    }

    // Decrypt private key (use proper decryption in production)
    const privateKey = atob(wallets[0].encrypted_private_key);

    // Connect to blockchain
    const rpcUrl = Deno.env.get("RPC_URL") || "http://localhost:8545";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // ERC20 ABI for transfer
    const tokenABI = [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)",
    ];

    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);

    // Get decimals and parse amount
    const decimals = await tokenContract.decimals();
    const parsedAmount = ethers.parseUnits(amount, decimals);

    // Send transaction
    const tx = await tokenContract.transfer(to, parsedAmount);
    const receipt = await tx.wait();

    return new Response(
      JSON.stringify({
        success: true,
        transactionHash: receipt.hash,
        from: from,
        to: to,
        amount: amount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending token:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send token",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
