import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { walletAPI } from "@/lib/wallet-api";
import Toast from "react-native-toast-message";

export default function WalletKYCVerifyScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const idNumber = params.idNumber as string;
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    // Auto-verify if ID number is provided
    if (idNumber && !verificationComplete) {
      handleVerify();
    }
  }, [idNumber]);

  const handleVerify = async () => {
    if (!idNumber) {
      Toast.show({
        type: "error",
        text1: "ID Number Missing",
        text2: "ID number is required for verification",
      });
      return;
    }

    setVerifying(true);

    try {
      const data = await walletAPI.verifyID(idNumber);

      setVerificationData(data);
      setVerificationComplete(true);

      // Check for any issues
      if (data.IDBlocked) {
        Toast.show({
          type: "error",
          text1: "ID Blocked",
          text2: "This ID has been blocked. Please contact support.",
        });
        return;
      }

      if (data.DeadIndicator) {
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2: "ID verification failed. Please contact support.",
        });
        return;
      }

      if (data.SAFPSListedFraudster) {
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2: "Unable to verify identity. Please contact support.",
        });
        return;
      }

      // Success
      Toast.show({
        type: "success",
        text1: "Verification Successful",
        text2: `Welcome, ${data.FirstName} ${data.LastName}!`,
      });
    } catch (error: any) {
      console.error("KYC verification error:", error);

      let errorMessage = "Failed to verify ID. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: errorMessage,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleContinue = () => {
    if (!verificationComplete) {
      Toast.show({
        type: "error",
        text1: "Verification Required",
        text2: "Please complete ID verification first",
      });
      return;
    }

    // Navigate to dashboard
    router.replace("/wallet-dashboard");
  };

  const renderVerificationStatus = () => {
    if (!verificationData) return null;

    const checks = [
      {
        label: "Identity Verified",
        value: verificationData.Status === "Success",
        icon: "checkmark.circle.fill",
      },
      {
        label: "Smart Card Issued",
        value: verificationData.SmartCardIssued,
        icon: "creditcard.fill",
      },
      {
        label: "On HANIS Database",
        value: verificationData.OnHANIS,
        icon: "server.rack",
      },
      {
        label: "On NPR Database",
        value: verificationData.OnNPR,
        icon: "server.rack",
      },
      {
        label: "Facial Image Available",
        value: verificationData.FacialImageAvailable,
        icon: "person.crop.circle",
      },
    ];

    return (
      <View className="mb-6">
        <Text className="text-lg font-semibold text-foreground mb-4">
          Verification Status
        </Text>
        {checks.map((check, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between py-3 border-b border-border"
          >
            <View className="flex-row items-center flex-1">
              <IconSymbol
                name={check.icon}
                size={20}
                color={check.value ? "#10b981" : colors.muted}
              />
              <Text className="text-foreground ml-3">{check.label}</Text>
            </View>
            <View
              className={`px-3 py-1 rounded-full ${
                check.value ? "bg-green-500/10" : "bg-muted/10"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  check.value ? "text-green-500" : "text-muted"
                }`}
              >
                {check.value ? "Yes" : "No"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderPersonalInfo = () => {
    if (!verificationData) return null;

    const info = [
      { label: "First Name", value: verificationData.FirstName },
      { label: "Last Name", value: verificationData.LastName },
      { label: "Marital Status", value: verificationData.MaritalStatus },
      {
        label: "ID Issue Date",
        value: verificationData.IDIssueDate
          ? `${verificationData.IDIssueDate.slice(0, 4)}-${verificationData.IDIssueDate.slice(4, 6)}-${verificationData.IDIssueDate.slice(6, 8)}`
          : "N/A",
      },
      { label: "Birth Country", value: verificationData.BirthPlaceCountryCode },
    ];

    return (
      <View className="mb-6">
        <Text className="text-lg font-semibold text-foreground mb-4">
          Personal Information
        </Text>
        <View className="bg-card border border-border rounded-2xl p-4">
          {info.map((item, index) => (
            <View
              key={index}
              className={`flex-row justify-between py-2 ${
                index < info.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <Text className="text-muted">{item.label}</Text>
              <Text className="text-foreground font-medium">{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 pt-12">
        {/* Header */}
        <View className="items-center mb-8">
          <View
            className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
              verificationComplete && verificationData?.Status === "Success"
                ? "bg-green-500/10"
                : "bg-primary/10"
            }`}
          >
            <IconSymbol
              name={
                verificationComplete && verificationData?.Status === "Success"
                  ? "checkmark.shield.fill"
                  : "shield.fill"
              }
              size={48}
              color={
                verificationComplete && verificationData?.Status === "Success"
                  ? "#10b981"
                  : colors.primary
              }
            />
          </View>
          <Text className="text-3xl font-bold text-foreground mb-2">
            {verificationComplete ? "Verification Complete" : "KYC Verification"}
          </Text>
          <Text className="text-base text-muted text-center">
            {verificationComplete
              ? "Your identity has been verified successfully"
              : "Verifying your identity for security and compliance"}
          </Text>
        </View>

        {/* Verifying State */}
        {verifying && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-muted mt-4">Verifying your identity...</Text>
            <Text className="text-xs text-muted mt-2">This may take a few seconds</Text>
          </View>
        )}

        {/* Verification Results */}
        {!verifying && verificationComplete && (
          <>
            {renderPersonalInfo()}
            {renderVerificationStatus()}

            {/* Security Info */}
            <View className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6">
              <View className="flex-row items-start mb-2">
                <IconSymbol name="info.circle.fill" size={20} color="#3b82f6" />
                <Text className="text-foreground font-semibold ml-2">
                  Your Data is Secure
                </Text>
              </View>
              <Text className="text-muted text-xs ml-7">
                We use government databases to verify your identity. Your information
                is encrypted and stored securely in compliance with POPIA regulations.
              </Text>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleContinue}
              disabled={loading}
              className="w-full bg-primary py-4 rounded-xl items-center mb-6"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Continue to Dashboard
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Retry Button */}
        {!verifying && !verificationComplete && (
          <TouchableOpacity
            onPress={handleVerify}
            className="w-full bg-primary py-4 rounded-xl items-center mb-6"
          >
            <Text className="text-white font-semibold text-base">
              Start Verification
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
