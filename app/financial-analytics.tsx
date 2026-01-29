import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useWallet } from "@/contexts/WalletContext";

export default function FinancialAnalyticsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { balance } = useWallet();
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Mock data for demonstration
  const stats = {
    income: 4500,
    expenses: 1254.50,
    savings: 3245.50,
    transactions: 42,
  };

  const categories = [
    { name: "Food & Dining", amount: 450, icon: "fork.knife", color: "#FF6B9D" },
    { name: "Transport", amount: 320, icon: "car.fill", color: "#3B82F6" },
    { name: "Books & Supplies", amount: 280, icon: "book.fill", color: "#8B5CF6" },
    { name: "Entertainment", amount: 204.50, icon: "tv.fill", color: "#F59E0B" },
  ];

  const periods = ["Week", "Month", "Year"];

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-6 pb-4 border-b border-border">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Financial Analytics</Text>
            <View className="w-10" />
          </View>

          {/* Period Selector */}
          <View className="flex-row gap-2">
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period.toLowerCase())}
                className={`flex-1 py-2 rounded-xl ${
                  selectedPeriod === period.toLowerCase()
                    ? "bg-primary"
                    : "bg-surface"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    selectedPeriod === period.toLowerCase()
                      ? "text-white"
                      : "text-muted"
                  }`}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView className="flex-1 px-4">
          {/* Balance Overview */}
          <View className="py-6">
            <Text className="text-sm text-muted mb-2">Current Balance</Text>
            <Text className="text-4xl font-bold text-foreground">
              R{balance.toFixed(2)}
            </Text>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap gap-3 mb-6">
            <View className="flex-1 min-w-[45%] bg-green-500/10 rounded-2xl p-4 border border-green-500/20">
              <IconSymbol name="arrow.down.circle.fill" size={24} color="#10B981" />
              <Text className="text-2xl font-bold text-foreground mt-2">
                R{stats.income.toFixed(2)}
              </Text>
              <Text className="text-sm text-muted">Income</Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-red-500/10 rounded-2xl p-4 border border-red-500/20">
              <IconSymbol name="arrow.up.circle.fill" size={24} color="#EF4444" />
              <Text className="text-2xl font-bold text-foreground mt-2">
                R{stats.expenses.toFixed(2)}
              </Text>
              <Text className="text-sm text-muted">Expenses</Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20">
              <IconSymbol name="banknote.fill" size={24} color="#3B82F6" />
              <Text className="text-2xl font-bold text-foreground mt-2">
                R{stats.savings.toFixed(2)}
              </Text>
              <Text className="text-sm text-muted">Savings</Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20">
              <IconSymbol name="list.bullet" size={24} color="#8B5CF6" />
              <Text className="text-2xl font-bold text-foreground mt-2">
                {stats.transactions}
              </Text>
              <Text className="text-sm text-muted">Transactions</Text>
            </View>
          </View>

          {/* Spending by Category */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">
              Spending by Category
            </Text>
            <View className="gap-3">
              {categories.map((category, index) => (
                <View
                  key={index}
                  className="bg-surface rounded-2xl p-4 border border-border"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: category.color + "20" }}
                      >
                        <IconSymbol name={category.icon} size={20} color={category.color} />
                      </View>
                      <Text className="text-base font-medium text-foreground">
                        {category.name}
                      </Text>
                    </View>
                    <Text className="text-base font-bold text-foreground">
                      R{category.amount.toFixed(2)}
                    </Text>
                  </View>
                  <View className="h-2 bg-muted/20 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: category.color,
                        width: `${(category.amount / stats.expenses) * 100}%`,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
