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
 * Custom storage adapter using expo-secure-store for secure session persistence
 * Falls back to memory storage on web platform
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      if (Platform.OS === "web") {
        // On web, use localStorage if available
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      }
      const result = await SecureStore.getItemAsync(key);
      return result;
    } catch (error) {
      console.error("SecureStore getItem error:", error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("SecureStore setItem error:", error);
      throw error;
    }
  },
  removeItem: async (key: string) => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return;
      }
      await SecureStore.deleteItemAsync(key);
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
