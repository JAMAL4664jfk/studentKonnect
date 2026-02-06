import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { Picker } from "@react-native-picker/picker";

const PAYMENT_METHODS = [
  { value: "", label: "Select payment method" },
  { value: "KonnectID", label: "KonnectID (Scholar Fin Hub Wallet)" },
  { value: "Standard Bank", label: "Standard Bank" },
  { value: "FNB", label: "FNB" },
  { value: "Absa", label: "Absa" },
  { value: "Nedbank", label: "Nedbank" },
  { value: "Capitec", label: "Capitec" },
  { value: "M-Pesa", label: "M-Pesa" },
  { value: "MTN MoMo", label: "MTN MoMo" },
  { value: "Airtel Money", label: "Airtel Money" },
];

const TRANSFER_TYPES = [
  { value: "normal", label: "Normal (1-2 business days)" },
  { value: "immediate", label: "Immediate (within minutes)" },
];

const QUICK_AMOUNTS = [50, 100, 200, 500];

export default function SendMoneyScreen() {
  const router = useRouter();
  const colors = useColors();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [paymentMethod, setPaymentMethod] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [transferType, setTransferType] = useState("normal");

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await safeGetUser();
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

  const getRecipientLabel = () => {
    if (paymentMethod === "KonnectID") return "KonnectID or Student ID";
    if (["Standard Bank", "FNB", "Absa", "Nedbank", "Capitec"].includes(paymentMethod))
      return "Account Number";
    if (["M-Pesa", "MTN MoMo", "Airtel Money"].includes(paymentMethod))
      return "Mobile Number";
    return "Recipient";
  };

  const getRecipientPlaceholder = () => {
    if (paymentMethod === "KonnectID") return "Enter KonnectID or Student ID";
    if (["Standard Bank", "FNB", "Absa", "Nedbank", "Capitec"].includes(paymentMethod))
      return "Enter account number";
    if (["M-Pesa", "MTN MoMo", "Airtel Money"].includes(paymentMethod))
      return "e.g., 0712345678";
    return "Select payment method first";
  };

  const isBankTransfer = ["Standard Bank", "FNB", "Absa", "Nedbank", "Capitec"].includes(
    paymentMethod
  );

  const handleSubmit = async () => {
    if (!paymentMethod) {
      Toast.show({
        type: "error",
        text1: "Missing Payment Method",
        text2: "Please select a payment method",
      });
      return;
    }

    if (!recipient.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Recipient",
        text2: `Please enter ${getRecipientLabel()}`,
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue < 10) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Minimum amount is R10",
      });
      return;
    }

    if (amountValue > balance) {
      Toast.show({
        type: "error",
        text1: "Insufficient Balance",
        text2: "You don't have enough funds in your wallet",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await safeGetUser();
      if (!user) return;

      // Deduct from wallet
      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: balance - amountValue })
        .eq("user_id", user.id);

      if (walletError) throw walletError;

      // Record transaction
      const transferTypeLabel = transferType === "immediate" ? "Immediate" : "Normal";
      const description = `P2P transfer to ${recipient} via ${paymentMethod}${
        isBankTransfer ? ` (${transferTypeLabel})` : ""
      }${reference ? ` - ${reference}` : ""}`;

      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "Transfer",
        amount: -amountValue,
        description,
        status: "completed",
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Transfer Successful",
        text2: `Sent R${amountValue.toFixed(2)} to ${recipient}`,
      });

      // Reset form
      setPaymentMethod("");
      setRecipient("");
      setAmount("");
      setReference("");
      setTransferType("normal");
      fetchBalance();
    } catch (error) {
      console.error("Error sending money:", error);
      Toast.show({
        type: "error",
        text1: "Transfer Failed",
        text2: "Failed to send money. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
          <Text className="text-2xl font-bold text-foreground">Send Money</Text>
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

          {/* Form */}
          <View className="gap-5">
            {/* Payment Method */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Payment Method *
              </Text>
              <View
                className="bg-surface rounded-xl border border-border"
                style={{ overflow: "hidden" }}
              >
                <Picker
                  selectedValue={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value)}
                  style={{ color: colors.foreground }}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <Picker.Item
                      key={method.value}
                      label={method.label}
                      value={method.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Bank Transfer Type */}
            {isBankTransfer && (
              <View className="bg-surface rounded-xl p-4 border border-border">
                <Text className="text-sm font-semibold text-foreground mb-3">
                  Transfer Type *
                </Text>
                <View
                  className="bg-background rounded-xl border border-border"
                  style={{ overflow: "hidden" }}
                >
                  <Picker
                    selectedValue={transferType}
                    onValueChange={(value) => setTransferType(value)}
                    style={{ color: colors.foreground }}
                  >
                    {TRANSFER_TYPES.map((type) => (
                      <Picker.Item key={type.value} label={type.label} value={type.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Recipient */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                {getRecipientLabel()} *
              </Text>
              <TextInput
                value={recipient}
                onChangeText={setRecipient}
                placeholder={getRecipientPlaceholder()}
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-xl px-4 py-3 text-foreground"
                editable={!!paymentMethod}
              />
              {paymentMethod && (
                <Text className="text-xs text-muted mt-1">
                  {paymentMethod === "KonnectID" &&
                    "Enter the recipient's KonnectID or Student ID number"}
                  {isBankTransfer && "Enter the recipient's bank account number"}
                  {["M-Pesa", "MTN MoMo", "Airtel Money"].includes(paymentMethod) &&
                    "Enter the recipient's registered mobile number"}
                </Text>
              )}
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
              <View className="flex-row gap-2 mt-2">
                {QUICK_AMOUNTS.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    onPress={() => setAmount(quickAmount.toString())}
                    className="flex-1 py-2 rounded-lg border border-border"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text className="text-center text-sm font-semibold text-foreground">
                      R{quickAmount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text className="text-xs text-muted mt-2">
                Min: R10 | Max: R{balance.toFixed(2)}
                {paymentMethod === "KonnectID" && " • Zero fees"}
              </Text>
            </View>

            {/* Reference */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Reference (Optional)
              </Text>
              <TextInput
                value={reference}
                onChangeText={setReference}
                placeholder="What's this for?"
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-xl px-4 py-3 text-foreground"
                maxLength={100}
              />
            </View>

            {/* Info Card */}
            {paymentMethod && (
              <View
                className="rounded-xl p-4"
                style={{ backgroundColor: `${colors.success}20`, borderWidth: 2, borderColor: `${colors.success}50` }}
              >
                <Text className="text-sm font-bold text-foreground mb-1">
                  {paymentMethod === "KonnectID" && "Instant Transfer • Zero Fees"}
                  {["M-Pesa", "MTN MoMo", "Airtel Money"].includes(paymentMethod) &&
                    "Instant Mobile Money Transfer"}
                  {isBankTransfer && "Secure Bank Transfer"}
                </Text>
                <Text className="text-xs text-muted">
                  {paymentMethod === "KonnectID" &&
                    "Money arrives instantly to Scholar Fin Hub wallets. Available 24/7. No hidden charges."}
                  {["M-Pesa", "MTN MoMo", "Airtel Money"].includes(paymentMethod) &&
                    "Mobile money transfers are processed instantly and securely."}
                  {isBankTransfer &&
                    (transferType === "immediate"
                      ? "Immediate transfers arrive within minutes with higher fees."
                      : "Normal transfers are processed within 1-2 business days with standard fees.")}
                </Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!paymentMethod || submitting}
              className="py-4 rounded-full mt-2"
              style={{
                backgroundColor: !paymentMethod || submitting ? colors.muted : colors.primary,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-center text-white font-semibold text-base">
                  Send Money
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
