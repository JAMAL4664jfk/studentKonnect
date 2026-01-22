import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Get token addresses from environment variables
    const tokens = {
      SKETH: Deno.env.get("TOKEN_SKETH_ADDRESS") || "",
      SKUSD: Deno.env.get("TOKEN_SKUSD_ADDRESS") || "",
      SKBTC: Deno.env.get("TOKEN_SKBTC_ADDRESS") || "",
      SKDAI: Deno.env.get("TOKEN_SKDAI_ADDRESS") || "",
    };

    const swapAddress = Deno.env.get("TOKEN_SWAP_ADDRESS") || "";

    return new Response(
      JSON.stringify({
        success: true,
        tokens,
        swapAddress,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error getting tokens:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to get tokens",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
