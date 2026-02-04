/**
 * Wallet User Manager
 * Handles user creation and linking for wallet authentication
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  WALLET_USER_ID: 'wallet_user_id',
  WALLET_PHONE: 'wallet_phone_number',
};

/**
 * Get or create a user ID for wallet authentication
 * This ensures we always have a userId to store wallet sessions in the database
 */
export async function getOrCreateWalletUserId(phoneNumber: string): Promise<number | null> {
  try {
    // First check if we already have a cached user ID
    const cachedUserId = await AsyncStorage.getItem(STORAGE_KEYS.WALLET_USER_ID);
    if (cachedUserId) {
      console.log('✅ [WalletUserManager] Found cached user ID:', cachedUserId);
      return parseInt(cachedUserId, 10);
    }

    // Try to get user ID from backend API (check if wallet account is linked to OAuth account)
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
        
        console.log('✅ [WalletUserManager] Got/created user ID from backend:', data.userId);
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
 * Link wallet account to OAuth user
 * Call this after OAuth login to associate wallet with main user account
 */
export async function linkWalletToOAuthUser(oauthUserId: number, phoneNumber: string): Promise<boolean> {
  try {
    console.log('🔗 [WalletUserManager] Linking wallet to OAuth user...');
    
    const response = await fetch(`http://localhost:3000/api/wallet-user/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: oauthUserId,
        phoneNumber,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Cache the user ID
      await AsyncStorage.setItem(STORAGE_KEYS.WALLET_USER_ID, oauthUserId.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.WALLET_PHONE, phoneNumber);
      
      console.log('✅ [WalletUserManager] Wallet linked successfully');
      return true;
    } else {
      console.error('❌ [WalletUserManager] Failed to link wallet:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ [WalletUserManager] Link error:', error);
    return false;
  }
}

/**
 * Check if user has a linked wallet account
 */
export async function hasLinkedWallet(userId: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:3000/api/wallet-user/check/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data.success && data.hasWallet;
  } catch (error) {
    console.error('❌ [WalletUserManager] Check error:', error);
    return false;
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
