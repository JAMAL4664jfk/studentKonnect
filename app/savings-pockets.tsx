import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";

interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  icon: string;
  color: string;
  created_at: string;
}

const ICON_OPTIONS = [
  { key: "laptop", label: "Laptop", icon: "laptopcomputer" },
  { key: "smartphone", label: "Phone", icon: "iphone" },
  { key: "plane", label: "Travel", icon: "airplane" },
  { key: "book", label: "Books", icon: "book.fill" },
  { key: "home", label: "Home", icon: "house.fill" },
  { key: "target", label: "Goal", icon: "target" },
];

export default function SavingsPocketsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Create goal form
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("target");

  // Deposit form
  const [depositAmount, setDepositAmount] = useState("");

  useEffect(() => {
    fetchGoals();
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
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
  };

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!goalName.trim() || !targetAmount) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all fields",
      });
      return;
    }

    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Please enter a valid target amount",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("savings_goals").insert({
        user_id: user.id,
        name: goalName.trim(),
        target_amount: amount,
        current_amount: 0,
        icon: selectedIcon,
        color: "from-primary to-accent",
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Goal Created",
        text2: `${goalName} savings goal created successfully`,
      });

      setShowCreateModal(false);
      setGoalName("");
      setTargetAmount("");
      setSelectedIcon("target");
      fetchGoals();
    } catch (error) {
      console.error("Error creating goal:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to create savings goal",
      });
    }
  };

  const handleAddFunds = async () => {
    if (!selectedGoal || !depositAmount) {
      Toast.show({
        type: "error",
        text1: "Missing Amount",
        text2: "Please enter an amount to deposit",
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Please enter a valid amount",
      });
      return;
    }

    if (amount > balance) {
      Toast.show({
        type: "error",
        text1: "Insufficient Balance",
        text2: "You don't have enough funds in your wallet",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Deduct from wallet
      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: balance - amount })
        .eq("user_id", user.id);

      if (walletError) throw walletError;

      // Add to savings goal
      const newAmount = selectedGoal.current_amount + amount;
      const { error: goalError } = await supabase
        .from("savings_goals")
        .update({ current_amount: newAmount })
        .eq("id", selectedGoal.id);

      if (goalError) throw goalError;

      // Record transaction
      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "Savings",
        amount: -amount,
        description: `Added to savings goal: ${selectedGoal.name}`,
        status: "completed",
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Funds Added",
        text2: `R${amount.toFixed(2)} added to ${selectedGoal.name}`,
      });

      setShowDepositModal(false);
      setDepositAmount("");
      setSelectedGoal(null);
      fetchGoals();
      fetchBalance();
    } catch (error) {
      console.error("Error adding funds:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to add funds",
      });
    }
  };

  const renderGoal = ({ item }: { item: SavingsGoal }) => {
    const percentage = Math.min((item.current_amount / item.target_amount) * 100, 100);
    const remaining = item.target_amount - item.current_amount;
    const isComplete = percentage >= 100;

    return (
      <View
        className="bg-surface rounded-2xl p-5 mb-4"
        style={{
          borderWidth: isComplete ? 2 : 1,
          borderColor: isComplete ? colors.success : colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-row items-center gap-3 flex-1">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <IconSymbol
                name={ICON_OPTIONS.find((opt) => opt.key === item.icon)?.icon || "target"}
                size={24}
                color="#FFFFFF"
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-foreground">{item.name}</Text>
              <Text className="text-sm text-muted">
                R{item.current_amount.toLocaleString()} / R{item.target_amount.toLocaleString()}
              </Text>
            </View>
          </View>
          {isComplete && (
            <View className="bg-success px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">Complete!</Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium text-foreground">Progress</Text>
            <Text className="text-sm font-bold" style={{ color: colors.primary }}>
              {percentage.toFixed(0)}%
            </Text>
          </View>
          <View className="h-3 bg-border rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${percentage}%`,
                backgroundColor: isComplete ? colors.success : colors.primary,
              }}
            />
          </View>
        </View>

        {/* Status Message */}
        <View
          className="p-3 rounded-lg mb-3"
          style={{
            backgroundColor: isComplete ? `${colors.success}20` : `${colors.primary}20`,
          }}
        >
          {isComplete ? (
            <Text className="text-sm font-semibold" style={{ color: colors.success }}>
              🏆 Goal Achieved!
            </Text>
          ) : (
            <>
              <Text className="text-sm font-semibold text-foreground">
                You're {percentage.toFixed(0)}% of the way to your {item.name.toLowerCase()}!
              </Text>
              <Text className="text-xs text-muted mt-1">
                Only R{remaining.toLocaleString()} more to go
              </Text>
            </>
          )}
        </View>

        {/* Action Button */}
        {!isComplete && (
          <TouchableOpacity
            onPress={() => {
              setSelectedGoal(item);
              setShowDepositModal(true);
            }}
            className="py-3 rounded-full border-2"
            style={{
              borderColor: colors.primary,
              opacity: 1,
            }}
          >
            <Text className="text-center font-semibold" style={{ color: colors.primary }}>
              Add Funds to Goal
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
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
          <Text className="text-2xl font-bold text-foreground">Savings Pockets</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View className="p-4">
        <View
          className="bg-surface rounded-2xl p-5"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text className="text-sm text-muted mb-1">Available Balance</Text>
          <Text className="text-3xl font-bold text-foreground">R{balance.toFixed(2)}</Text>
        </View>
      </View>

      {/* Goals List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : goals.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <IconSymbol name="target" size={64} color={colors.muted} />
          <Text className="text-xl font-bold text-foreground mt-4">No Savings Goals Yet</Text>
          <Text className="text-sm text-muted text-center mt-2 mb-6">
            Create your first savings goal to start tracking your progress
          </Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-semibold">Create Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoal}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      {/* Create Goal Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            className="bg-background rounded-t-3xl p-6"
            style={{ maxHeight: "90%" }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">Create Savings Goal</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Goal Name</Text>
                  <TextInput
                    value={goalName}
                    onChangeText={setGoalName}
                    placeholder="e.g., New Laptop"
                    placeholderTextColor={colors.muted}
                    className="bg-surface rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Target Amount (R)</Text>
                  <TextInput
                    value={targetAmount}
                    onChangeText={setTargetAmount}
                    placeholder="15000"
                    keyboardType="numeric"
                    placeholderTextColor={colors.muted}
                    className="bg-surface rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Icon</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {ICON_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.key}
                        onPress={() => setSelectedIcon(option.key)}
                        className="w-16 h-16 rounded-xl items-center justify-center"
                        style={{
                          backgroundColor:
                            selectedIcon === option.key ? colors.primary : colors.surface,
                          borderWidth: 2,
                          borderColor:
                            selectedIcon === option.key ? colors.primary : colors.border,
                        }}
                      >
                        <IconSymbol
                          name={option.icon}
                          size={24}
                          color={selectedIcon === option.key ? "#FFFFFF" : colors.foreground}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleCreateGoal}
                  className="py-4 rounded-full mt-4"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-center text-white font-semibold text-base">
                    Create Goal
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        visible={showDepositModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">
                Add Funds to {selectedGoal?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <View className="bg-surface rounded-xl p-4">
                <Text className="text-sm text-muted">Available Balance</Text>
                <Text className="text-2xl font-bold text-foreground">R{balance.toFixed(2)}</Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Amount to Add (R)
                </Text>
                <TextInput
                  value={depositAmount}
                  onChangeText={setDepositAmount}
                  placeholder="500"
                  keyboardType="numeric"
                  placeholderTextColor={colors.muted}
                  className="bg-surface rounded-xl px-4 py-3 text-foreground"
                />
              </View>

              <TouchableOpacity
                onPress={handleAddFunds}
                className="py-4 rounded-full"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-center text-white font-semibold text-base">
                  Add Funds
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
