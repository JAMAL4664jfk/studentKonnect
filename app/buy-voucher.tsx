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

const VOUCHER_TYPES = [
  { label: "Betting Vouchers", value: "betting" },
  { label: "Gaming Vouchers", value: "gaming" },
  { label: "Shopping Vouchers", value: "shopping" },
];

const BETTING_SITES = [
  { label: "Hollywoodbets", value: "hollywoodbets" },
  { label: "Betway", value: "betway" },
  { label: "Supabets", value: "supabets" },
  { label: "Sportingbet", value: "sportingbet" },
  { label: "Playabets", value: "playabets" },
  { label: "Gbets", value: "gbets" },
  { label: "Bet.co.za", value: "betcoza" },
];

const GAMING_PLATFORMS = [
  { label: "PlayStation Store", value: "playstation" },
  { label: "Xbox Store", value: "xbox" },
  { label: "Steam", value: "steam" },
  { label: "Google Play", value: "googleplay" },
  { label: "Apple App Store", value: "appstore" },
];

const SHOPPING_STORES = [
  { label: "Takealot", value: "takealot" },
  { label: "Makro", value: "makro" },
  { label: "Game", value: "game" },
  { label: "Woolworths", value: "woolworths" },
  { label: "Pick n Pay", value: "picknpay" },
  { label: "Checkers", value: "checkers" },
];

const QUICK_AMOUNTS = [
  { label: "R50", value: 50 },
  { label: "R100", value: 100 },
  { label: "R200", value: 200 },
  { label: "R500", value: 500 },
  { label: "R1000", value: 1000 },
  { label: "R2000", value: 2000 },
];

export default function BuyVoucherScreen() {
  const colors = useColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [voucherType, setVoucherType] = useState("betting");
  const [provider, setProvider] = useState("hollywoodbets");
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [email, setEmail] = useState("");

  const getProviderOptions = () => {
    switch (voucherType) {
      case "betting":
        return BETTING_SITES;
      case "gaming":
        return GAMING_PLATFORMS;
      case "shopping":
        return SHOPPING_STORES;
      default:
        return BETTING_SITES;
    }
  };

  const handlePurchase = () => {
    if (!email.trim() || !email.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Valid email required",
        text2: "Voucher will be sent to this email",
      });
      return;
    }

    const finalAmount = amount || parseFloat(customAmount);
    if (!finalAmount || finalAmount < 20) {
      Toast.show({
        type: "error",
        text1: "Invalid amount",
        text2: "Minimum amount is R20",
      });
      return;
    }

    if (finalAmount > 10000) {
      Toast.show({
        type: "error",
        text1: "Amount too high",
        text2: "Maximum amount is R10,000",
      });
      return;
    }

    const providerName = getProviderOptions().find((p) => p.value === provider)?.label;
    const typeName = VOUCHER_TYPES.find((t) => t.value === voucherType)?.label;

    Alert.alert(
      "Confirm Purchase",
      `Buy R${finalAmount} ${providerName} voucher?\n\nType: ${typeName}\nEmail: ${email}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setLoading(true);
            try {
              await new Promise((resolve) => setTimeout(resolve, 2000));

              // Simulate voucher code generation
              const voucherCode = Math.random().toString(36).substring(2, 15).toUpperCase();
              const pin = Math.floor(1000 + Math.random() * 9000);

              Toast.show({
                type: "success",
                text1: "Voucher Purchased!",
                text2: `Code: ${voucherCode}`,
                visibilityTime: 8000,
              });

              Alert.alert(
                "Voucher Details",
                `${providerName} Voucher\n\nCode: ${voucherCode}\nPIN: ${pin}\nAmount: R${finalAmount}\n\nVoucher details have been sent to ${email}`,
                [{ text: "OK" }]
              );

              setAmount(null);
              setCustomAmount("");
              setEmail("");
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Purchase Failed",
                text2: error.message,
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
            <Text className="text-3xl font-bold text-primary">Buy Voucher</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Betting, gaming, and shopping vouchers
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
          {/* Voucher Type */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Voucher Type *
            </Text>
            <View className="bg-surface rounded-xl overflow-hidden border border-border">
              <Picker
                selectedValue={voucherType}
                onValueChange={(value) => {
                  setVoucherType(value);
                  // Reset provider when type changes
                  if (value === "betting") setProvider("hollywoodbets");
                  else if (value === "gaming") setProvider("playstation");
                  else setProvider("takealot");
                }}
                style={{ color: colors.foreground }}
              >
                {VOUCHER_TYPES.map((type) => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Provider */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Select Provider *
            </Text>
            <View className="bg-surface rounded-xl overflow-hidden border border-border">
              <Picker
                selectedValue={provider}
                onValueChange={setProvider}
                style={{ color: colors.foreground }}
              >
                {getProviderOptions().map((prov) => (
                  <Picker.Item key={prov.value} label={prov.label} value={prov.value} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Email */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Email Address *
            </Text>
            <View className="bg-surface rounded-xl px-4 py-3 flex-row items-center border border-border">
              <IconSymbol name="envelope.fill" size={20} color={colors.mutedForeground} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.mutedForeground}
                className="flex-1 ml-3 text-foreground"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <Text className="text-xs text-muted-foreground mt-1">
              Voucher details will be sent to this email
            </Text>
          </View>

          {/* Quick Amount Selection */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-3">
              Select Amount *
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {QUICK_AMOUNTS.map((item) => (
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
              Min: R20 | Max: R10,000
            </Text>
          </View>

          {/* Summary */}
          {(amount || customAmount) && email && (
            <View className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Purchase Summary
              </Text>
              <View className="gap-1">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Type:</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {VOUCHER_TYPES.find((t) => t.value === voucherType)?.label}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Provider:</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {getProviderOptions().find((p) => p.value === provider)?.label}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Email:</Text>
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                    {email}
                  </Text>
                </View>
                <View className="flex-row justify-between mt-2 pt-2 border-t border-border">
                  <Text className="text-sm font-semibold text-foreground">Amount:</Text>
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
              {loading ? "Processing..." : "Buy Voucher"}
            </Text>
          </TouchableOpacity>

          {/* Info */}
          <View className="bg-muted rounded-xl p-4">
            <View className="flex-row items-start gap-2">
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <Text className="flex-1 text-xs text-muted-foreground">
                Voucher code and PIN will be displayed immediately and sent to your email.
                Keep them safe and do not share with anyone.
              </Text>
            </View>
          </View>

          {/* Age Warning for Betting */}
          {voucherType === "betting" && (
            <View className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
              <View className="flex-row items-start gap-2">
                <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#EAB308" />
                <Text className="flex-1 text-xs text-yellow-600">
                  ⚠️ You must be 18+ to purchase betting vouchers. Gamble responsibly.
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
