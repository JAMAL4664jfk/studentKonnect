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
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { walletAPI } from "@/lib/wallet-api";
import Toast from "react-native-toast-message";

export default function WalletCreatePinScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get customer data from route params
  const customerId = params.customerId as string;
  const customerName = params.customerName as string;
  
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const validatePin = (): boolean => {
    // Validate PIN length (4-6 digits)
    if (!pin || pin.length < 4 || pin.length > 6) {
      Toast.show({
        type: "error",
        text1: "Invalid PIN",
        text2: "PIN must be 4-6 digits",
      });
      return false;
    }

    // Validate PIN is numeric
    if (!/^\d+$/.test(pin)) {
      Toast.show({
        type: "error",
        text1: "Invalid PIN",
        text2: "PIN must contain only numbers",
      });
      return false;
    }

    // Validate PIN confirmation
    if (pin !== confirmPin) {
      Toast.show({
        type: "error",
        text1: "PINs Don't Match",
        text2: "Please make sure both PINs are the same",
      });
      return false;
    }

    return true;
  };

  const handleCreatePin = async () => {
    if (!validatePin()) {
      return;
    }

    if (!customerId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Customer ID is missing. Please try again.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await walletAPI.createPin(customerId, pin);

      Toast.show({
        type: "success",
        text1: "PIN Created Successfully",
        text2: response.messages || "You can now login with your PIN",
      });

      // Navigate to login screen
      setTimeout(() => {
        router.replace("/wallet-login");
      }, 1500);
    } catch (error: any) {
      console.error("Create PIN error:", error);

      let errorMessage = "Failed to create PIN. Please try again.";
      if (error.response) {
        errorMessage = error.response.messages || error.response.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: "error",
        text1: "PIN Creation Failed",
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
              <IconSymbol name="lock.shield.fill" size={48} color={colors.primary} />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2">
              Create Your PIN
            </Text>
            {customerName && (
              <Text className="text-base text-muted text-center mb-2">
                Welcome, {customerName}!
              </Text>
            )}
            <Text className="text-base text-muted text-center">
              Set a secure PIN to protect your wallet
            </Text>
          </View>

          {/* PIN Creation Form */}
          <View className="gap-4">
            {/* PIN Input */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Enter PIN (4-6 digits)
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
                  autoFocus
                />
                <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                  <IconSymbol
                    name={showPin ? "eye.slash.fill" : "eye.fill"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm PIN Input */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Confirm PIN
              </Text>
              <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3">
                <IconSymbol name="lock.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="Re-enter your PIN"
                  placeholderTextColor={colors.muted}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  keyboardType="number-pad"
                  secureTextEntry={!showConfirmPin}
                  maxLength={6}
                />
                <TouchableOpacity onPress={() => setShowConfirmPin(!showConfirmPin)}>
                  <IconSymbol
                    name={showConfirmPin ? "eye.slash.fill" : "eye.fill"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* PIN Requirements */}
            <View className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <Text className="text-sm font-semibold text-blue-600 mb-2">
                PIN Requirements:
              </Text>
              <View className="gap-1">
                <Text className="text-xs text-blue-600">
                  • Must be 4-6 digits
                </Text>
                <Text className="text-xs text-blue-600">
                  • Only numbers allowed
                </Text>
                <Text className="text-xs text-blue-600">
                  • Choose a PIN you can remember
                </Text>
                <Text className="text-xs text-blue-600">
                  • Don't use obvious numbers (1234, 0000, etc.)
                </Text>
              </View>
            </View>

            {/* Create PIN Button */}
            <TouchableOpacity
              onPress={handleCreatePin}
              disabled={loading || !pin || !confirmPin}
              className={`rounded-xl py-4 items-center mt-4 ${
                loading || !pin || !confirmPin ? 'bg-primary/50' : 'bg-primary'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-bold">Create PIN</Text>
              )}
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="items-center py-4"
            >
              <Text className="text-sm text-muted">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
