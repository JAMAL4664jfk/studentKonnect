import { Router } from "express";
import Constants from "expo-constants";

const router = Router();

// Get Wallet API config from environment
const WALLET_API_URL =
  process.env.EXPO_PUBLIC_WALLET_API_URL || "https://api.payelio.com/v3/";
const CLIENT_KEY =
  process.env.EXPO_PUBLIC_WALLET_CLIENT_KEY ||
  "b154e7-b21b2f-f0a14d-96affa-6d3fb9";
const CLIENT_PASS =
  process.env.EXPO_PUBLIC_WALLET_CLIENT_PASS ||
  "mwDv794ZLsTi0ezF3EBK4ZMsHtAWH1cR";

console.log("[Wallet Proxy] Initialized with URL:", WALLET_API_URL);

/**
 * Proxy endpoint for Wallet API requests
 * This bypasses CORS restrictions when running on web
 */
router.post("/wallet-proxy/*", async (req, res) => {
  try {
    const endpoint = req.params[0]; // Get the path after /wallet-proxy/
    const url = `${WALLET_API_URL}${endpoint}`;

    console.log(`[Wallet Proxy] Forwarding request to: ${url}`);
    console.log(`[Wallet Proxy] Request body:`, req.body);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "client-key": CLIENT_KEY,
        "client-pass": CLIENT_PASS,
      },
      body: JSON.stringify(req.body),
    });

    console.log(`[Wallet Proxy] Response status: ${response.status}`);

    // Get response text first to handle empty responses
    const responseText = await response.text();
    console.log(`[Wallet Proxy] Response body:`, responseText || '(empty)');

    // Try to parse JSON, handle empty responses
    let data;
    if (!responseText || responseText.trim() === '') {
      // Empty response - likely invalid credentials
      data = {
        statusCode: 401,
        success: false,
        messages: 'Invalid credentials or account not found. The test credentials in the Postman collection may be expired.',
        result_code: 'EMPTY_RESPONSE',
      };
      console.log(`[Wallet Proxy] Empty response from API - credentials may be invalid`);
      res.status(401).json(data);
    } else {
      try {
        data = JSON.parse(responseText);
        console.log(`[Wallet Proxy] Response data:`, data);
        // Forward the response to the client
        res.status(response.status).json(data);
      } catch (parseError) {
        console.error(`[Wallet Proxy] JSON parse error:`, parseError);
        res.status(500).json({
          statusCode: 500,
          success: false,
          messages: 'Invalid JSON response from Wallet API',
        });
      }
    }
  } catch (error: any) {
    console.error("[Wallet Proxy] Error:", error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      messages: "Proxy error: " + error.message,
    });
  }
});

export default router;
