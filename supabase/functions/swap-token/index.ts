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
    const { from, tokenInAddress, tokenOutAddress, amountIn, minAmountOut } = await req.json();

    // Get wallet private key from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const walletResponse = await fetch(
      `${supabaseUrl}/rest/v1/wallets?address=eq.${from}&select=encrypted_private_key`,
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

    // Decrypt private key
    const privateKey = atob(wallets[0].encrypted_private_key);

    // Connect to blockchain
    const rpcUrl = Deno.env.get("RPC_URL") || "http://localhost:8545";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Get TokenSwap contract address from config
    const swapAddress = Deno.env.get("TOKEN_SWAP_ADDRESS");
    if (!swapAddress) {
      throw new Error("TokenSwap contract address not configured");
    }

    // TokenSwap ABI
    const swapABI = [
      "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) returns (uint256)",
    ];

    // ERC20 ABI for approval
    const tokenABI = [
      "function approve(address spender, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)",
    ];

    // Get token decimals
    const tokenInContract = new ethers.Contract(tokenInAddress, tokenABI, wallet);
    const decimals = await tokenInContract.decimals();
    const parsedAmountIn = ethers.parseUnits(amountIn, decimals);
    const parsedMinAmountOut = ethers.parseUnits(minAmountOut, decimals);

    // Approve TokenSwap to spend tokens
    const approveTx = await tokenInContract.approve(swapAddress, parsedAmountIn);
    await approveTx.wait();

    // Execute swap
    const swapContract = new ethers.Contract(swapAddress, swapABI, wallet);
    const swapTx = await swapContract.swap(
      tokenInAddress,
      tokenOutAddress,
      parsedAmountIn,
      parsedMinAmountOut
    );
    const receipt = await swapTx.wait();

    return new Response(
      JSON.stringify({
        success: true,
        transactionHash: receipt.hash,
        from: from,
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        amountIn: amountIn,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error swapping tokens:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to swap tokens",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
