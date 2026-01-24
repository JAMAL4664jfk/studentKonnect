/**
 * Debug Logger
 * Logs messages both to console and shows them as toasts for debugging
 */

import Toast from "react-native-toast-message";

type LogLevel = "info" | "success" | "error" | "warn";

export class DebugLogger {
  private static enabled = __DEV__; // Only in development

  static log(message: string, level: LogLevel = "info", showToast = false) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;

    // Always log to console
    switch (level) {
      case "error":
        console.error(logMessage);
        break;
      case "warn":
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
    }

    // Show toast if requested and in dev mode
    if (this.enabled && showToast) {
      Toast.show({
        type: level === "error" ? "error" : level === "warn" ? "info" : level,
        text1: level.toUpperCase(),
        text2: message,
        visibilityTime: 2000,
      });
    }
  }

  static info(message: string, showToast = false) {
    this.log(message, "info", showToast);
  }

  static success(message: string, showToast = true) {
    this.log(message, "success", showToast);
  }

  static error(message: string, error?: any, showToast = true) {
    const errorMessage = error ? `${message}: ${error.message || JSON.stringify(error)}` : message;
    this.log(errorMessage, "error", showToast);
  }

  static warn(message: string, showToast = false) {
    this.log(message, "warn", showToast);
  }

  static async testSupabaseConnection() {
    try {
      const { supabase } = await import("./supabase");
      
      this.info("[TEST] Testing Supabase connection...", true);
      
      // Test 1: Check accommodations table
      const { data: accData, error: accError } = await supabase
        .from("accommodations")
        .select("count")
        .limit(1);
      
      if (accError) {
        this.error("[TEST] Accommodations table failed", accError, true);
        return false;
      }
      
      this.success("[TEST] Accommodations table OK", true);
      
      // Test 2: Check marketplace table
      const { data: mktData, error: mktError } = await supabase
        .from("marketplaceItems")
        .select("count")
        .limit(1);
      
      if (mktError) {
        this.error("[TEST] Marketplace table failed", mktError, true);
        return false;
      }
      
      this.success("[TEST] Marketplace table OK", true);
      
      // Test 3: Fetch actual data
      const { data: accItems, error: accFetchError } = await supabase
        .from("accommodations")
        .select("*")
        .limit(5);
      
      if (accFetchError) {
        this.error("[TEST] Failed to fetch accommodations", accFetchError, true);
        return false;
      }
      
      this.success(`[TEST] Found ${accItems?.length || 0} accommodations`, true);
      
      const { data: mktItems, error: mktFetchError } = await supabase
        .from("marketplaceItems")
        .select("*")
        .limit(5);
      
      if (mktFetchError) {
        this.error("[TEST] Failed to fetch marketplace items", mktFetchError, true);
        return false;
      }
      
      this.success(`[TEST] Found ${mktItems?.length || 0} marketplace items`, true);
      
      this.success("[TEST] All connection tests passed! ✅", true);
      return true;
      
    } catch (error: any) {
      this.error("[TEST] Connection test failed", error, true);
      return false;
    }
  }
}

// Export singleton instance
export const logger = DebugLogger;
