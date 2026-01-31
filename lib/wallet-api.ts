/**
 * Wallet API Service for StudentKonnect
 * Integrates with external Wallet API while preserving existing app design
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// API Configuration - Read from expo-constants for runtime access
// Updated with correct Payelio QA environment URL
const API_CONFIG = {
  baseUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_WALLET_API_URL || process.env.EXPO_PUBLIC_WALLET_API_URL || 'https://apin.payelio.com/v3/qa/',
  clientKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_WALLET_CLIENT_KEY || process.env.EXPO_PUBLIC_WALLET_CLIENT_KEY || '1ecd3691-75c0-4b5f-9d43-0d434ac91443',
  clientPass: Constants.expoConfig?.extra?.EXPO_PUBLIC_WALLET_CLIENT_PASS || process.env.EXPO_PUBLIC_WALLET_CLIENT_PASS || 'i9lyOcSX0GjK6MPEoWsbzwt1dLu5V3DA',
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

export interface WalletRegistrationRequest {
  id_number: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  privacy: boolean;
  gtc: boolean;
  registration_step: string;
  registration_type: string;
  referrer_id?: string;
}

export interface WalletRegistrationResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  messages: string;
  result_code: string;
  data: {
    first_name: string;
    last_name: string;
    middle_name: string;
    version: string;
    registration_step: string;
    otp_verified: number;
  };
}

export interface VerifyMobileRequest {
  phone_number: string;
}

export interface VerifyMobileResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  messages: string;
  result_code: string;
  data?: {
    customerId: string;
    first_name: string;
    last_name: string;
  };
}

export interface CheckCustomerRequest {
  id_number: string;
  phone_number: string;
}

export interface CheckCustomerResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  messages: string;
  result_code: string;
  data?: any;
}

export interface VerifyCustomerResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  messages: string;
  result_code: string;
  data: {
    id: string;
    customerId: string;
    first_name: string;
    last_name: string;
    email: string | null;
    identity_number: string;
    msisdn: string;
    industry: string | null;
    occupation: string | null;
    occupation_other: string | null;
    source_of_funds: string | null;
    dateOfBirth: string;
    gender: string;
    date_created: string;
    registration_type: string;
    wallet_type: string;
    account_number: string;
  };
}

export interface CreatePinRequest {
  customer_id: string;
  pin: string;
}

export interface CreatePinResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  messages: string;
  result_code: string;
}

export interface AddAddressRequest {
  customer_id: string;
  addressType: string; // "PHYSICAL" or "POSTAL"
  city: string;
  code: string; // Postal code
  state: string; // Province
  country: string; // Country code (e.g., "ZA")
  line1: string; // Street address line 1
  line2?: string; // Street address line 2 (optional)
}

export interface AddAddressResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  messages: string;
  result_code: string;
}

export interface UploadDocumentRequest {
  customer_id: string;
  image_type: string; // "FACIAL_PHOTO", "ID_DOCUMENT", etc.
  identity_type: string; // "SELFIE", "ID_CARD", "PASSPORT", etc.
  side: string; // "FRONT", "BACK"
  image: string; // Base64 encoded image
}

export interface UploadDocumentResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  messages: string;
  result_code: string;
}

export interface AddAdditionalInfoRequest {
  customer_id: string;
  industry: string; // Industry code
  occupation: string; // Occupation code
  occupation_other?: string; // Required if occupation is "OTHER"
  source_of_funds: string; // Source of funds code
}

export interface AddAdditionalInfoResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  messages: string;
  result_code: string;
}

export interface VerifyIDResponse {
  FirstName: string;
  LastName: string;
  SmartCardIssued: boolean;
  IDIssueDate: string;
  IDSequenceNo: string;
  DeadIndicator: boolean;
  IDBlocked: boolean;
  DateOfDeath: string | null;
  MaritalStatus: string;
  DateOfMarriage: string;
  OnHANIS: boolean;
  OnNPR: boolean;
  BirthPlaceCountryCode: string;
  FacialImageAvailable: boolean;
  SAFPSListedFraudster: string | null;
  SAFPSListedVictim: string | null;
  SAFPSProtectiveRegistration: string | null;
  TrackingNumber: string;
  CachedResult: boolean;
  CacheDate: string | null;
  CRef: string;
  Status: string;
  Message: string;
}

export interface WalletInfoResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  messages: string;
  result_code: string;
  data: {
    wallet_id: string;
    customer_id: string;
    account_number: string;
    wallet_type: string;
    status: string;
    available_balance: number;
    ledger_balance: number;
    currency: string;
    created_at: string;
    updated_at: string;
  };
}

export interface BalanceResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  messages: string;
  result_code: string;
  data: {
    available_balance: number;
    ledger_balance: number;
    currency: string;
  };
}

export interface AddAccountRequest {
  customer_id: string;
  account_type: string; // "BANK", "CARD", etc.
  account_number: string;
  bank_name?: string;
  branch_code?: string;
  account_holder_name?: string;
}

export interface AddAccountResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  messages: string;
  result_code: string;
  data?: {
    account_id: string;
    status: string;
  };
}

export interface WalletBalance {
  available_balance: number;
  ledger_balance: number;
  currency: string;
}

export interface CustomerProfileData {
  account_number: string;
  customer_id: string;
  date_created: string;
  email: string | null;
  first_name: string;
  last_name: string;
  identity_number: string;
  msisdn: string;
  status: string;
  customer_image: string | null;
  wl_name: string;
  loyalty: any | null;
  linked_accounts: any | null;
  registration_type: string;
  wallet_id: string;
  wallet_acc_number: string;
  fica_documents: string[];
  device_info: boolean;
  industry: string | null;
  occupation: string | null;
  occupation_other: string | null;
  source_of_funds: string | null;
  dateOfBirth: string;
  gender: string;
}

export interface CustomerProfileResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  result_code: string;
  data: CustomerProfileData;
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

export interface TransactionsResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  messages: string;
  result_code: string;
  data: {
    transactions: Transaction[];
    pagination: {
      total_records: number;
      total_pages: number;
      current_page: number;
      limit: number;
    };
  };
}

export interface SubscriptionResponse {
  endpoint: string;
  statusCode: number;
  environment: string;
  success: boolean;
  messages: string;
  result_code: string;
  data: {
    subscription_id: string;
    status: string;
    total_amount: string;
  };
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
    console.log('Platform:', Platform.OS);
    console.log('Base URL:', this.baseUrl);
    console.log('Has Client Key:', !!this.clientKey, '(length:', this.clientKey?.length || 0, ')');
    console.log('Has Client Pass:', !!this.clientPass, '(length:', this.clientPass?.length || 0, ')');
    console.log('Config Source:', Constants.expoConfig?.extra?.EXPO_PUBLIC_WALLET_API_URL ? 'expo-constants' : process.env.EXPO_PUBLIC_WALLET_API_URL ? 'process.env' : 'fallback');
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
   * Get API URL - use proxy on web to bypass CORS
   */
  private getApiUrl(endpoint: string): string {
    let url: string;
    if (Platform.OS === 'web') {
      // Use backend proxy on web to bypass CORS
      url = `http://localhost:3000/api/wallet-proxy/${endpoint}`;
    } else {
      // Direct API call on native platforms (APK/iOS)
      url = `${this.baseUrl}${endpoint}`;
    }
    console.log(`🌐 API URL for ${endpoint}:`, url);
    return url;
  }

  /**
   * Login with phone number and PIN
   */
  async login(phoneNumber: string, pin: string): Promise<WalletLoginResponse> {
    try {
      const url = this.getApiUrl('customer/login');
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
    } catch (error: any) {
      console.error('❌ Wallet API login error:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      
      // Enhanced error handling for network issues
      if (error.message && error.message.includes('Network request failed')) {
        const networkError: any = new Error('Network connection failed. Please check your internet connection and try again.');
        networkError.response = { success: false, messages: 'Network error', result_code: 'NETWORK_ERROR' };
        throw networkError;
      }
      
      if (error.message && error.message.includes('fetch')) {
        const fetchError: any = new Error('Unable to connect to wallet service. Please check your internet connection.');
        fetchError.response = { success: false, messages: 'Connection error', result_code: 'CONNECTION_ERROR' };
        throw fetchError;
      }
      
      throw error;
    }
  }

  /**
   * Check if access token is still valid
   */
  async checkToken(): Promise<any> {
    try {
      const url = this.getApiUrl('auth/checkToken');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('🔑 Wallet API Check Token Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({}),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = JSON.parse(responseText);
      console.log('📦 Parsed Data:', data);

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API check token error:', error);
      throw error;
    }
  }

  /**
   * Register/update customer device information
   */
  async registerCustomerDevice(
    customerId: string,
    deviceData: any,
    otpToken: string
  ): Promise<any> {
    try {
      const url = this.getApiUrl('customer/customer_device');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('📱 Wallet API Register Device Request:');
      console.log('URL:', url);
      console.log('Customer ID:', customerId);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          customer_id: customerId,
          device_data: deviceData,
          otp_token: otpToken,
        }),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = JSON.parse(responseText);
      console.log('📦 Parsed Data:', data);

      if (data.statusCode !== 200 && !data.success) {
        throw new Error(data.messages || 'Failed to register device');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API register device error:', error);
      throw error;
    }
  }

  /**
   * Register a new customer
   */
  async register(registrationData: WalletRegistrationRequest): Promise<WalletRegistrationResponse> {
    try {
      const url = this.getApiUrl('customer/register');
      const headers = await this.getHeaders(false);
      const body = JSON.stringify(registrationData);

      console.log('📝 Wallet API Registration Request:');
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
      let data: WalletRegistrationResponse;
      try {
        data = responseText ? JSON.parse(responseText) : { 
          success: false, 
          messages: 'Empty response',
          statusCode: response.status,
          endpoint: '',
          environment: '',
          result_code: 'ERROR',
          data: {
            first_name: '',
            last_name: '',
            middle_name: '',
            version: '',
            registration_step: '',
            otp_verified: 0
          }
        };
        console.log('📦 Parsed Data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('Response was:', responseText);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (data.success) {
        return data;
      } else {
        // API returned error response
        const error: any = new Error(data.messages || 'Registration failed');
        error.response = data;
        throw error;
      }
    } catch (error: any) {
      console.error('❌ Wallet API registration error:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      
      // Enhanced error handling for network issues
      if (error.message && error.message.includes('Network request failed')) {
        const networkError: any = new Error('Network connection failed. Please check your internet connection and try again.');
        networkError.response = { success: false, messages: 'Network error', result_code: 'NETWORK_ERROR' };
        throw networkError;
      }
      
      if (error.message && error.message.includes('fetch')) {
        const fetchError: any = new Error('Unable to connect to wallet service. Please check your internet connection.');
        fetchError.response = { success: false, messages: 'Connection error', result_code: 'CONNECTION_ERROR' };
        throw fetchError;
      }
      
      throw error;
    }
  }

  /**
   * Verify mobile phone number
   * Checks if customer exists and if they have a PIN set
   */
  async verifyMobile(phoneNumber: string): Promise<VerifyMobileResponse> {
    try {
      const url = this.getApiUrl('customer/verify_mobile');
      const headers = await this.getHeaders(false);
      const body = JSON.stringify({ phone_number: phoneNumber });

      console.log('📱 Wallet API Verify Mobile Request:');
      console.log('URL:', url);
      console.log('Body:', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      let data: VerifyMobileResponse;
      try {
        data = responseText ? JSON.parse(responseText) : {
          success: false,
          messages: 'Empty response',
          statusCode: response.status,
          endpoint: '',
          environment: '',
          result_code: 'ERROR'
        };
        console.log('📦 Parsed Data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      // Return data even if success is false - the result_code tells us what to do next
      return data;
    } catch (error: any) {
      console.error('❌ Wallet API verify mobile error:', error);
      throw error;
    }
  }

  /**
   * Check if customer exists with given ID and phone number
   */
  async checkCustomer(idNumber: string, phoneNumber: string): Promise<CheckCustomerResponse> {
    try {
      const url = this.getApiUrl('customer/check_customer');
      const headers = await this.getHeaders(false);
      const body = JSON.stringify({
        id_number: idNumber,
        phone_number: phoneNumber
      });

      console.log('🔍 Wallet API Check Customer Request:');
      console.log('URL:', url);
      console.log('Body:', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      let data: CheckCustomerResponse;
      try {
        data = responseText ? JSON.parse(responseText) : {
          success: false,
          messages: 'Empty response',
          statusCode: response.status,
          endpoint: '',
          environment: '',
          result_code: 'ERROR'
        };
        console.log('📦 Parsed Data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API check customer error:', error);
      throw error;
    }
  }

  /**
   * Verify customer and get full profile details
   * Uses GET request with customer_id query parameter
   */
  async verifyCustomer(customerId: string): Promise<VerifyCustomerResponse> {
    try {
      // Note: This is a GET request, not POST
      const url = this.getApiUrl(`customer/verify?customer_id=${customerId}`);
      const headers = await this.getHeaders(false);

      console.log('✅ Wallet API Verify Customer Request:');
      console.log('URL:', url);
      console.log('Method: GET');

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      let data: VerifyCustomerResponse;
      try {
        data = responseText ? JSON.parse(responseText) : {
          success: false,
          messages: 'Empty response',
          statusCode: response.status,
          endpoint: '',
          environment: '',
          result_code: 'ERROR',
          data: {
            id: '',
            customerId: '',
            first_name: '',
            last_name: '',
            email: null,
            identity_number: '',
            msisdn: '',
            industry: null,
            occupation: null,
            occupation_other: null,
            source_of_funds: null,
            dateOfBirth: '',
            gender: '',
            date_created: '',
            registration_type: '',
            wallet_type: '',
            account_number: ''
          }
        };
        console.log('📦 Parsed Data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (data.success) {
        return data;
      } else {
        const error: any = new Error(data.messages || 'Customer verification failed');
        error.response = data;
        throw error;
      }
    } catch (error: any) {
      console.error('❌ Wallet API verify customer error:', error);
      throw error;
    }
  }

  /**
   * Create PIN for customer account
   * Uses POST request with security_type=PIN query parameter
   */
  async createPin(customerId: string, pin: string): Promise<CreatePinResponse> {
    try {
      const url = this.getApiUrl('customer/account_security?security_type=PIN');
      const headers = await this.getHeaders(false);
      const body = JSON.stringify({
        customer_id: customerId,
        pin: pin
      });

      console.log('🔐 Wallet API Create PIN Request:');
      console.log('URL:', url);
      console.log('Body:', JSON.stringify({ customer_id: customerId, pin: '****' })); // Hide PIN in logs

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      let data: CreatePinResponse;
      try {
        data = responseText ? JSON.parse(responseText) : {
          success: false,
          messages: 'Empty response',
          statusCode: response.status,
          endpoint: '',
          environment: '',
          result_code: 'ERROR'
        };
        console.log('📦 Parsed Data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (data.success) {
        return data;
      } else {
        const error: any = new Error(data.messages || 'PIN creation failed');
        error.response = data;
        throw error;
      }
    } catch (error: any) {
      console.error('❌ Wallet API create PIN error:', error);
      throw error;
    }
  }

  /**
   * Add customer address
   */
  async addAddress(addressData: AddAddressRequest): Promise<AddAddressResponse> {
    try {
      const url = this.getApiUrl('customer/add_address');
      const headers = await this.getHeaders(false);
      const body = JSON.stringify(addressData);

      console.log('🏠 Wallet API Add Address Request:');
      console.log('URL:', url);
      console.log('Body:', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      let data: AddAddressResponse;
      try {
        data = responseText ? JSON.parse(responseText) : {
          success: false,
          messages: 'Empty response',
          statusCode: response.status,
          endpoint: '',
          environment: '',
          result_code: '0',
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid response format from server');
      }

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to add address');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API add address error:', error);
      throw error;
    }
  }

  /**
   * Upload customer document (selfie, ID, etc.)
   */
  async uploadDocument(documentData: UploadDocumentRequest): Promise<UploadDocumentResponse> {
    try {
      const url = this.getApiUrl('customer/documents');
      const headers = await this.getHeaders(false);
      const body = JSON.stringify(documentData);

      console.log('📷 Wallet API Upload Document Request:');
      console.log('URL:', url);
      console.log('Document Type:', documentData.image_type);
      console.log('Identity Type:', documentData.identity_type);
      console.log('Image Length:', documentData.image.length, 'characters');

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      let data: UploadDocumentResponse;
      try {
        data = responseText ? JSON.parse(responseText) : {
          success: false,
          messages: 'Empty response',
          statusCode: response.status,
          endpoint: '',
          environment: '',
          result_code: '0',
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid response format from server');
      }

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to upload document');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API upload document error:', error);
      throw error;
    }
  }

  /**
   * Add additional customer information (industry, occupation, source of funds)
   */
  async addAdditionalInfo(infoData: AddAdditionalInfoRequest): Promise<AddAdditionalInfoResponse> {
    try {
      const url = this.getApiUrl('customer/add_additional');
      const headers = await this.getHeaders(false);
      const body = JSON.stringify(infoData);

      console.log('📝 Wallet API Add Additional Info Request:');
      console.log('URL:', url);
      console.log('Industry:', infoData.industry);
      console.log('Occupation:', infoData.occupation);
      console.log('Source of Funds:', infoData.source_of_funds);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      let data: AddAdditionalInfoResponse;
      try {
        data = responseText ? JSON.parse(responseText) : {
          success: false,
          messages: 'Empty response',
          statusCode: response.status,
          endpoint: '',
          environment: '',
          result_code: '0',
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid response format from server');
      }

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to add additional information');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API add additional info error:', error);
      throw error;
    }
  }

  /**
   * Verify customer ID for KYC compliance
   */
  async verifyID(idNumber: string): Promise<VerifyIDResponse> {
    try {
      const url = this.getApiUrl(`customer/verify_id?id=${idNumber}`);
      const headers = await this.getHeaders(false);

      console.log('🔍 Wallet API Verify ID Request:');
      console.log('URL:', url);
      console.log('ID Number:', idNumber);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      let data: VerifyIDResponse;
      try {
        data = responseText ? JSON.parse(responseText) : {
          Status: 'Failed',
          Message: 'Empty response from server',
          FirstName: '',
          LastName: '',
          SmartCardIssued: false,
          IDIssueDate: '',
          IDSequenceNo: '',
          DeadIndicator: false,
          IDBlocked: false,
          DateOfDeath: null,
          MaritalStatus: '',
          DateOfMarriage: '',
          OnHANIS: false,
          OnNPR: false,
          BirthPlaceCountryCode: '',
          FacialImageAvailable: false,
          SAFPSListedFraudster: null,
          SAFPSListedVictim: null,
          SAFPSProtectiveRegistration: null,
          TrackingNumber: '',
          CachedResult: false,
          CacheDate: null,
          CRef: '',
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid response format from server');
      }

      console.log('📦 Parsed Data:', data);

      if (data.Status !== 'Success') {
        throw new Error(data.Message || 'ID verification failed');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API verify ID error:', error);
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
   * Get wallet information
   */
  async getWalletInfo(): Promise<WalletInfoResponse> {
    try {
      const url = this.getApiUrl('customer/wallet_info');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('💼 Wallet API Get Wallet Info Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data: WalletInfoResponse = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
        data: {
          wallet_id: '',
          customer_id: '',
          account_number: '',
          wallet_type: '',
          status: '',
          available_balance: 0,
          ledger_balance: 0,
          currency: 'ZAR',
          created_at: '',
          updated_at: '',
        },
      };

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to fetch wallet info');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get wallet info error:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(): Promise<BalanceResponse> {
    try {
      const url = this.getApiUrl('customer/balance');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('💰 Wallet API Get Balance Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data: BalanceResponse = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
        data: {
          available_balance: 0,
          ledger_balance: 0,
          currency: 'ZAR',
        },
      };

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to fetch balance');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get balance error:', error);
      throw error;
    }
  }

  /**
   * Add bank account or payment method
   */
  async addAccount(accountData: AddAccountRequest): Promise<AddAccountResponse> {
    try {
      const url = this.getApiUrl('customer/add_account');
      const headers = await this.getHeaders(true); // Requires auth token
      const body = JSON.stringify(accountData);

      console.log('🏦 Wallet API Add Account Request:');
      console.log('URL:', url);
      console.log('Account Type:', accountData.account_type);
      console.log('Account Number:', accountData.account_number);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      let data: AddAccountResponse;
      try {
        data = responseText ? JSON.parse(responseText) : {
          success: false,
          messages: 'Empty response',
          statusCode: response.status,
          endpoint: '',
          environment: '',
          result_code: '0',
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid response format from server');
      }

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to add account');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API add account error:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(limit: number = 50, offset: number = 0): Promise<TransactionsResponse> {
    try {
      const url = this.getApiUrl('transactions/get_transactions');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('📋 Wallet API Get Transactions Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
        data: { transactions: [] },
      };

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to fetch transactions');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get transactions error:', error);
      throw error;
    }
  }

  /**
   * Get customer vouchers
   */
  async getVouchers(): Promise<Voucher[]> {
    try {
      const response = await fetch(this.getApiUrl('customer/vouchers'), {
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
  async getProfile(): Promise<CustomerProfileResponse> {
    try {
      const url = this.getApiUrl('customer/profile');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('👤 Wallet API Get Profile Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
        data: {},
      };

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to fetch profile');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get profile error:', error);
      throw error;
    }
  }

  /**
   * Check customer subscription status
   */
  async checkSubscription(): Promise<SubscriptionResponse> {
    try {
      const url = this.getApiUrl('customer/check_subscription');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('💳 Wallet API Check Subscription Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
        data: {},
      };

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to check subscription');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API check subscription error:', error);
      throw error;
    }
  }

  /**
   * Upload customer profile image
   */
  async uploadProfileImage(imageBase64: string): Promise<any> {
    try {
      const url = this.getApiUrl('customer/profile_image');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('🖼️ Wallet API Upload Profile Image Request:');
      console.log('URL:', url);
      console.log('Image length:', imageBase64.length);

      const body = JSON.stringify({
        image: imageBase64,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
      };

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to upload profile image');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API upload profile image error:', error);
      throw error;
    }
  }

  /**
   * Get transaction details by transaction ID
   */
  async getTransactionDetails(transactionId: string): Promise<any> {
    try {
      const url = this.getApiUrl(`customer/get_transaction?tid=${transactionId}`);
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('📝 Wallet API Get Transaction Details Request:');
      console.log('URL:', url);
      console.log('Transaction ID:', transactionId);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
        data: {},
      };

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to get transaction details');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get transaction details error:', error);
      throw error;
    }
  }

  /**
   * Get transaction summary
   */
  async getTransactionSummary(): Promise<any> {
    try {
      const url = this.getApiUrl('customer/transactions');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('📊 Wallet API Get Transaction Summary Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
        data: {},
      };

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to get transaction summary');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get transaction summary error:', error);
      throw error;
    }
  }

  /**
   * Fund wallet via PayFast
   */
  async fundViaPayFast(amount: string): Promise<any> {
    try {
      const url = this.getApiUrl('funding/payfast');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('💳 Wallet API PayFast Funding Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ amount }),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
      };

      console.log('📦 Parsed Data:', data);

      if (!data.data?.checkoutUrl) {
        throw new Error(data.messages || 'Failed to initiate PayFast funding');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API PayFast funding error:', error);
      throw error;
    }
  }

  /**
   * Fund wallet via Ozow
   */
  async fundViaOzow(amount: string): Promise<any> {
    try {
      const url = this.getApiUrl('funding/ozow');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('💵 Wallet API Ozow Funding Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ amount }),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
      };

      console.log('📦 Parsed Data:', data);

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API Ozow funding error:', error);
      throw error;
    }
  }

  /**
   * Get cashout quick amounts and fees
   */
  async getCashoutInfo(): Promise<any> {
    try {
      const url = this.getApiUrl('cashout/');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('💸 Wallet API Get Cashout Info Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
      };

      console.log('📦 Parsed Data:', data);

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get cashout info error:', error);
      throw error;
    }
  }

  /**
   * Process cashout/withdrawal
   */
  async processCashout(amount: number, fee: number, pin: string): Promise<any> {
    try {
      const url = this.getApiUrl('cashout/');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('💵 Wallet API Process Cashout Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ amount, fee, pin }),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
      };

      console.log('📦 Parsed Data:', data);

      if (data.statusCode !== 200) {
        throw new Error(data.messages || 'Cashout failed');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API process cashout error:', error);
      throw error;
    }
  }

  /**
   * Get cashout order details
   */
  async getCashoutOrder(orderId: string): Promise<any> {
    try {
      const url = this.getApiUrl(`cashout/get?order_id=${orderId}`);
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('📝 Wallet API Get Cashout Order Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
      };

      console.log('📦 Parsed Data:', data);

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get cashout order error:', error);
      throw error;
    }
  }

  /**
   * Process payment/order
   */
  async processPayment(
    sid: string,
    orderReference: string,
    orderId: string,
    amount: number,
    tipAmount?: number,
    tipRecipientType?: string,
    tipRecipientMobile?: string
  ): Promise<any> {
    try {
      const url = this.getApiUrl('orders/process');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('💳 Wallet API Process Payment Request:');
      console.log('URL:', url);

      const body: any = {
        sid,
        order_reference: orderReference,
        order_id: orderId,
        amount,
      };

      // Add optional tip fields if provided
      if (tipAmount !== undefined) body.tip_amount = tipAmount;
      if (tipRecipientType) body.tip_recipient_type = tipRecipientType;
      if (tipRecipientMobile) body.tip_recipient_mobile = tipRecipientMobile;

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
      };

      console.log('📦 Parsed Data:', data);

      if (data.statusCode !== 200) {
        throw new Error(data.messages || 'Payment processing failed');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API process payment error:', error);
      throw error;
    }
  }

  /**
   * Confirm payment/order with PIN
   */
  async confirmPayment(
    sid: string,
    orderReference: string,
    orderId: string,
    pin: string
  ): Promise<any> {
    try {
      const url = this.getApiUrl('orders/confirm');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('✅ Wallet API Confirm Payment Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          sid,
          order_reference: orderReference,
          order_id: orderId,
          pin,
        }),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
      };

      console.log('📦 Parsed Data:', data);

      if (data.statusCode !== 200) {
        throw new Error(data.messages || 'Payment confirmation failed');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API confirm payment error:', error);
      throw error;
    }
  }

  /**
   * Create P2P payment intent
   */
  async createP2PIntent(
    amount: number,
    toWallet: string,
    description?: string
  ): Promise<any> {
    try {
      const url = this.getApiUrl('orders/intent?q=p2p');
      const headers = await this.getHeaders(true);

      console.log('💸 Wallet API P2P Intent Request:');
      console.log('URL:', url);
      console.log('Amount:', amount);
      console.log('To Wallet:', toWallet);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          amount,
          to_wallet: toWallet,
          description: description || 'P2P Transfer',
        }),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = JSON.parse(responseText);
      console.log('📦 Parsed Data:', data);

      if (data.statusCode !== 200) {
        throw new Error(data.messages || 'P2P intent creation failed');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API P2P intent error:', error);
      throw error;
    }
  }

  /**
   * Create group payment intent
   */
  async createGroupPaymentIntent(
    amount: number,
    toWallet: string,
    fromWallet: string,
    type: 'fund' | 'withdraw' = 'fund'
  ): Promise<any> {
    try {
      const url = this.getApiUrl('orders/intent?q=group_payment');
      const headers = await this.getHeaders(true);

      console.log('👥 Wallet API Group Payment Intent Request:');
      console.log('URL:', url);
      console.log('Amount:', amount);
      console.log('To Wallet:', toWallet);
      console.log('From Wallet:', fromWallet);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          amount,
          to_wallet: toWallet,
          from_wallet: fromWallet,
          type,
        }),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = JSON.parse(responseText);
      console.log('📦 Parsed Data:', data);

      if (data.statusCode !== 200) {
        throw new Error(data.messages || 'Group payment intent creation failed');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API group payment intent error:', error);
      throw error;
    }
  }

  /**
   * Create voucher payment intent
   */
  async createVoucherPaymentIntent(
    denominations: Array<{ amount: string; id: string; quantity: string }>,
    merchantId: string,
    totalAmount: string,
    type: 'strict' | 'flexible' = 'strict'
  ): Promise<any> {
    try {
      const url = this.getApiUrl('orders/intent?q=voucher_payment');
      const headers = await this.getHeaders(true);

      console.log('🎫 Wallet API Voucher Payment Intent Request:');
      console.log('URL:', url);
      console.log('Denominations:', denominations);
      console.log('Merchant ID:', merchantId);
      console.log('Total Amount:', totalAmount);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          denominations,
          merchant_id: merchantId,
          total_amount: totalAmount,
          type,
        }),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = JSON.parse(responseText);
      console.log('📦 Parsed Data:', data);

      if (data.statusCode !== 200) {
        throw new Error(data.messages || 'Voucher payment intent creation failed');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API voucher payment intent error:', error);
      throw error;
    }
  }

  /**
   * Create subscription intent
   */
  async createSubscriptionIntent(
    productId: number,
    tierId?: number
  ): Promise<any> {
    try {
      const url = this.getApiUrl('orders/intent?q=subscription');
      const headers = await this.getHeaders(true);

      console.log('📝 Wallet API Subscription Intent Request:');
      console.log('URL:', url);
      console.log('Product ID:', productId);
      if (tierId) console.log('Tier ID:', tierId);

      const body: any = { product_id: productId };
      if (tierId) body.tier_id = tierId;

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = JSON.parse(responseText);
      console.log('📦 Parsed Data:', data);

      if (data.statusCode !== 200) {
        throw new Error(data.messages || 'Subscription intent creation failed');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API subscription intent error:', error);
      throw error;
    }
  }

  /**
   * Get VAS vouchers by type
   */
  async getVASVouchers(type: string = 'online_shopping'): Promise<any> {
    try {
      const url = this.getApiUrl(`shopping/get_vas_vouchers?type=${type}`);
      const headers = await this.getHeaders(true);

      console.log('🎫 Wallet API Get VAS Vouchers Request:');
      console.log('URL:', url);
      console.log('Type:', type);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ notification_status: '200' }),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = JSON.parse(responseText);
      console.log('📦 Parsed Data:', data);

      // Check for success - statusCode 200 or success flag
      if (data.statusCode && data.statusCode !== 200 && !data.success) {
        throw new Error(data.messages || 'Failed to fetch VAS vouchers');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get VAS vouchers error:', error);
      throw error;
    }
  }

  /**
   * Create VAS voucher payment intent
   */
  async createVASVoucherIntent(
    providerId: string,
    productCode: string,
    voucherCode: string,
    voucherValue: string,
    mobileNumber: string
  ): Promise<any> {
    try {
      const url = this.getApiUrl('orders/intent?q=vas_vouchers');
      const headers = await this.getHeaders(true);

      console.log('🎫 Wallet API VAS Voucher Intent Request:');
      console.log('URL:', url);
      console.log('Provider ID:', providerId);
      console.log('Product Code:', productCode);
      console.log('Voucher Value:', voucherValue);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          providerId,
          productCode,
          voucherCode,
          voucherValue,
          mobileNumber,
        }),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = JSON.parse(responseText);
      console.log('📦 Parsed Data:', data);

      if (data.statusCode !== 200) {
        throw new Error(data.messages || 'VAS voucher purchase failed');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API VAS voucher intent error:', error);
      throw error;
    }
  }

  /**
   * Get merchants
   */
  async getMerchants(): Promise<any> {
    try {
      const url = this.getApiUrl('shopping/get_merchants');
      const headers = await this.getHeaders(true);

      console.log('🏪 Wallet API Get Merchants Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({}),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = JSON.parse(responseText);
      console.log('📦 Parsed Data:', data);

      if (data.statusCode !== 200) {
        throw new Error(data.messages || 'Failed to fetch merchants');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get merchants error:', error);
      throw error;
    }
  }

  /**
   * Wallet top-up (External funding)
   */
  async walletTopUp(amount: number): Promise<any> {
    try {
      const url = this.getApiUrl('funding/wallet_topup');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('💰 Wallet API Top-up Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ amount }),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
      };

      console.log('📦 Parsed Data:', data);

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API top-up error:', error);
      throw error;
    }
  }

  /**
   * Fund wallet via PayShap (Instant EFT)
   */
  async fundViaPayShap(amount: string, code: string, domain: string, identifier: string): Promise<any> {
    try {
      const url = this.getApiUrl('funding/payshap');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('🏦 Wallet API PayShap Funding Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ amount, code, domain, identifier }),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
      };

      console.log('📦 Parsed Data:', data);

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API PayShap funding error:', error);
      throw error;
    }
  }

  /**
   * Reset PIN (Forgot PIN)
   */
  async resetPin(phoneNumber: string): Promise<any> {
    try {
      const url = this.getApiUrl('customer/resetPin');
      const headers = await this.getHeaders(false); // No auth token needed for reset

      console.log('🔐 Wallet API Reset PIN Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
      };

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to reset PIN');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API reset PIN error:', error);
      throw error;
    }
  }

  /**
   * Get customer settings
   */
  async getCustomerSettings(): Promise<any> {
    try {
      const url = this.getApiUrl('customer/customer_settings');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('⚙️ Wallet API Get Customer Settings Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
        data: {},
      };

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to fetch customer settings');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get customer settings error:', error);
      throw error;
    }
  }

  /**
   * Remove customer consent
   */
  async removeConsent(): Promise<any> {
    try {
      const url = this.getApiUrl('customer/remove_consent');
      const headers = await this.getHeaders(true); // Requires auth token

      console.log('⛔ Wallet API Remove Consent Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
      });

      console.log('📡 Response Status:', response.status);

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      const data = responseText ? JSON.parse(responseText) : {
        success: false,
        messages: 'Empty response',
        statusCode: response.status,
        endpoint: '',
        environment: '',
        result_code: '0',
      };

      console.log('📦 Parsed Data:', data);

      if (!data.success) {
        throw new Error(data.messages || 'Failed to remove consent');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API remove consent error:', error);
      throw error;
    }
  }

  /**
   * Verify token validity
   */
  async verifyToken(): Promise<boolean> {
    try {
      const response = await fetch(this.getApiUrl('customer/verify_token'), {
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

  /**
   * HIGH PRIORITY ENDPOINTS
   */

  /**
   * Update customer profile
   */
  async updateProfile(profileData: any): Promise<any> {
    try {
      const url = this.getApiUrl('customer/update_profile');
      const headers = await this.getHeaders(true);

      console.log('👤 Wallet API Update Profile Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(profileData),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.statusCode !== 200 && !data.success) {
        throw new Error(data.messages || 'Failed to update profile');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API update profile error:', error);
      throw error;
    }
  }

  /**
   * Update/Change PIN
   */
  async updatePin(oldPin: string, newPin: string): Promise<any> {
    try {
      const url = this.getApiUrl('customer/update_pin');
      const headers = await this.getHeaders(true);

      console.log('🔐 Wallet API Update PIN Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          old_pin: oldPin,
          new_pin: newPin,
        }),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.statusCode !== 200 && !data.success) {
        throw new Error(data.messages || 'Failed to update PIN');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API update PIN error:', error);
      throw error;
    }
  }

  /**
   * Get list of bank accounts
   */
  async getBankAccounts(): Promise<any> {
    try {
      const url = this.getApiUrl('customer/get_accounts');
      const headers = await this.getHeaders(true);

      console.log('🏦 Wallet API Get Bank Accounts Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({}),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.statusCode !== 200 && !data.success) {
        throw new Error(data.messages || 'Failed to get bank accounts');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get bank accounts error:', error);
      throw error;
    }
  }

  /**
   * Remove bank account
   */
  async removeBankAccount(accountId: string): Promise<any> {
    try {
      const url = this.getApiUrl('customer/remove_account');
      const headers = await this.getHeaders(true);

      console.log('🗑️ Wallet API Remove Bank Account Request:');
      console.log('URL:', url);
      console.log('Account ID:', accountId);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ account_id: accountId }),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.statusCode !== 200 && !data.success) {
        throw new Error(data.messages || 'Failed to remove bank account');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API remove bank account error:', error);
      throw error;
    }
  }

  /**
   * Get cashout history
   */
  async getCashoutHistory(): Promise<any> {
    try {
      const url = this.getApiUrl('cashout/history');
      const headers = await this.getHeaders(true);

      console.log('📜 Wallet API Get Cashout History Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.statusCode !== 200 && !data.success) {
        throw new Error(data.messages || 'Failed to get cashout history');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get cashout history error:', error);
      throw error;
    }
  }

  /**
   * Get notifications/messages
   */
  async getNotifications(): Promise<any> {
    try {
      const url = this.getApiUrl('notifications/get_messages');
      const headers = await this.getHeaders(true);

      console.log('🔔 Wallet API Get Notifications Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.statusCode !== 200 && !data.success) {
        throw new Error(data.messages || 'Failed to get notifications');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API get notifications error:', error);
      throw error;
    }
  }

  /**
   * Add Firebase token for push notifications
   */
  async addFirebaseToken(token: string): Promise<any> {
    try {
      const url = this.getApiUrl('notifications');
      const headers = await this.getHeaders(true);

      console.log('🔥 Wallet API Add Firebase Token Request:');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ firebase_token: token }),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.statusCode !== 200 && !data.success) {
        throw new Error(data.messages || 'Failed to add Firebase token');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API add Firebase token error:', error);
      throw error;
    }
  }

  /**
   * Send OTP
   */
  async sendOTP(phoneNumber: string, purpose?: string): Promise<any> {
    try {
      const url = this.getApiUrl('otp/send_otp');
      const headers = await this.getHeaders(false);

      console.log('📧 Wallet API Send OTP Request:');
      console.log('URL:', url);
      console.log('Phone:', phoneNumber);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          phone_number: phoneNumber,
          purpose: purpose || 'verification',
        }),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.statusCode !== 200 && !data.success) {
        throw new Error(data.messages || 'Failed to send OTP');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API send OTP error:', error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<any> {
    try {
      const url = this.getApiUrl('otp/verify_otp');
      const headers = await this.getHeaders(false);

      console.log('✅ Wallet API Verify OTP Request:');
      console.log('URL:', url);
      console.log('Phone:', phoneNumber);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          phone_number: phoneNumber,
          otp: otp,
        }),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.statusCode !== 200 && !data.success) {
        throw new Error(data.messages || 'Failed to verify OTP');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Wallet API verify OTP error:', error);
      throw error;
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
