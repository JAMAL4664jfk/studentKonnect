import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Get the correct API base URL based on the platform and environment
 */
export function getApiBaseUrl(): string {
  // Check if we're in development or production
  const isDevelopment = __DEV__;

  if (!isDevelopment) {
    // Production: Use your deployed API URL
    return process.env.EXPO_PUBLIC_API_URL || "https://your-api.com";
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
  createWallet: "/api/crypto/wallet/create",
  getWallet: (address: string) => `/api/crypto/wallet/${address}`,
  getBalance: (address: string) => `/api/crypto/wallet/${address}/balance`,
  
  // Transaction endpoints
  sendTransaction: "/api/crypto/transaction/send",
  swapTransaction: "/api/crypto/transaction/swap",
  getTransaction: (hash: string) => `/api/crypto/transaction/${hash}`,
  
  // Token endpoints
  getTokens: "/api/crypto/tokens",
  getTokenInfo: (address: string) => `/api/crypto/tokens/${address}/info`,
  
  // Swap endpoints
  getSwapQuote: "/api/crypto/swap/quote",
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

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
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
