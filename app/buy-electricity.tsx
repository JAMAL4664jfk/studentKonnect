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

const MUNICIPALITIES = [
  { label: "City of Cape Town", value: "cape_town" },
  { label: "City of Johannesburg", value: "johannesburg" },
  { label: "City of Tshwane (Pretoria)", value: "tshwane" },
  { label: "eThekwini (Durban)", value: "ethekwini" },
  { label: "Ekurhuleni", value: "ekurhuleni" },
  { label: "Nelson Mandela Bay", value: "nelson_mandela_bay" },
  { label: "Buffalo City", value: "buffalo_city" },
  { label: "Mangaung", value: "mangaung" },
  { label: "Eskom Prepaid", value: "eskom" },
];

const QUICK_AMOUNTS = [
  { label: "R50", value: 50 },
  { label: "R100", value: 100 },
  { label: "R200", value: 200 },
  { label: "R300", value: 300 },
  { label: "R500", value: 500 },
  { label: "R1000", value: 1000 },
];

export default function BuyElectricityScreen() {
  const colors = useColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [municipality, setMunicipality] = useState("cape_town");
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const validateMeterNumber = (number: string): boolean => {
    // Most SA meter numbers are 11-20 digits
    return number.length >= 11 && number.length <= 20 && /^\d+$/.test(number);
  };

  const handlePurchase = () => {
    if (!meterNumber.trim()) {
      Toast.show({
        type: "error",
        text1: "Meter number required",
      });
      return;
    }

    if (!validateMeterNumber(meterNumber)) {
      Toast.show({
        type: "error",
        text1: "Invalid meter number",
        text2: "Please enter a valid meter number (11-20 digits)",
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

    if (finalAmount > 5000) {
      Toast.show({
        type: "error",
        text1: "Amount too high",
        text2: "Maximum amount is R5000",
      });
      return;
    }

    const municipalityName = MUNICIPALITIES.find((m) => m.value === municipality)?.label;
    Alert.alert(
      "Confirm Purchase",
      `Buy R${finalAmount} electricity from ${municipalityName}?\n\nMeter: ${meterNumber}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setLoading(true);
            try {
              await new Promise((resolve) => setTimeout(resolve, 2500));

              // Simulate token generation
              const token = Math.random().toString().slice(2, 22).match(/.{1,4}/g)?.join("-");

              Toast.show({
                type: "success",
                text1: "Electricity Purchased!",
                text2: `Token: ${token}`,
                visibilityTime: 8000,
              });

              // Show token in alert for easy copying
              Alert.alert(
                "Electricity Token",
                `Your electricity token:\n\n${token}\n\nMeter: ${meterNumber}\nAmount: R${finalAmount}`,
                [{ text: "OK" }]
              );

              setMeterNumber("");
              setAmount(null);
              setCustomAmount("");
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
            <Text className="text-3xl font-bold text-primary">Buy Electricity</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Prepaid electricity for all SA municipalities
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
          {/* Municipality */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Municipality / Supplier *
            </Text>
            <View className="bg-surface rounded-xl overflow-hidden border border-border">
              <Picker
                selectedValue={municipality}
                onValueChange={setMunicipality}
                style={{ color: colors.foreground }}
              >
                {MUNICIPALITIES.map((muni) => (
                  <Picker.Item key={muni.value} label={muni.label} value={muni.value} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Meter Number */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Meter Number *
            </Text>
            <View className="bg-surface rounded-xl px-4 py-3 flex-row items-center border border-border">
              <IconSymbol name="bolt.fill" size={20} color={colors.mutedForeground} />
              <TextInput
                value={meterNumber}
                onChangeText={setMeterNumber}
                placeholder="Enter your meter number"
                placeholderTextColor={colors.mutedForeground}
                className="flex-1 ml-3 text-foreground"
                keyboardType="numeric"
                maxLength={20}
              />
            </View>
            <Text className="text-xs text-muted-foreground mt-1">
              Usually 11-20 digits (check your meter or previous receipt)
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
              Min: R20 | Max: R5000
            </Text>
          </View>

          {/* Summary */}
          {(amount || customAmount) && meterNumber && (
            <View className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Purchase Summary
              </Text>
              <View className="gap-1">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Supplier:</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {MUNICIPALITIES.find((m) => m.value === municipality)?.label}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Meter:</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {meterNumber}
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
              {loading ? "Processing..." : "Buy Electricity"}
            </Text>
          </TouchableOpacity>

          {/* Info */}
          <View className="bg-muted rounded-xl p-4">
            <View className="flex-row items-start gap-2">
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <Text className="flex-1 text-xs text-muted-foreground">
                Your electricity token will be displayed immediately after purchase. Make sure
                to save or write it down before closing this screen.
              </Text>
            </View>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
