import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Supabase configuration - Read from expo-constants for runtime access
// Falls back to hardcoded values if not available in config
const SUPABASE_URL = 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  "https://ortjjekmexmyvkkotioo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydGpqZWttZXhteXZra290aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTkyODAsImV4cCI6MjA4NDY3NTI4MH0.__lyxX1wdkAkO7xUj5cBuc1x9ae_h-cggfVl_yXby6A";

// Log configuration on initialization (helps debug APK issues)
console.log('🔌 Supabase Client Initialized:');
console.log('URL:', SUPABASE_URL);
console.log('Has Anon Key:', !!SUPABASE_PUBLISHABLE_KEY, '(length:', SUPABASE_PUBLISHABLE_KEY?.length || 0, ')');
console.log('Platform:', Platform.OS);

/**
 * Chunked SecureStore adapter.
 * Expo SecureStore has a 2048-byte limit per key. Supabase session tokens
 * often exceed this. We split large values into 1800-byte chunks and store
 * them under keys like `key__chunk_0`, `key__chunk_1`, etc.
 * A metadata key `key__chunks` records the total chunk count.
 */
const CHUNK_SIZE = 1800;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      }
      // Check if value was stored in chunks
      const chunkCountStr = await SecureStore.getItemAsync(`${key}__chunks`);
      if (chunkCountStr) {
        const chunkCount = parseInt(chunkCountStr, 10);
        const chunks: string[] = [];
        for (let i = 0; i < chunkCount; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}__chunk_${i}`);
          if (chunk === null) return null;
          chunks.push(chunk);
        }
        return chunks.join("");
      }
      // Fallback: single key (legacy or small values)
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("SecureStore getItem error:", error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return;
      }
      if (value.length > CHUNK_SIZE) {
        // Split into chunks
        const chunks: string[] = [];
        for (let i = 0; i < value.length; i += CHUNK_SIZE) {
          chunks.push(value.slice(i, i + CHUNK_SIZE));
        }
        for (let i = 0; i < chunks.length; i++) {
          await SecureStore.setItemAsync(`${key}__chunk_${i}`, chunks[i]);
        }
        await SecureStore.setItemAsync(`${key}__chunks`, String(chunks.length));
        // Remove any old single-key entry
        await SecureStore.deleteItemAsync(key).catch(() => {});
      } else {
        await SecureStore.setItemAsync(key, value);
        // Clean up any old chunks
        await SecureStore.deleteItemAsync(`${key}__chunks`).catch(() => {});
      }
    } catch (error) {
      console.error("SecureStore setItem error:", error);
      // Don't throw — a failed session write should not crash the app
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return;
      }
      // Remove chunks if they exist
      const chunkCountStr = await SecureStore.getItemAsync(`${key}__chunks`);
      if (chunkCountStr) {
        const chunkCount = parseInt(chunkCountStr, 10);
        for (let i = 0; i < chunkCount; i++) {
          await SecureStore.deleteItemAsync(`${key}__chunk_${i}`).catch(() => {});
        }
        await SecureStore.deleteItemAsync(`${key}__chunks`).catch(() => {});
      }
      await SecureStore.deleteItemAsync(key).catch(() => {});
    } catch (error) {
      console.error("SecureStore removeItem error:", error);
    }
  },
};

/**
 * Supabase client configured for React Native with secure storage
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable for mobile
    flowType: 'pkce', // Use PKCE flow for better security
  },
  global: {
    headers: {
      'X-Client-Info': 'studentkonnect-mobile',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Helper function to safely get user with retry logic
 * Handles the "signal is aborted without reason" error
 */
export async function safeGetUser(retries = 3, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.warn(`Attempt ${i + 1}/${retries} - Auth error:`, error.message);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        throw error;
      }
      return { data, error: null };
    } catch (err: any) {
      // Handle abort errors specifically
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        console.warn(`Attempt ${i + 1}/${retries} - Request aborted, retrying...`);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
      }
      console.error('safeGetUser failed after retries:', err);
      return { data: { user: null }, error: err };
    }
  }
  return { data: { user: null }, error: new Error('Failed after retries') };
}

/**
 * Helper function to safely get session with retry logic
 */
export async function safeGetSession(retries = 3, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn(`Attempt ${i + 1}/${retries} - Session error:`, error.message);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        throw error;
      }
      return { data, error: null };
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        console.warn(`Attempt ${i + 1}/${retries} - Request aborted, retrying...`);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
      }
      console.error('safeGetSession failed after retries:', err);
      return { data: { session: null }, error: err };
    }
  }
  return { data: { session: null }, error: new Error('Failed after retries') };
}

// Database types (simplified - expand as needed)
export type Profile = {
  id: string;
  student_id: string;
  mobile_money_provider?: "mpesa" | "mtn_momo" | "airtel_money";
  full_name?: string;
  created_at: string;
  updated_at: string;
};

export type Wallet = {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  wallet_id: string;
  amount: number;
  type: "debit" | "credit";
  description: string;
  category?: string;
  recipient_id?: string;
  created_at: string;
};
