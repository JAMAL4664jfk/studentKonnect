import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useWallet } from "@/contexts/WalletContext";
import Toast from "react-native-toast-message";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

type MoreOptionsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function MoreOptionsModal({ visible, onClose }: MoreOptionsModalProps) {
  const colors = useColors();
  const router = useRouter();
  const { balance, deductFromBalance } = useWallet();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [meterNumber, setMeterNumber] = useState("");

  const quickActions = [
    {
      id: "airtime",
      title: "Buy Airtime",
      subtitle: "Instant delivery",
      image: require("@/assets/images/send-money-bg.jpg"),
    },
    {
      id: "data",
      title: "Buy Data",
      subtitle: "All networks",
      image: require("@/assets/images/pay-merchant-bg.jpg"),
    },
    {
      id: "electricity",
      title: "Buy Electricity",
      subtitle: "Prepaid tokens",
      image: require("@/assets/images/savings-bg.jpg"),
    },
    {
      id: "betting",
      title: "Betting Vouchers",
      subtitle: "All bookmakers",
      image: require("@/assets/images/marketplace-bg.jpg"),
    },
    {
      id: "giftcards",
      title: "Gift Cards",
      subtitle: "Top brands",
      image: require("@/assets/images/accommodation-bg.jpg"),
    },
    {
      id: "streaming",
      title: "Content Cards",
      subtitle: "Netflix, Showmax",
      image: require("@/assets/images/career-bg.jpg"),
    },
    {
      id: "studymaterial",
      title: "Study Material",
      subtitle: "Books & stationery",
      image: require("@/assets/images/career-bg.jpg"),
    },
    {
      id: "savings",
      title: "Savings Pockets",
      subtitle: "Goal-based saving",
      image: require("@/assets/images/wellness-bg.jpg"),
    },
    {
      id: "digitalconnect",
      title: "Digital Connect",
      subtitle: "Buy tech & textbooks",
      image: require("@/assets/images/loans-bg.jpg"),
    },

    {
      id: "tutoring",
      title: "Tutoring",
      subtitle: "Find tutors or offer tutoring",
      image: require("@/assets/images/hero-student-connect.jpg"),
    },
    {
      id: "loans",
      title: "Student Loans",
      subtitle: "Apply for student loans",
      image: require("@/assets/images/wallet-bg.jpg"),
    },
  ];

  const handleActionPress = (actionId: string) => {
    if (actionId === "digitalconnect") {
      onClose();
      router.push("/digital-connect" as any);
      return;
    }
    if (actionId === "studymaterial") {
      onClose();
      router.push("/study-material" as any);
      return;
    }
    if (actionId === "tutoring") {
      onClose();
      router.push("/tutoring" as any);
      return;
    }
    if (actionId === "loans") {
      onClose();
      router.push("/loans" as any);
      return;
    }
    setSelectedAction(actionId);
    setAmount("");
    setPhoneNumber("");
    setMeterNumber("");
  };

  const handlePurchase = () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Please enter a valid amount",
      });
      return;
    }

    if (amountNum > balance) {
      Toast.show({
        type: "error",
        text1: "Insufficient Funds",
        text2: "Your balance is too low",
      });
      return;
    }

    if (selectedAction === "airtime" || selectedAction === "data") {
      if (!phoneNumber || phoneNumber.length < 10) {
        Toast.show({
          type: "error",
          text1: "Invalid Phone Number",
          text2: "Please enter a valid phone number",
        });
        return;
      }
    }

    if (selectedAction === "electricity") {
      if (!meterNumber) {
        Toast.show({
          type: "error",
          text1: "Invalid Meter Number",
          text2: "Please enter your meter number",
        });
        return;
      }
    }

    deductFromBalance(amountNum);
    Toast.show({
      type: "success",
      text1: "Purchase Successful",
      text2: `R${amountNum.toFixed(2)} ${getActionTitle(selectedAction!)}`,
    });
    setSelectedAction(null);
    setAmount("");
    setPhoneNumber("");
    setMeterNumber("");
  };

  const getActionTitle = (actionId: string) => {
    const action = quickActions.find((a) => a.id === actionId);
    return action?.title || "";
  };

  const renderActionForm = () => {
    if (!selectedAction) return null;

    return (
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-bold text-foreground">
            {getActionTitle(selectedAction)}
          </Text>
          <TouchableOpacity onPress={() => setSelectedAction(null)}>
            <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <View className="gap-4">
          {/* Balance Display */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted mb-1">Available Balance</Text>
            <Text className="text-2xl font-bold text-primary">
              R{balance.toFixed(2)}
            </Text>
          </View>

          {/* Phone Number for Airtime/Data */}
          {(selectedAction === "airtime" || selectedAction === "data") && (
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Phone Number
              </Text>
              <View className="flex-row items-center gap-3 rounded-2xl px-4 py-3 bg-surface border border-border">
                <IconSymbol name="phone.fill" size={20} color={colors.muted} />
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="0XX XXX XXXX"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  className="flex-1 text-foreground text-base"
                />
              </View>
            </View>
          )}

          {/* Meter Number for Electricity */}
          {selectedAction === "electricity" && (
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Meter Number
              </Text>
              <View className="flex-row items-center gap-3 rounded-2xl px-4 py-3 bg-surface border border-border">
                <IconSymbol name="bolt.fill" size={20} color={colors.muted} />
                <TextInput
                  value={meterNumber}
                  onChangeText={setMeterNumber}
                  placeholder="Enter meter number"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  className="flex-1 text-foreground text-base"
                />
              </View>
            </View>
          )}

          {/* Amount */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Amount</Text>
            <View className="flex-row items-center gap-3 rounded-2xl px-4 py-3 bg-surface border border-border">
              <Text className="text-foreground font-semibold">R</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                className="flex-1 text-foreground text-base"
              />
            </View>
          </View>

          {/* Purchase Button */}
          <TouchableOpacity
            onPress={handlePurchase}
            className="bg-primary rounded-2xl p-4 items-center active:opacity-70 mt-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-white text-base font-semibold">
              Purchase Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          className="bg-background rounded-t-3xl"
          style={{
            maxHeight: "90%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {selectedAction ? (
            <ScrollView>{renderActionForm()}</ScrollView>
          ) : (
            <ScrollView>
              <View className="p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-2xl font-bold text-foreground">
                    More Options
                  </Text>
                  <TouchableOpacity onPress={onClose}>
                    <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
                  </TouchableOpacity>
                </View>

                <View className="gap-3">
                  {quickActions.map((action) => (
                    <TouchableOpacity
                      key={action.id}
                      onPress={() => handleActionPress(action.id)}
                      className="rounded-2xl overflow-hidden active:opacity-90"
                      style={{
                        height: 100,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      <Image
                        source={action.image}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                      <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
                        <View className="bg-black/60 px-6 py-3 rounded-full">
                          <Text className="text-white text-base font-bold text-center">
                            {action.title}
                          </Text>
                          <Text className="text-white/80 text-xs text-center mt-1">
                            {action.subtitle}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
