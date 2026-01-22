import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Supabase configuration from web app
const SUPABASE_URL = "https://yrvirnjhzjuajmpnhefz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmlybmpoemp1YWptcG5oZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2ODcyMDIsImV4cCI6MjA3ODI2MzIwMn0.sJ8KzMvW9mBFLgur4ZWRwDxIGITpAahqaiOeObTtOZ0";

/**
 * Custom storage adapter using expo-secure-store for secure session persistence
 * Falls back to memory storage on web platform
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === "web") {
      // On web, use localStorage if available
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
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
  },
});

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
