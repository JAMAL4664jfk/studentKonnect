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
  { label: "Vodacom", value: "vodacom" },
  { label: "MTN", value: "mtn" },
  { label: "Cell C", value: "cellc" },
  { label: "Telkom Mobile", value: "telkom" },
  { label: "Rain", value: "rain" },
];

const DATA_BUNDLES = {
  vodacom: [
    { size: "500MB", validity: "1 day", price: 29 },
    { size: "1GB", validity: "7 days", price: 49 },
    { size: "2GB", validity: "30 days", price: 99 },
    { size: "5GB", validity: "30 days", price: 149 },
    { size: "10GB", validity: "30 days", price: 249 },
    { size: "20GB", validity: "30 days", price: 399 },
    { size: "50GB", validity: "30 days", price: 799 },
  ],
  mtn: [
    { size: "500MB", validity: "1 day", price: 27 },
    { size: "1GB", validity: "7 days", price: 45 },
    { size: "2GB", validity: "30 days", price: 95 },
    { size: "5GB", validity: "30 days", price: 145 },
    { size: "10GB", validity: "30 days", price: 245 },
    { size: "20GB", validity: "30 days", price: 395 },
    { size: "50GB", validity: "30 days", price: 795 },
  ],
  cellc: [
    { size: "500MB", validity: "1 day", price: 25 },
    { size: "1GB", validity: "7 days", price: 42 },
    { size: "2GB", validity: "30 days", price: 89 },
    { size: "5GB", validity: "30 days", price: 139 },
    { size: "10GB", validity: "30 days", price: 239 },
    { size: "20GB", validity: "30 days", price: 379 },
    { size: "50GB", validity: "30 days", price: 759 },
  ],
  telkom: [
    { size: "500MB", validity: "1 day", price: 26 },
    { size: "1GB", validity: "7 days", price: 43 },
    { size: "2GB", validity: "30 days", price: 92 },
    { size: "5GB", validity: "30 days", price: 142 },
    { size: "10GB", validity: "30 days", price: 242 },
    { size: "20GB", validity: "30 days", price: 389 },
    { size: "50GB", validity: "30 days", price: 779 },
  ],
  rain: [
    { size: "1GB", validity: "30 days", price: 50 },
    { size: "5GB", validity: "30 days", price: 150 },
    { size: "10GB", validity: "30 days", price: 250 },
    { size: "20GB", validity: "30 days", price: 400 },
    { size: "50GB", validity: "30 days", price: 800 },
    { size: "Unlimited", validity: "30 days", price: 999 },
  ],
};

export default function BuyDataScreen() {
  const colors = useColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [network, setNetwork] = useState<keyof typeof DATA_BUNDLES>("vodacom");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedBundle, setSelectedBundle] = useState<typeof DATA_BUNDLES.vodacom[0] | null>(null);

  const validatePhoneNumber = (number: string): boolean => {
    const regex = /^0[6-8][0-9]{8}$/;
    return regex.test(number);
  };

  const handlePurchase = () => {
    if (!phoneNumber.trim()) {
      Toast.show({
        type: "error",
        text1: "Phone number required",
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Toast.show({
        type: "error",
        text1: "Invalid phone number",
        text2: "Please enter a valid SA phone number",
      });
      return;
    }

    if (!selectedBundle) {
      Toast.show({
        type: "error",
        text1: "Select a bundle",
      });
      return;
    }

    const networkName = NETWORK_PROVIDERS.find((n) => n.value === network)?.label;
    Alert.alert(
      "Confirm Purchase",
      `Buy ${selectedBundle.size} ${networkName} data for ${phoneNumber}?\n\nPrice: R${selectedBundle.price}\nValidity: ${selectedBundle.validity}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setLoading(true);
            try {
              await new Promise((resolve) => setTimeout(resolve, 2000));

              Toast.show({
                type: "success",
                text1: "Data Bundle Purchased!",
                text2: `${selectedBundle.size} sent to ${phoneNumber}`,
              });

              setPhoneNumber("");
              setSelectedBundle(null);
              setTimeout(() => router.back(), 1500);
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
            <Text className="text-3xl font-bold text-primary">Buy Data</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Data bundles for all SA networks
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
                onValueChange={(value) => {
                  setNetwork(value as keyof typeof DATA_BUNDLES);
                  setSelectedBundle(null);
                }}
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
          </View>

          {/* Data Bundles */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-3">
              Select Data Bundle *
            </Text>
            <View className="gap-3">
              {DATA_BUNDLES[network].map((bundle, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedBundle(bundle)}
                  className={`rounded-xl p-4 border-2 ${
                    selectedBundle === bundle
                      ? "bg-primary/10 border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        className={`text-lg font-bold ${
                          selectedBundle === bundle ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {bundle.size}
                      </Text>
                      <Text className="text-sm text-muted-foreground mt-1">
                        Valid for {bundle.validity}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-2xl font-bold text-primary">
                        R{bundle.price}
                      </Text>
                      {selectedBundle === bundle && (
                        <View className="mt-1">
                          <IconSymbol
                            name="checkmark.circle.fill"
                            size={24}
                            color={colors.primary}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Summary */}
          {selectedBundle && phoneNumber && (
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
                  <Text className="text-sm text-muted-foreground">Bundle:</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {selectedBundle.size} ({selectedBundle.validity})
                  </Text>
                </View>
                <View className="flex-row justify-between mt-2 pt-2 border-t border-border">
                  <Text className="text-sm font-semibold text-foreground">Total:</Text>
                  <Text className="text-lg font-bold text-primary">
                    R{selectedBundle.price}
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
              {loading ? "Processing..." : "Buy Data Bundle"}
            </Text>
          </TouchableOpacity>

          {/* Info */}
          <View className="bg-muted rounded-xl p-4">
            <View className="flex-row items-start gap-2">
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <Text className="flex-1 text-xs text-muted-foreground">
                Data bundles are delivered instantly. Check your phone for confirmation SMS.
              </Text>
            </View>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
