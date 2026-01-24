import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BIOMETRIC_ENABLED_KEY = "biometric_enabled";
const BIOMETRIC_USER_EMAIL_KEY = "biometric_user_email";

export interface BiometricCapability {
  isAvailable: boolean;
  biometricType: string;
  hasHardware: boolean;
  isEnrolled: boolean;
}

/**
 * Check if biometric authentication is available on the device
 */
export async function checkBiometricCapability(): Promise<BiometricCapability> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    let biometricType = "Biometric";
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = "Face Recognition";
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = "Fingerprint";
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = "Iris Recognition";
    }

    return {
      isAvailable: hasHardware && isEnrolled,
      biometricType,
      hasHardware,
      isEnrolled,
    };
  } catch (error) {
    console.error("Biometric capability check error:", error);
    return {
      isAvailable: false,
      biometricType: "None",
      hasHardware: false,
      isEnrolled: false,
    };
  }
}

/**
 * Authenticate user with biometric
 */
export async function authenticateWithBiometric(
  promptMessage: string = "Verify your identity"
): Promise<{ success: boolean; error?: string }> {
  try {
    const capability = await checkBiometricCapability();

    if (!capability.isAvailable) {
      return {
        success: false,
        error: "Biometric authentication is not available on this device",
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: "Use password instead",
      disableDeviceFallback: false,
      cancelLabel: "Cancel",
    });

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error || "Authentication failed",
      };
    }
  } catch (error: any) {
    console.error("Biometric authentication error:", error);
    return {
      success: false,
      error: error.message || "Authentication failed",
    };
  }
}

/**
 * Enable biometric authentication for a user
 */
export async function enableBiometricAuth(userEmail: string): Promise<boolean> {
  try {
    // First authenticate to confirm user identity
    const authResult = await authenticateWithBiometric(
      "Verify your identity to enable biometric login"
    );

    if (!authResult.success) {
      return false;
    }

    // Store biometric preference
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, "true");
    await AsyncStorage.setItem(BIOMETRIC_USER_EMAIL_KEY, userEmail);

    return true;
  } catch (error) {
    console.error("Enable biometric error:", error);
    return false;
  }
}

/**
 * Disable biometric authentication
 */
export async function disableBiometricAuth(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    await AsyncStorage.removeItem(BIOMETRIC_USER_EMAIL_KEY);
  } catch (error) {
    console.error("Disable biometric error:", error);
  }
}

/**
 * Check if biometric is enabled for current user
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === "true";
  } catch (error) {
    console.error("Check biometric enabled error:", error);
    return false;
  }
}

/**
 * Get the email of user with biometric enabled
 */
export async function getBiometricUserEmail(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(BIOMETRIC_USER_EMAIL_KEY);
  } catch (error) {
    console.error("Get biometric user email error:", error);
    return null;
  }
}

/**
 * Login with biometric authentication
 */
export async function loginWithBiometric(): Promise<{
  success: boolean;
  email?: string;
  error?: string;
}> {
  try {
    // Check if biometric is enabled
    const enabled = await isBiometricEnabled();
    if (!enabled) {
      return {
        success: false,
        error: "Biometric authentication is not enabled",
      };
    }

    // Get stored email
    const email = await getBiometricUserEmail();
    if (!email) {
      return {
        success: false,
        error: "No user email found for biometric authentication",
      };
    }

    // Authenticate with biometric
    const authResult = await authenticateWithBiometric("Login with biometric");

    if (authResult.success) {
      return {
        success: true,
        email,
      };
    } else {
      return {
        success: false,
        error: authResult.error,
      };
    }
  } catch (error: any) {
    console.error("Biometric login error:", error);
    return {
      success: false,
      error: error.message || "Login failed",
    };
  }
}
