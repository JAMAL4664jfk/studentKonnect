import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { walletAPI, WalletRegistrationRequest } from "@/lib/wallet-api";
import Toast from "react-native-toast-message";

export default function WalletRegisterScreen() {
  const colors = useColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    id_number: "",
    phone_number: "",
    first_name: "",
    last_name: "",
    middle_name: "",
    referrer_id: "",
  });
  
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = (): boolean => {
    // Validate ID number (South African ID: 13 digits)
    if (!formData.id_number || formData.id_number.length !== 13) {
      Toast.show({
        type: "error",
        text1: "Invalid ID Number",
        text2: "Please enter a valid 13-digit ID number",
      });
      return false;
    }

    // Validate phone number (10 digits starting with 0)
    const phoneRegex = /^0\d{9}$/;
    if (!formData.phone_number || !phoneRegex.test(formData.phone_number)) {
      Toast.show({
        type: "error",
        text1: "Invalid Phone Number",
        text2: "Please enter a valid 10-digit phone number starting with 0",
      });
      return false;
    }

    // Validate names
    if (!formData.first_name || formData.first_name.length < 2) {
      Toast.show({
        type: "error",
        text1: "Invalid First Name",
        text2: "Please enter your first name",
      });
      return false;
    }

    if (!formData.last_name || formData.last_name.length < 2) {
      Toast.show({
        type: "error",
        text1: "Invalid Last Name",
        text2: "Please enter your last name",
      });
      return false;
    }

    // Validate agreements
    if (!agreedToPrivacy || !agreedToTerms) {
      Toast.show({
        type: "error",
        text1: "Agreement Required",
        text2: "Please agree to the Privacy Policy and Terms & Conditions",
      });
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const registrationData: WalletRegistrationRequest = {
        id_number: formData.id_number,
        phone_number: formData.phone_number,
        first_name: formData.first_name.toUpperCase(),
        last_name: formData.last_name.toUpperCase(),
        middle_name: formData.middle_name.toUpperCase(),
        privacy: agreedToPrivacy,
        gtc: agreedToTerms,
        registration_step: "1",
        registration_type: "customer",
        referrer_id: formData.referrer_id || undefined,
      };

      const response = await walletAPI.register(registrationData);

      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: response.messages || "Your account has been created",
      });

      // Navigate to login or next step
      setTimeout(() => {
        router.replace("/wallet-login");
      }, 1500);
    } catch (error: any) {
      console.error("Registration error:", error);

      let errorMessage = "Registration failed. Please try again.";
      if (error.response) {
        errorMessage = error.response.messages || error.response.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: "error",
        text1: "Registration Failed",
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
        <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <IconSymbol name="person.badge.plus.fill" size={48} color={colors.primary} />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2">
              Create Wallet Account
            </Text>
            <Text className="text-base text-muted text-center">
              Register to access your student wallet and services
            </Text>
          </View>

          {/* Registration Form */}
          <View className="gap-4 mb-6">
            {/* ID Number */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                ID Number *
              </Text>
              <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3">
                <IconSymbol name="creditcard.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="0501016793082"
                  placeholderTextColor={colors.muted}
                  value={formData.id_number}
                  onChangeText={(text) => setFormData({ ...formData, id_number: text })}
                  keyboardType="number-pad"
                  maxLength={13}
                />
              </View>
            </View>

            {/* Phone Number */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Phone Number *
              </Text>
              <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3">
                <IconSymbol name="phone.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="0836624434"
                  placeholderTextColor={colors.muted}
                  value={formData.phone_number}
                  onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* First Name */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                First Name *
              </Text>
              <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3">
                <IconSymbol name="person.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="SIZO"
                  placeholderTextColor={colors.muted}
                  value={formData.first_name}
                  onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Last Name */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Last Name *
              </Text>
              <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3">
                <IconSymbol name="person.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="TESTING"
                  placeholderTextColor={colors.muted}
                  value={formData.last_name}
                  onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Middle Name (Optional) */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Middle Name (Optional)
              </Text>
              <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3">
                <IconSymbol name="person.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="Middle name"
                  placeholderTextColor={colors.muted}
                  value={formData.middle_name}
                  onChangeText={(text) => setFormData({ ...formData, middle_name: text })}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Referrer ID (Optional) */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Referrer Code (Optional)
              </Text>
              <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3">
                <IconSymbol name="gift.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="t0nw2v"
                  placeholderTextColor={colors.muted}
                  value={formData.referrer_id}
                  onChangeText={(text) => setFormData({ ...formData, referrer_id: text })}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Privacy Policy Agreement */}
            <TouchableOpacity
              onPress={() => setAgreedToPrivacy(!agreedToPrivacy)}
              className="flex-row items-start gap-3"
            >
              <View className={`w-5 h-5 rounded border-2 items-center justify-center ${
                agreedToPrivacy ? 'bg-primary border-primary' : 'border-border'
              }`}>
                {agreedToPrivacy && (
                  <IconSymbol name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text className="flex-1 text-sm text-muted">
                I agree to the <Text className="text-primary">Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Terms & Conditions Agreement */}
            <TouchableOpacity
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              className="flex-row items-start gap-3"
            >
              <View className={`w-5 h-5 rounded border-2 items-center justify-center ${
                agreedToTerms ? 'bg-primary border-primary' : 'border-border'
              }`}>
                {agreedToTerms && (
                  <IconSymbol name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text className="flex-1 text-sm text-muted">
                I agree to the <Text className="text-primary">Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="bg-primary rounded-xl py-4 items-center mt-4"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-bold">Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Already have account */}
            <TouchableOpacity
              onPress={() => router.push("/wallet-login")}
              className="items-center py-4"
            >
              <Text className="text-sm text-muted">
                Already have an account? <Text className="text-primary font-semibold">Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
