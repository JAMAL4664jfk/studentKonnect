import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { walletAPI, type WalletBalance, type Transaction, type CustomerProfile } from "@/lib/wallet-api";
import Toast from "react-native-toast-message";

export default function MyAccountScreen() {
  const router = useRouter();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [balanceData, profileData, transactionsData] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getProfile(),
        walletAPI.getTransactions(5, 0), // Get last 5 transactions
      ]);

      setBalance(balanceData);
      setProfile(profileData);
      setRecentTransactions(transactionsData);
    } catch (error: any) {
      console.error("Error loading account data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to load account data",
      });

      // If unauthorized, redirect to login
      if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        router.replace("/wallet-login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAccountData();
  };

  const handleLogout = async () => {
    try {
      await walletAPI.logout();
      Toast.show({
        type: "success",
        text1: "Logged Out",
        text2: "You have been logged out successfully",
      });
      router.replace("/services");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm text-muted mt-4">Loading your account...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-4 pt-6 pb-4 border-b border-border">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">My Student Account</Text>
            <TouchableOpacity
              onPress={handleLogout}
              className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center"
            >
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Live API Indicator */}
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-green-500" />
            <Text className="text-xs text-green-500 font-medium">Connected to Wallet API</Text>
          </View>
        </View>

        <View className="px-4 py-6">
          {/* Profile Section */}
          <View className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-6 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mr-4">
                <IconSymbol name="person.fill" size={32} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-white">
                  {profile?.name || "Student"}
                </Text>
                <Text className="text-sm text-white/80">
                  {profile?.email || "No email"}
                </Text>
                {profile?.phone && (
                  <Text className="text-sm text-white/80">
                    {profile.phone}
                  </Text>
                )}
              </View>
            </View>

            {/* Wallet Balance */}
            <View className="border-t border-white/20 pt-4">
              <Text className="text-sm text-white/80 mb-1">Wallet Balance</Text>
              <Text className="text-4xl font-bold text-white">
                R{balance?.available_balance.toFixed(2) || "0.00"}
              </Text>
              {balance && (
                <View className="flex-row gap-4 mt-3">
                  <View>
                    <Text className="text-xs text-white/60">Total Balance</Text>
                    <Text className="text-sm font-semibold text-white">
                      R{balance.total_balance.toFixed(2)}
                    </Text>
                  </View>
                  {balance.pending_balance > 0 && (
                    <View>
                      <Text className="text-xs text-white/60">Pending</Text>
                      <Text className="text-sm font-semibold text-white">
                        R{balance.pending_balance.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Quick Actions</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => router.push("/financial-analytics")}
                className="flex-1 bg-surface rounded-2xl p-4 border border-border"
              >
                <View className="w-12 h-12 rounded-full bg-blue-500/10 items-center justify-center mb-2">
                  <IconSymbol name="chart.bar.fill" size={24} color="#3B82F6" />
                </View>
                <Text className="text-sm font-semibold text-foreground">Analytics</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/lifestyle-rewards")}
                className="flex-1 bg-surface rounded-2xl p-4 border border-border"
              >
                <View className="w-12 h-12 rounded-full bg-purple-500/10 items-center justify-center mb-2">
                  <IconSymbol name="star.fill" size={24} color="#8B5CF6" />
                </View>
                <Text className="text-sm font-semibold text-foreground">Rewards</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onRefresh}
                className="flex-1 bg-surface rounded-2xl p-4 border border-border"
              >
                <View className="w-12 h-12 rounded-full bg-green-500/10 items-center justify-center mb-2">
                  <IconSymbol name="arrow.clockwise" size={24} color="#10B981" />
                </View>
                <Text className="text-sm font-semibold text-foreground">Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Transactions */}
          {recentTransactions.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-foreground">Recent Transactions</Text>
                <TouchableOpacity onPress={() => router.push("/financial-analytics")}>
                  <Text className="text-sm text-primary font-medium">View All</Text>
                </TouchableOpacity>
              </View>
              <View className="gap-2">
                {recentTransactions.map((txn) => (
                  <View
                    key={txn.id}
                    className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-foreground">
                        {txn.description}
                      </Text>
                      <Text className="text-xs text-muted">
                        {new Date(txn.date).toLocaleDateString()} • {txn.category}
                      </Text>
                    </View>
                    <Text
                      className={`text-base font-bold ${
                        txn.type === 'credit' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {txn.type === 'credit' ? '+' : '-'}R{Math.abs(txn.amount).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Account Info */}
          {profile && (
            <View className="bg-surface rounded-2xl p-4 border border-border mb-6">
              <Text className="text-base font-bold text-foreground mb-3">Account Information</Text>
              <View className="gap-3">
                {profile.customer_id && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Customer ID</Text>
                    <Text className="text-sm font-medium text-foreground">{profile.customer_id}</Text>
                  </View>
                )}
                {profile.status && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Status</Text>
                    <View className="px-3 py-1 rounded-full bg-green-500/10">
                      <Text className="text-xs font-semibold text-green-600">
                        {profile.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                )}
                {profile.created_at && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Member Since</Text>
                    <Text className="text-sm font-medium text-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Services */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Services</Text>
            <View className="gap-2">
              <TouchableOpacity
                onPress={() => router.push("/marketplace")}
                className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-orange-500/10 items-center justify-center">
                    <IconSymbol name="cart.fill" size={20} color="#F59E0B" />
                  </View>
                  <Text className="text-sm font-medium text-foreground">Marketplace</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/accommodation")}
                className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center">
                    <IconSymbol name="house.fill" size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-sm font-medium text-foreground">Accommodation</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/settings")}
                className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-gray-500/10 items-center justify-center">
                    <IconSymbol name="gearshape.fill" size={20} color="#6B7280" />
                  </View>
                  <Text className="text-sm font-medium text-foreground">Settings</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
