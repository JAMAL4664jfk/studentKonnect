import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { walletAPI } from "@/lib/wallet-api";
import Toast from "react-native-toast-message";
import { restoreSession } from "@/lib/wallet-session-client";
import { useEffect } from "react";

export default function WalletLoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const session = await restoreSession();
        if (session && !session.isRefreshTokenExpired) {
          console.log('✅ [Login Screen] Valid session found, redirecting to dashboard...');
          router.replace('/wallet-dashboard');
        }
      } catch (error) {
        console.log('ℹ️ [Login Screen] No existing session, showing login form');
      }
    };
    
    checkExistingSession();
  }, []);

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\s/g, "");
    return /^0\d{9}$/.test(cleaned);
  };

  const handleLogin = async () => {
    // Validation
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      Toast.show({
        type: "error",
        text1: "Invalid Phone Number",
        text2: "Please enter a valid 10-digit phone number starting with 0",
      });
      return;
    }

    if (!pin || pin.length < 4) {
      Toast.show({
        type: "error",
        text1: "Invalid PIN",
        text2: "Please enter your PIN (minimum 4 digits)",
      });
      return;
    }

    setLoading(true);

    try {
      // Login with Wallet API
      console.log('🔐 Attempting login for:', phoneNumber);
      const response = await walletAPI.login(phoneNumber, pin);

      // Verify login was successful and tokens were stored
      if (response.success && response.data) {
        console.log('✅ Login successful, tokens stored');
        console.log('📊 Token expires in:', response.data.access_token_expires_in, 'seconds');
        
        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: `Welcome back!`,
        });

        // Navigate to My Student Account
        setTimeout(() => {
          router.replace("/wallet-dashboard");
        }, 1000);
      } else {
        // Login failed - should not reach here due to error handling in walletAPI
        console.error('❌ Login failed:', response);
        throw new Error(response.messages || 'Login failed');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Extract error message from API response
      let errorMessage = "Invalid phone number or PIN";
      if (error.response) {
        errorMessage = error.response.messages || error.response.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <IconSymbol name="person.circle.fill" size={48} color={colors.primary} />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2">
              My Student Account
            </Text>
            <Text className="text-lg font-semibold text-primary text-center mb-1">
              We care
            </Text>
            <Text className="text-base text-muted text-center">
              Sign in to access your wallet and student services
            </Text>
          </View>

          {/* Login Form */}
          <View className="gap-4">
            {/* Phone Number Input */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Phone Number
              </Text>
              <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3">
                <IconSymbol name="phone.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="0844050611"
                  placeholderTextColor={colors.muted}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoCapitalize="none"
                />
              </View>
              <Text className="text-xs text-muted mt-1">
                Enter your registered phone number
              </Text>
            </View>

            {/* PIN Input */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                PIN
              </Text>
              <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3">
                <IconSymbol name="lock.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="Enter your PIN"
                  placeholderTextColor={colors.muted}
                  value={pin}
                  onChangeText={setPin}
                  keyboardType="number-pad"
                  secureTextEntry={!showPin}
                  maxLength={6}
                />
                <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                  <IconSymbol
                    name={showPin ? "eye.slash.fill" : "eye.fill"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-muted mt-1">
                Enter your wallet PIN
              </Text>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-primary rounded-xl py-4 items-center mt-4"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-bold">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Forgot PIN Link */}
            <TouchableOpacity
              onPress={() => router.push('/wallet-forgot-pin')}
              className="items-center py-3"
            >
              <Text className="text-sm text-primary font-medium">Forgot PIN?</Text>
            </TouchableOpacity>

            {/* Test Credentials Info */}
            <View className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
              <Text className="text-sm font-semibold text-blue-600 mb-2">
                Test Credentials (QA Environment)
              </Text>
              <View className="gap-1">
                <Text className="text-xs text-blue-600">
                  Phone: 0844050611
                </Text>
                <Text className="text-xs text-blue-600">
                  PIN: 12345
                </Text>
              </View>
            </View>

            {/* Register Link */}
            <TouchableOpacity
              onPress={() => router.push("/wallet-register")}
              className="items-center py-4"
            >
              <Text className="text-sm text-muted">
                Don't have an account? <Text className="text-primary font-semibold">Register</Text>
              </Text>
            </TouchableOpacity>

            {/* Back to Guest Mode */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="items-center py-4"
            >
              <Text className="text-sm text-muted">
                Back to Guest Mode
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
