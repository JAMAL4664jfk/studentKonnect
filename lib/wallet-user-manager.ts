/**
 * Wallet User Manager
 * Handles user creation for wallet authentication (INDEPENDENT from OAuth)
 * Wallet login and app login are completely separate systems
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  WALLET_USER_ID: 'wallet_user_id',
  WALLET_PHONE: 'wallet_phone_number',
};

/**
 * Get or create a user ID for wallet authentication
 * Creates a standalone wallet user (NOT linked to OAuth)
 */
export async function getOrCreateWalletUserId(phoneNumber: string): Promise<number | null> {
  try {
    // First check if we already have a cached user ID for this phone
    const cachedUserId = await AsyncStorage.getItem(STORAGE_KEYS.WALLET_USER_ID);
    const cachedPhone = await AsyncStorage.getItem(STORAGE_KEYS.WALLET_PHONE);
    
    // If cached userId exists and matches the phone number, use it
    if (cachedUserId && cachedPhone === phoneNumber) {
      console.log('✅ [WalletUserManager] Found cached user ID:', cachedUserId);
      return parseInt(cachedUserId, 10);
    }

    // Try to get or create user from backend API
    try {
      const response = await fetch(`http://localhost:3000/api/wallet-user/get-or-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success && data.userId) {
        // Cache the user ID for future use
        await AsyncStorage.setItem(STORAGE_KEYS.WALLET_USER_ID, data.userId.toString());
        await AsyncStorage.setItem(STORAGE_KEYS.WALLET_PHONE, phoneNumber);
        
        console.log('✅ [WalletUserManager] Got/created wallet user ID:', data.userId);
        return data.userId;
      }
    } catch (apiError) {
      console.warn('⚠️ [WalletUserManager] Backend API unavailable, using fallback');
    }

    // Fallback: Return null and let the system use AsyncStorage only
    console.log('ℹ️ [WalletUserManager] No user ID available, will use AsyncStorage fallback');
    return null;
  } catch (error) {
    console.error('❌ [WalletUserManager] Error getting user ID:', error);
    return null;
  }
}

/**
 * Clear cached wallet user data (on logout)
 */
export async function clearWalletUserCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.WALLET_USER_ID,
      STORAGE_KEYS.WALLET_PHONE,
    ]);
    console.log('✅ [WalletUserManager] Cleared wallet user cache');
  } catch (error) {
    console.error('❌ [WalletUserManager] Clear cache error:', error);
  }
}
