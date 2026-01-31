import React, { useState } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { walletAPI } from "@/lib/wallet-api";
import Toast from "react-native-toast-message";

export default function WalletAddAddressScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const customerId = params.customerId as string;
  
  const [loading, setLoading] = useState(false);
  const [addressType, setAddressType] = useState("PHYSICAL");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [code, setCode] = useState("");
  const [country, setCountry] = useState("ZA");

  // South African provinces
  const provinces = [
    "Eastern Cape",
    "Free State",
    "Gauteng",
    "KwaZulu-Natal",
    "Limpopo",
    "Mpumalanga",
    "Northern Cape",
    "North West",
    "Western Cape",
  ];

  const validateForm = (): boolean => {
    if (!line1.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please enter street address line 1",
      });
      return false;
    }

    if (!city.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please enter city",
      });
      return false;
    }

    if (!state.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please select province",
      });
      return false;
    }

    if (!code.trim() || code.length !== 4) {
      Toast.show({
        type: "error",
        text1: "Invalid Postal Code",
        text2: "Please enter a valid 4-digit postal code",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
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
      const addressData = {
        customer_id: customerId,
        addressType: addressType,
        city: city.trim(),
        code: code.trim(),
        state: state.trim(),
        country: country,
        line1: line1.trim(),
        line2: line2.trim() || undefined,
      };

      const response = await walletAPI.addAddress(addressData);

      Toast.show({
        type: "success",
        text1: "Address Added",
        text2: "Now let's upload your selfie",
      });

      // Navigate to selfie upload
      setTimeout(() => {
        router.push({
          pathname: "/wallet-upload-selfie",
          params: { customerId: customerId }
        });
      }, 1500);
    } catch (error: any) {
      console.error("Add address error:", error);

      let errorMessage = "Failed to add address. Please try again.";
      if (error.response) {
        errorMessage = error.response.messages || error.response.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: "error",
        text1: "Failed to Add Address",
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
        <ScrollView className="flex-1 px-6 pt-12">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <IconSymbol name="house.fill" size={48} color={colors.primary} />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2">
              Add Your Address
            </Text>
            <Text className="text-base text-muted text-center">
              Complete your profile by adding your address information
            </Text>
          </View>

          {/* Address Type Selection */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-3">
              Address Type
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setAddressType("PHYSICAL")}
                className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                  addressType === "PHYSICAL"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    addressType === "PHYSICAL" ? "text-primary" : "text-muted"
                  }`}
                >
                  Physical
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAddressType("POSTAL")}
                className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                  addressType === "POSTAL"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    addressType === "POSTAL" ? "text-primary" : "text-muted"
                  }`}
                >
                  Postal
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Address Form */}
          <View className="gap-4 mb-6">
            {/* Street Address Line 1 */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Street Address Line 1 *
              </Text>
              <TextInput
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                placeholder="e.g., 37 Lavender Grove"
                placeholderTextColor={colors.muted}
                value={line1}
                onChangeText={setLine1}
                autoCapitalize="words"
              />
            </View>

            {/* Street Address Line 2 */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Street Address Line 2 (Optional)
              </Text>
              <TextInput
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                placeholder="e.g., Gooseberry Street"
                placeholderTextColor={colors.muted}
                value={line2}
                onChangeText={setLine2}
                autoCapitalize="words"
              />
            </View>

            {/* City */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                City *
              </Text>
              <TextInput
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                placeholder="e.g., Boksburg"
                placeholderTextColor={colors.muted}
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
              />
            </View>

            {/* Province */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Province *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {provinces.map((province) => (
                  <TouchableOpacity
                    key={province}
                    onPress={() => setState(province)}
                    className={`py-2 px-3 rounded-lg border ${
                      state === province
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        state === province ? "text-primary font-medium" : "text-muted"
                      }`}
                    >
                      {province}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Postal Code */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Postal Code *
              </Text>
              <TextInput
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                placeholder="e.g., 1459"
                placeholderTextColor={colors.muted}
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            {/* Country (Fixed to South Africa) */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Country
              </Text>
              <View className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl">
                <Text className="text-foreground">South Africa (ZA)</Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="w-full bg-primary py-4 rounded-xl items-center mb-6"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Save Address
              </Text>
            )}
          </TouchableOpacity>

          {/* Skip Button */}
          <TouchableOpacity
            onPress={() => router.replace("/wallet-dashboard")}
            disabled={loading}
            className="w-full py-4 items-center mb-8"
          >
            <Text className="text-muted text-sm">Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
