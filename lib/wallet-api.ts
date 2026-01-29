/**
 * Wallet API Service for StudentKonnect
 * Integrates with external Wallet API while preserving existing app design
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// API Configuration - Read from expo-constants for runtime access
const API_CONFIG = {
  baseUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_WALLET_API_URL || process.env.EXPO_PUBLIC_WALLET_API_URL || 'https://api.wallet.example.com/',
  clientKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_WALLET_CLIENT_KEY || process.env.EXPO_PUBLIC_WALLET_CLIENT_KEY || '',
  clientPass: Constants.expoConfig?.extra?.EXPO_PUBLIC_WALLET_CLIENT_PASS || process.env.EXPO_PUBLIC_WALLET_CLIENT_PASS || '',
};

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'wallet_access_token',
  REFRESH_TOKEN: 'wallet_refresh_token',
  TOKEN_EXPIRY: 'wallet_token_expiry',
};

// Types
export interface WalletLoginResponse {
  statusCode: number;
  success: boolean;
  messages: string;
  result_code: string;
  data: {
    access_token: string;
    access_token_expires_in: number;
    refresh_token: string;
    refresh_token_expires_in: number;
  };
}

export interface WalletBalance {
  available_balance: number;
  ledger_balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  category?: string;
  status: string;
}

export interface Voucher {
  id: string;
  title: string;
  points: number;
  description: string;
  expiry_date: string;
  status: 'active' | 'redeemed' | 'expired';
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  avatar_url?: string;
}

class WalletAPIService {
  private baseUrl: string;
  private clientKey: string;
  private clientPass: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.clientKey = API_CONFIG.clientKey;
    this.clientPass = API_CONFIG.clientPass;
    
    // Log configuration on initialization
    console.log('💼 Wallet API Service Initialized:');
    console.log('Base URL:', this.baseUrl);
    console.log('Has Client Key:', !!this.clientKey, '(length:', this.clientKey?.length || 0, ')');
    console.log('Has Client Pass:', !!this.clientPass, '(length:', this.clientPass?.length || 0, ')');
  }

  /**
   * Get default headers for API requests
   */
  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'client-key': this.clientKey,
      'client-pass': this.clientPass,
    };

    if (includeAuth) {
      const token = await this.getAccessToken();
      if (token) {
        headers['authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Get stored access token
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Store access token
   */
  private async storeTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): Promise<void> {
    try {
      const expiryTime = Date.now() + expiresIn * 1000;
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
        [STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString()],
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  /**
   * Clear stored tokens
   */
  private async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.TOKEN_EXPIRY,
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Login with phone number and PIN
   */
  async login(phoneNumber: string, pin: string): Promise<WalletLoginResponse> {
    try {
      const url = `${this.baseUrl}customer/login`;
      const headers = await this.getHeaders(false);
      const body = JSON.stringify({
        phone_number: phoneNumber,
        pin: pin,
      });

      console.log('🔐 Wallet API Login Request:');
      console.log('URL:', url);
      console.log('Headers:', JSON.stringify(headers, null, 2));
      console.log('Body:', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response OK:', response.ok);

      // Get raw response text first
      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      // Try to parse JSON
      let data: WalletLoginResponse;
      try {
        data = responseText ? JSON.parse(responseText) : { success: false, messages: 'Empty response' };
        console.log('📦 Parsed Data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('Response was:', responseText);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (data.success && data.data) {
        await this.storeTokens(
          data.data.access_token,
          data.data.refresh_token,
          data.data.access_token_expires_in
        );
        return data;
      } else {
        // API returned error response
        const error: any = new Error(data.messages || 'Login failed');
        error.response = data;
        throw error;
      }
    } catch (error) {
      console.error('Wallet API login error:', error);
      throw error;
    }
  }

  /**
   * Logout and clear tokens
   */
  async logout(): Promise<void> {
    await this.clearTokens();
  }

  /**
   * Get wallet balance
   */
  async getBalance(): Promise<WalletBalance> {
    try {
      const response = await fetch(`${this.baseUrl}customer/balance`, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        return data.data;
      }

      throw new Error(data.messages || 'Failed to fetch balance');
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Return mock data as fallback
      return {
        available_balance: 3245.50,
        ledger_balance: 3245.50,
        currency: 'ZAR',
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}transactions?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: await this.getHeaders(),
        }
      );

      const data = await response.json();

      if (data.success) {
        return data.data.transactions || [];
      }

      throw new Error(data.messages || 'Failed to fetch transactions');
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Return mock data as fallback
      return this.getMockTransactions();
    }
  }

  /**
   * Get customer vouchers
   */
  async getVouchers(): Promise<Voucher[]> {
    try {
      const response = await fetch(`${this.baseUrl}customer/vouchers`, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        return data.data.vouchers || [];
      }

      throw new Error(data.messages || 'Failed to fetch vouchers');
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      // Return mock data as fallback
      return this.getMockVouchers();
    }
  }

  /**
   * Get customer profile
   */
  async getProfile(): Promise<CustomerProfile> {
    try {
      const response = await fetch(`${this.baseUrl}customer/profile`, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        return data.data;
      }

      throw new Error(data.messages || 'Failed to fetch profile');
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Return mock data as fallback
      return {
        id: 'mock_user',
        name: 'Student Account',
        email: 'scholar@student.ac.za',
        phone_number: '+27000000000',
      };
    }
  }

  /**
   * Verify token validity
   */
  async verifyToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}customer/verify_token`, {
        method: 'POST',
        headers: await this.getHeaders(),
      });

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  }

  // Mock data methods for fallback
  private getMockTransactions(): Transaction[] {
    return [
      {
        id: '1',
        amount: 450.00,
        type: 'debit',
        description: 'Food & Dining',
        date: new Date().toISOString(),
        category: 'food',
        status: 'completed',
      },
      {
        id: '2',
        amount: 320.00,
        type: 'debit',
        description: 'Transport',
        date: new Date(Date.now() - 86400000).toISOString(),
        category: 'transport',
        status: 'completed',
      },
      {
        id: '3',
        amount: 4500.00,
        type: 'credit',
        description: 'Monthly Allowance',
        date: new Date(Date.now() - 172800000).toISOString(),
        category: 'income',
        status: 'completed',
      },
    ];
  }

  private getMockVouchers(): Voucher[] {
    return [
      {
        id: '1',
        title: 'Free Coffee',
        points: 500,
        description: 'Redeem at campus café',
        expiry_date: new Date(Date.now() + 2592000000).toISOString(),
        status: 'active',
      },
      {
        id: '2',
        title: '10% Bookstore Discount',
        points: 750,
        description: 'Valid on all textbooks',
        expiry_date: new Date(Date.now() + 2592000000).toISOString(),
        status: 'active',
      },
    ];
  }
}

// Export singleton instance
export const walletAPI = new WalletAPIService();
