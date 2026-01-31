import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { walletAPI } from "@/lib/wallet-api";
import Toast from "react-native-toast-message";

// Industry options (sample codes - these should match API codes)
const INDUSTRIES = [
  { label: "Agriculture & Farming", value: "1001" },
  { label: "Banking & Finance", value: "1002" },
  { label: "Construction", value: "1003" },
  { label: "Education", value: "1004" },
  { label: "Healthcare & Medical", value: "1005" },
  { label: "Hospitality & Tourism", value: "1006" },
  { label: "Information Technology", value: "1096" },
  { label: "Manufacturing", value: "1008" },
  { label: "Mining", value: "1009" },
  { label: "Retail & Wholesale", value: "1010" },
  { label: "Transportation", value: "1011" },
  { label: "Other", value: "1099" },
];

// Occupation options (sample codes - these should match API codes)
const OCCUPATIONS = [
  { label: "Accountant", value: "1101" },
  { label: "Business Owner", value: "1102" },
  { label: "Doctor/Nurse", value: "1103" },
  { label: "Engineer", value: "1104" },
  { label: "Government Employee", value: "1105" },
  { label: "Lawyer", value: "1106" },
  { label: "Manager/Executive", value: "1107" },
  { label: "Software Developer", value: "1398" },
  { label: "Student", value: "1109" },
  { label: "Teacher/Lecturer", value: "1110" },
  { label: "Unemployed", value: "1111" },
  { label: "Other", value: "1199" },
];

// Source of funds options (sample codes - these should match API codes)
const SOURCE_OF_FUNDS = [
  { label: "Salary/Employment Income", value: "1032" },
  { label: "Business Income", value: "1202" },
  { label: "Investment Income", value: "1203" },
  { label: "Pension/Retirement", value: "1204" },
  { label: "Savings", value: "1205" },
  { label: "Family Support", value: "1206" },
  { label: "Inheritance", value: "1207" },
  { label: "Other", value: "1299" },
];

export default function WalletAdditionalInfoScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const customerId = params.customerId as string;
  const idNumber = params.idNumber as string;
  
  const [loading, setLoading] = useState(false);
  const [industry, setIndustry] = useState("");
  const [occupation, setOccupation] = useState("");
  const [occupationOther, setOccupationOther] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("");

  const handleSubmit = async () => {
    // Validation
    if (!industry) {
      Toast.show({
        type: "error",
        text1: "Industry Required",
        text2: "Please select your industry",
      });
      return;
    }

    if (!occupation) {
      Toast.show({
        type: "error",
        text1: "Occupation Required",
        text2: "Please select your occupation",
      });
      return;
    }

    if (occupation === "1199" && !occupationOther.trim()) {
      Toast.show({
        type: "error",
        text1: "Specify Occupation",
        text2: "Please specify your occupation",
      });
      return;
    }

    if (!sourceOfFunds) {
      Toast.show({
        type: "error",
        text1: "Source of Funds Required",
        text2: "Please select your source of funds",
      });
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
      const infoData = {
        customer_id: customerId,
        industry: industry,
        occupation: occupation,
        occupation_other: occupation === "1199" ? occupationOther : "",
        source_of_funds: sourceOfFunds,
      };

      const response = await walletAPI.addAdditionalInfo(infoData);

      Toast.show({
        type: "success",
        text1: "Information Saved",
        text2: "Now let's verify your identity",
      });

      // Navigate to KYC verification
      setTimeout(() => {
        router.push({
          pathname: "/wallet-kyc-verify",
          params: { idNumber: idNumber }
        });
      }, 1500);
    } catch (error: any) {
      console.error("Add additional info error:", error);

      let errorMessage = "Failed to save information. Please try again.";
      if (error.response) {
        errorMessage = error.response.messages || error.response.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: "error",
        text1: "Failed to Save",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = (
    label: string,
    value: string,
    options: { label: string; value: string }[],
    onSelect: (value: string) => void
  ) => {
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <View className="mb-6">
        <Text className="text-sm font-medium text-foreground mb-3">
          {label} *
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelect(option.value)}
              className={`px-4 py-2 rounded-full border ${
                value === option.value
                  ? "bg-primary border-primary"
                  : "bg-card border-border"
              }`}
            >
              <Text
                className={`text-sm ${
                  value === option.value ? "text-white font-medium" : "text-muted"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
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
              <IconSymbol name="doc.text.fill" size={48} color={colors.primary} />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2">
              Additional Information
            </Text>
            <Text className="text-base text-muted text-center">
              Complete your profile with employment and financial details
            </Text>
          </View>

          {/* Industry */}
          {renderDropdown("Industry", industry, INDUSTRIES, setIndustry)}

          {/* Occupation */}
          {renderDropdown("Occupation", occupation, OCCUPATIONS, setOccupation)}

          {/* Occupation Other (conditional) */}
          {occupation === "1199" && (
            <View className="mb-6">
              <Text className="text-sm font-medium text-foreground mb-3">
                Specify Occupation *
              </Text>
              <TextInput
                value={occupationOther}
                onChangeText={setOccupationOther}
                placeholder="Enter your occupation"
                placeholderTextColor={colors.muted}
                className="w-full px-4 py-4 bg-card border border-border rounded-xl text-foreground"
              />
            </View>
          )}

          {/* Source of Funds */}
          {renderDropdown(
            "Source of Funds",
            sourceOfFunds,
            SOURCE_OF_FUNDS,
            setSourceOfFunds
          )}

          {/* Info Banner */}
          <View className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start mb-2">
              <IconSymbol name="info.circle.fill" size={20} color="#3b82f6" />
              <Text className="text-foreground font-semibold ml-2">
                Why do we need this?
              </Text>
            </View>
            <Text className="text-muted text-xs ml-7">
              This information helps us comply with financial regulations and provide
              you with better services tailored to your needs.
            </Text>
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
                Complete Profile
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
