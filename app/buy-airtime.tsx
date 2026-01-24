import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";

const NETWORK_PROVIDERS = [
  { label: "Vodacom", value: "vodacom", color: "#E60000" },
  { label: "MTN", value: "mtn", color: "#FFCB05" },
  { label: "Cell C", value: "cellc", color: "#0066CC" },
  { label: "Telkom Mobile", value: "telkom", color: "#00A9CE" },
  { label: "Rain", value: "rain", color: "#FF6B6B" },
];

const AIRTIME_AMOUNTS = [
  { label: "R10", value: 10 },
  { label: "R29", value: 29 },
  { label: "R50", value: 50 },
  { label: "R100", value: 100 },
  { label: "R150", value: 150 },
  { label: "R200", value: 200 },
  { label: "R300", value: 300 },
  { label: "R500", value: 500 },
];

export default function BuyAirtimeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [network, setNetwork] = useState("vodacom");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const validatePhoneNumber = (number: string): boolean => {
    // SA phone number validation (10 digits starting with 0)
    const regex = /^0[6-8][0-9]{8}$/;
    return regex.test(number);
  };

  const handlePurchase = () => {
    // Validation
    if (!phoneNumber.trim()) {
      Toast.show({
        type: "error",
        text1: "Phone number required",
        text2: "Please enter a phone number",
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Toast.show({
        type: "error",
        text1: "Invalid phone number",
        text2: "Please enter a valid SA phone number (e.g., 0821234567)",
      });
      return;
    }

    const finalAmount = amount || parseFloat(customAmount);
    if (!finalAmount || finalAmount < 5) {
      Toast.show({
        type: "error",
        text1: "Invalid amount",
        text2: "Minimum amount is R5",
      });
      return;
    }

    if (finalAmount > 1000) {
      Toast.show({
        type: "error",
        text1: "Amount too high",
        text2: "Maximum amount is R1000",
      });
      return;
    }

    // Show confirmation
    const networkName = NETWORK_PROVIDERS.find((n) => n.value === network)?.label;
    Alert.alert(
      "Confirm Purchase",
      `Buy R${finalAmount} ${networkName} airtime for ${phoneNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setLoading(true);
            try {
              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 2000));

              Toast.show({
                type: "success",
                text1: "Airtime Purchased!",
                text2: `R${finalAmount} airtime sent to ${phoneNumber}`,
              });

              // Reset form
              setPhoneNumber("");
              setAmount(null);
              setCustomAmount("");

              // Navigate back after a delay
              setTimeout(() => router.back(), 1500);
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Purchase Failed",
                text2: error.message || "Please try again",
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6 pt-2">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-primary">Buy Airtime</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Instant airtime for all SA networks
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface items-center justify-center ml-3"
          >
            <IconSymbol name="xmark" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View className="gap-5">
          {/* Network Provider */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Network Provider *
            </Text>
            <View className="bg-surface rounded-xl overflow-hidden border border-border">
              <Picker
                selectedValue={network}
                onValueChange={setNetwork}
                style={{ color: colors.foreground }}
              >
                {NETWORK_PROVIDERS.map((provider) => (
                  <Picker.Item
                    key={provider.value}
                    label={provider.label}
                    value={provider.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Phone Number */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Phone Number *
            </Text>
            <View className="bg-surface rounded-xl px-4 py-3 flex-row items-center border border-border">
              <IconSymbol name="phone.fill" size={20} color={colors.mutedForeground} />
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="0821234567"
                placeholderTextColor={colors.mutedForeground}
                className="flex-1 ml-3 text-foreground"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            <Text className="text-xs text-muted-foreground mt-1">
              Enter 10-digit SA mobile number
            </Text>
          </View>

          {/* Quick Amount Selection */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-3">
              Select Amount *
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {AIRTIME_AMOUNTS.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    setAmount(item.value);
                    setCustomAmount("");
                  }}
                  className={`px-6 py-3 rounded-xl border-2 ${
                    amount === item.value
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                  style={{ width: "30%" }}
                >
                  <Text
                    className={`text-center font-bold ${
                      amount === item.value
                        ? "text-primary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Amount */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Or Enter Custom Amount
            </Text>
            <View className="bg-surface rounded-xl px-4 py-3 flex-row items-center border border-border">
              <Text className="text-foreground font-semibold">R</Text>
              <TextInput
                value={customAmount}
                onChangeText={(value) => {
                  setCustomAmount(value);
                  setAmount(null);
                }}
                placeholder="0.00"
                placeholderTextColor={colors.mutedForeground}
                className="flex-1 ml-2 text-foreground"
                keyboardType="numeric"
              />
            </View>
            <Text className="text-xs text-muted-foreground mt-1">
              Min: R5 | Max: R1000
            </Text>
          </View>

          {/* Summary */}
          {(amount || customAmount) && phoneNumber && (
            <View className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Purchase Summary
              </Text>
              <View className="gap-1">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Network:</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {NETWORK_PROVIDERS.find((n) => n.value === network)?.label}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Number:</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {phoneNumber}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Amount:</Text>
                  <Text className="text-lg font-bold text-primary">
                    R{amount || customAmount}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Purchase Button */}
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={loading}
            className={`bg-primary py-4 rounded-xl items-center mt-2 ${
              loading ? "opacity-50" : ""
            }`}
          >
            <Text className="text-primary-foreground font-bold text-lg">
              {loading ? "Processing..." : "Buy Airtime"}
            </Text>
          </TouchableOpacity>

          {/* Info */}
          <View className="bg-muted rounded-xl p-4">
            <View className="flex-row items-start gap-2">
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <Text className="flex-1 text-xs text-muted-foreground">
                Airtime will be delivered instantly to the specified number. Ensure the
                number is correct before confirming.
              </Text>
            </View>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
