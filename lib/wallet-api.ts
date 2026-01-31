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
   * Get wallet balance
   */
  async getBalance(): Promise<WalletBalance> {
    try {
      const response = await fetch(this.getApiUrl('customer/balance'), {
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
        this.getApiUrl(`transactions?limit=${limit}&offset=${offset}`),
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
  async getProfile(): Promise<CustomerProfile> {
    try {
      const response = await fetch(this.getApiUrl('customer/profile'), {
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
