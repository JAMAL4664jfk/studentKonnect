/**
 * Wallet Session Client Service
 * Manages wallet authentication tokens via backend API
 * Stores tokens in Supabase PostgreSQL for persistent sessions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Configuration
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api'
  : 'http://localhost:3000/api'; // Update with your production URL

// Local storage keys for caching
const STORAGE_KEYS = {
  PHONE_NUMBER: 'wallet_phone_number',
  USER_ID: 'wallet_user_id',
  CUSTOMER_ID: 'wallet_customer_id',
};

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number; // seconds
  refreshTokenExpiresIn: number; // seconds
}

export interface WalletSession {
  phoneNumber: string;
  customerId: string | null;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  isAccessTokenExpired: boolean;
  isRefreshTokenExpired: boolean;
}

/**
 * Store wallet session in database
 */
export async function storeWalletSession(
  userId: number,
  phoneNumber: string,
  customerId: string | null,
  tokenData: TokenData
): Promise<boolean> {
  try {
    console.log('💾 [WalletSessionClient] Storing session in database...');
    
    const response = await fetch(`${API_BASE_URL}/wallet-session/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        phoneNumber,
        customerId,
        tokenData,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Cache phone number and user ID locally for quick access
      await AsyncStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, phoneNumber);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId.toString());
      if (customerId) {
        await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMER_ID, customerId);
      }
      
      console.log('✅ [WalletSessionClient] Session stored successfully');
      console.log('📊 Token expires in:', tokenData.accessTokenExpiresIn, 'seconds');
      return true;
    } else {
      console.error('❌ [WalletSessionClient] Failed to store session:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ [WalletSessionClient] Store error:', error);
    return false;
  }
}

/**
 * Get wallet session from database
 */
export async function getWalletSession(phoneNumber: string): Promise<WalletSession | null> {
  try {
    console.log('🔍 [WalletSessionClient] Fetching session from database...');
    
    const response = await fetch(`${API_BASE_URL}/wallet-session/${phoneNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success && data.session) {
      console.log('✅ [WalletSessionClient] Session retrieved successfully');
      return data.session;
    } else {
      console.log('ℹ️ [WalletSessionClient] No session found');
      return null;
    }
  } catch (error) {
    console.error('❌ [WalletSessionClient] Get error:', error);
    return null;
  }
}

/**
 * Update access token after refresh
 */
export async function updateAccessToken(
  phoneNumber: string,
  accessToken: string,
  accessTokenExpiresIn: number
): Promise<boolean> {
  try {
    console.log('🔄 [WalletSessionClient] Updating access token in database...');
    
    const response = await fetch(`${API_BASE_URL}/wallet-session/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        accessToken,
        accessTokenExpiresIn,
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ [WalletSessionClient] Access token updated successfully');
      return true;
    } else {
      console.error('❌ [WalletSessionClient] Failed to update token:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ [WalletSessionClient] Update error:', error);
    return false;
  }
}

/**
 * Logout - deactivate session
 */
export async function logoutWalletSession(phoneNumber: string): Promise<boolean> {
  try {
    console.log('🚪 [WalletSessionClient] Logging out...');
    
    const response = await fetch(`${API_BASE_URL}/wallet-session/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Clear local cache
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PHONE_NUMBER,
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.CUSTOMER_ID,
      ]);
      
      console.log('✅ [WalletSessionClient] Logged out successfully');
      return true;
    } else {
      console.error('❌ [WalletSessionClient] Logout failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ [WalletSessionClient] Logout error:', error);
    return false;
  }
}

/**
 * Get cached phone number from local storage
 */
export async function getCachedPhoneNumber(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.PHONE_NUMBER);
  } catch (error) {
    console.error('❌ [WalletSessionClient] Error getting cached phone:', error);
    return null;
  }
}

/**
 * Get cached user ID from local storage
 */
export async function getCachedUserId(): Promise<number | null> {
  try {
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    return userId ? parseInt(userId, 10) : null;
  } catch (error) {
    console.error('❌ [WalletSessionClient] Error getting cached user ID:', error);
    return null;
  }
}

/**
 * Get cached customer ID from local storage
 */
export async function getCachedCustomerId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMER_ID);
  } catch (error) {
    console.error('❌ [WalletSessionClient] Error getting cached customer ID:', error);
    return null;
  }
}

/**
 * Restore session on app startup
 * Returns session if valid, null if expired or not found
 */
export async function restoreSession(): Promise<WalletSession | null> {
  try {
    console.log('🔄 [WalletSessionClient] Attempting to restore session...');
    
    const phoneNumber = await getCachedPhoneNumber();
    if (!phoneNumber) {
      console.log('ℹ️ [WalletSessionClient] No cached phone number found');
      return null;
    }

    const session = await getWalletSession(phoneNumber);
    if (!session) {
      console.log('ℹ️ [WalletSessionClient] No active session in database');
      return null;
    }

    if (session.isRefreshTokenExpired) {
      console.log('⚠️ [WalletSessionClient] Refresh token expired, session invalid');
      return null;
    }

    console.log('✅ [WalletSessionClient] Session restored successfully');
    return session;
  } catch (error) {
    console.error('❌ [WalletSessionClient] Restore error:', error);
    return null;
  }
}
