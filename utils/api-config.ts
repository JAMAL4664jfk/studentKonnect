import { Platform } from "react-native";
import Constants from "expo-constants";

// Try to load tunnel URL if available
let tunnelUrl: string | null = null;
try {
  const tunnelInfo = require("../.tunnel-url.json");
  tunnelUrl = tunnelInfo.url;
  console.log("🌐 Using ngrok tunnel:", tunnelUrl);
} catch {
  // No tunnel URL available, will use platform-specific URLs
}

/**
 * Get the correct API base URL based on the platform and environment
 */
export function getApiBaseUrl(): string {
  // Use Supabase Edge Functions (hardcoded from lib/supabase.ts)
  const supabaseUrl = "https://ortjjekmexmyvkkotioo.supabase.co";
  return `${supabaseUrl}/functions/v1`;

  // Check if we're in development or production
  const isDevelopment = __DEV__;

  if (!isDevelopment) {
    // Production: Use your deployed API URL
    return process.env.EXPO_PUBLIC_API_URL || "https://your-api.com";
  }

  // Development: Check if ngrok tunnel is available (best for React Native)
  if (tunnelUrl && Platform.OS !== "web") {
    return tunnelUrl;
  }

  // Development: Platform-specific URLs
  if (Platform.OS === "web") {
    // Web: Can use localhost directly
    return "http://localhost:3000";
  }

  if (Platform.OS === "android") {
    // Android emulator: Use 10.0.2.2 to access host machine's localhost
    // Physical Android device: Use your computer's IP address
    const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
    
    if (debuggerHost) {
      // If we can get the host from Expo, use it (works for physical devices)
      return `http://${debuggerHost}:3000`;
    }
    
    // Fallback to Android emulator address
    return "http://10.0.2.2:3000";
  }

  if (Platform.OS === "ios") {
    // iOS simulator: Can use localhost
    // Physical iOS device: Use your computer's IP address
    const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
    
    if (debuggerHost && debuggerHost !== "localhost") {
      // If we can get the host from Expo and it's not localhost (physical device)
      return `http://${debuggerHost}:3000`;
    }
    
    // iOS simulator can use localhost
    return "http://localhost:3000";
  }

  // Default fallback
  return "http://localhost:3000";
}

/**
 * Get the blockchain RPC URL
 */
export function getRpcUrl(): string {
  const isDevelopment = __DEV__;

  if (!isDevelopment) {
    return process.env.EXPO_PUBLIC_RPC_URL || "https://your-rpc.com";
  }

  // For development, use the same logic as API URL
  if (Platform.OS === "web") {
    return "http://localhost:8545";
  }

  if (Platform.OS === "android") {
    const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
    if (debuggerHost) {
      return `http://${debuggerHost}:8545`;
    }
    return "http://10.0.2.2:8545";
  }

  if (Platform.OS === "ios") {
    const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
    if (debuggerHost && debuggerHost !== "localhost") {
      return `http://${debuggerHost}:8545`;
    }
    return "http://localhost:8545";
  }

  return "http://localhost:8545";
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Wallet endpoints
  createWallet: "/create-wallet",
  getWallet: (address: string) => `/get-wallet?address=${address}`,
  getBalance: (address: string) => `/get-balance?address=${address}`,
  
  // Transaction endpoints
  sendTransaction: "/send-token",
  swapTransaction: "/swap-token",
  getTransaction: (hash: string) => `/get-transaction?hash=${hash}`,
  
  // Token endpoints
  getTokens: "/get-tokens",
  getTokenInfo: (address: string) => `/get-token-info?address=${address}`,
  
  // Swap endpoints
  getSwapQuote: "/get-swap-quote",
};

/**
 * Make an API request with automatic URL handling
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  // Add Supabase auth headers (hardcoded from lib/supabase.ts)
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydGpqZWttZXhteXZra290aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NTU4ODUsImV4cCI6MjA1MzEzMTg4NX0.ytzxsuI-LIsxPRGVO5m7tg_76A4dGmb";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": supabaseKey,
    ...options?.headers as Record<string, string>,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    // Provide more helpful error messages
    if (error.message === "Network request failed") {
      throw new Error(
        `Cannot connect to server at ${baseUrl}. ` +
        `Make sure the backend server is running with 'pnpm dev'.`
      );
    }
    throw error;
  }
}
