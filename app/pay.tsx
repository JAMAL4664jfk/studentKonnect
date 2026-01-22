import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { Picker } from "@react-native-picker/picker";
import { CameraView, useCameraPermissions } from "expo-camera";

const PAYMENT_TYPES = [
  { value: "wallet", label: "Scholar Fin Hub Wallet" },
  { value: "card", label: "Debit/Credit Card" },
];

export default function PayScreen() {
  const router = useRouter();
  const colors = useColors();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);

  // Form fields
  const [merchantCode, setMerchantCode] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("wallet");

  useEffect(() => {
    fetchBalance();
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    if (!permission) {
      await requestPermission();
    }
  };

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScan = async () => {
    if (hasPermission === false) {
      Alert.alert(
        "Camera Permission",
        "Camera permission is required to scan QR codes",
        [{ text: "OK" }]
      );
      return;
    }

    setScanning(true);
  };

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanning(false);
    setMerchantCode(data);
    Toast.show({
      type: "success",
      text1: "QR Code Scanned",
      text2: "Merchant code has been filled",
    });
  };

  const handleSubmit = async () => {
    if (!merchantCode.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Merchant Code",
        text2: "Please enter or scan a merchant code",
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue < 1) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Minimum amount is R1",
      });
      return;
    }

    if (amountValue > 10000) {
      Toast.show({
        type: "error",
        text1: "Amount Too High",
        text2: "Maximum amount is R10,000 per transaction",
      });
      return;
    }

    if (paymentType === "wallet" && amountValue > balance) {
      Toast.show({
        type: "error",
        text1: "Insufficient Balance",
        text2: "You don't have enough funds in your wallet",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (paymentType === "wallet") {
        // Deduct from wallet
        const { error: walletError } = await supabase
          .from("wallets")
          .update({ balance: balance - amountValue })
          .eq("user_id", user.id);

        if (walletError) throw walletError;

        // Record transaction
        const description = `Payment to merchant ${merchantCode}${
          merchantName ? ` (${merchantName})` : ""
        }`;

        await supabase.from("transactions").insert({
          user_id: user.id,
          type: "Payment",
          amount: -amountValue,
          description,
          status: "completed",
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Payment Successful",
        text2: `Paid R${amountValue.toFixed(2)} to ${merchantName || merchantCode}`,
      });

      // Reset form
      setMerchantCode("");
      setMerchantName("");
      setAmount("");
      setPaymentType("wallet");
      fetchBalance();
    } catch (error) {
      console.error("Error processing payment:", error);
      Toast.show({
        type: "error",
        text1: "Payment Failed",
        text2: "Failed to process payment. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (scanning) {
    return (
      <ScreenContainer edges={["top", "left", "right", "bottom"]} className="flex-1">
        <View className="flex-1">
          <CameraView
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13", "code128"],
            }}
            style={{ flex: 1 }}
          />
          <View className="absolute top-4 left-4 right-4">
            <TouchableOpacity
              onPress={() => setScanning(false)}
              className="bg-black/70 px-4 py-3 rounded-full self-start"
            >
              <Text className="text-white font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
          <View className="absolute bottom-8 left-4 right-4">
            <View className="bg-black/70 p-4 rounded-2xl">
              <Text className="text-white text-center font-semibold">
                Align QR code within the frame
              </Text>
            </View>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]} className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Pay Merchant</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {/* Balance Card */}
          <View
            className="bg-surface rounded-2xl p-5 mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-muted mb-1">Available Balance</Text>
                <Text className="text-3xl font-bold text-foreground">R{balance.toFixed(2)}</Text>
              </View>
              <IconSymbol name="banknote" size={32} color={colors.primary} />
            </View>
          </View>

          {/* QR Scanner Section */}
          <View
            className="rounded-2xl p-6 mb-6 border-2 border-dashed"
            style={{
              backgroundColor: `${colors.primary}10`,
              borderColor: `${colors.primary}50`,
            }}
          >
            <View className="items-center">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="qrcode" size={32} color={colors.primary} />
              </View>
              <Text className="text-base font-semibold text-foreground mb-2">
                Scan Barcode/QR Code
              </Text>
              <TouchableOpacity
                onPress={handleBarcodeScan}
                className="px-6 py-3 rounded-full border-2"
                style={{
                  borderColor: colors.primary,
                  backgroundColor: colors.surface,
                }}
              >
                <Text className="font-semibold" style={{ color: colors.primary }}>
                  Open Camera
                </Text>
              </TouchableOpacity>
              <Text className="text-xs text-muted mt-3">
                Or enter merchant details manually below
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="gap-5">
            {/* Merchant Code */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Merchant Code *
              </Text>
              <TextInput
                value={merchantCode}
                onChangeText={setMerchantCode}
                placeholder="e.g., MER-123456"
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-xl px-4 py-3 text-foreground font-mono"
                maxLength={20}
              />
              <Text className="text-xs text-muted mt-1">6-20 character merchant code</Text>
            </View>

            {/* Merchant Name */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Merchant Name (Optional)
              </Text>
              <TextInput
                value={merchantName}
                onChangeText={setMerchantName}
                placeholder="Store or business name"
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-xl px-4 py-3 text-foreground"
                maxLength={100}
              />
            </View>

            {/* Amount */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Amount (R) *</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-xl px-4 py-3 text-foreground text-lg font-semibold"
              />
              <Text className="text-xs text-muted mt-2">
                Min: R1 | Max: R10,000 • Secure payment
              </Text>
            </View>

            {/* Payment Type */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Payment Type</Text>
              <View
                className="bg-surface rounded-xl border border-border"
                style={{ overflow: "hidden" }}
              >
                <Picker
                  selectedValue={paymentType}
                  onValueChange={(value) => setPaymentType(value)}
                  style={{ color: colors.foreground }}
                >
                  {PAYMENT_TYPES.map((type) => (
                    <Picker.Item key={type.value} label={type.label} value={type.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Security Info */}
            <View
              className="rounded-xl p-4"
              style={{
                backgroundColor: `${colors.primary}20`,
                borderWidth: 2,
                borderColor: `${colors.primary}50`,
              }}
            >
              <Text className="text-sm font-bold text-foreground mb-1">Secure Payment</Text>
              <Text className="text-xs text-muted">
                256-bit encryption. Your payment is protected.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className="py-4 rounded-full mt-2"
              style={{
                backgroundColor: submitting ? colors.muted : colors.primary,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-center text-white font-semibold text-base">Pay Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
