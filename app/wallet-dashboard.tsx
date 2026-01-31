import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { walletAPI } from "@/lib/wallet-api";
import Toast from "react-native-toast-message";

export default function WalletDashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Try to fetch balance
      try {
        const balanceResponse = await walletAPI.getBalance();
        if (balanceResponse.success && balanceResponse.data) {
          setBalance(balanceResponse.data.available_balance || 0);
        } else {
          setBalance(0);
        }
      } catch (error) {
        console.log("Balance not available yet:", error);
        setBalance(0); // Default to 0 if not available
      }

      // Try to fetch profile
      try {
        const profileResponse = await walletAPI.getProfile();
        if (profileResponse.success && profileResponse.data) {
          setProfile(profileResponse.data);
        }
      } catch (error) {
        console.log("Profile not available yet:", error);
      }

      // Try to fetch transactions
      try {
        const transactionsResponse = await walletAPI.getTransactions(5, 0);
        if (transactionsResponse.success && transactionsResponse.data) {
          setTransactions(transactionsResponse.data.transactions || []);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.log("Transactions not available yet:", error);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = async () => {
    try {
      await walletAPI.logout();
      Toast.show({
        type: "success",
        text1: "Logged Out",
        text2: "You have been logged out successfully",
      });
      router.replace("/wallet-login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted mt-4">Loading your wallet...</Text>
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
        <View className="px-6 pt-12 pb-6">
          {/* Profile Completion Banner */}
          {!loading && profile && !profile.address && (
            <TouchableOpacity
              onPress={() => router.push({
                pathname: "/wallet-add-address",
                params: { customerId: profile.customerId, idNumber: profile.identity_number }
              })}
              className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 flex-row items-center"
            >
              <View className="w-12 h-12 rounded-full bg-amber-500/20 items-center justify-center mr-3">
                <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold mb-1">
                  Complete Your Profile
                </Text>
                <Text className="text-muted text-xs">
                  Add your address to unlock all features
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-sm text-muted">Welcome back</Text>
              <Text className="text-2xl font-bold text-foreground">
                {profile?.first_name || "User"}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => router.push('/wallet-settings')}
                className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center"
              >
                <IconSymbol name="gearshape.fill" size={20} color={colors.muted} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center"
              >
                <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Balance Card */}
          <View className="bg-primary rounded-3xl p-6 mb-6">
            <Text className="text-white/70 text-sm mb-2">Total Balance</Text>
            <Text className="text-white text-4xl font-bold mb-4">
              R {balance !== null ? balance.toFixed(2) : "0.00"}
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => router.push('/wallet-deposit')}
                className="flex-1 bg-white/20 rounded-xl py-3 items-center"
              >
                <IconSymbol name="arrow.down.circle.fill" size={24} color="white" />
                <Text className="text-white text-xs mt-1">Deposit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/wallet-withdraw')}
                className="flex-1 bg-white/20 rounded-xl py-3 items-center"
              >
                <IconSymbol name="arrow.up.circle.fill" size={24} color="white" />
                <Text className="text-white text-xs mt-1">Withdraw</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/wallet-withdraw')}
                className="flex-1 bg-white/20 rounded-xl py-3 items-center"
              >
                <IconSymbol name="arrow.left.arrow.right.circle.fill" size={24} color="white" />
                <Text className="text-white text-xs mt-1">Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Quick Actions</Text>
            <View className="flex-row flex-wrap gap-3">
              <TouchableOpacity className="flex-1 min-w-[45%] bg-card rounded-2xl p-4 border border-border">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
                  <IconSymbol name="creditcard.fill" size={24} color={colors.primary} />
                </View>
                <Text className="text-foreground font-medium">Pay Bills</Text>
                <Text className="text-muted text-xs mt-1">Electricity, Water, etc.</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 min-w-[45%] bg-card rounded-2xl p-4 border border-border">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
                  <IconSymbol name="phone.fill" size={24} color={colors.primary} />
                </View>
                <Text className="text-foreground font-medium">Airtime</Text>
                <Text className="text-muted text-xs mt-1">Buy airtime & data</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 min-w-[45%] bg-card rounded-2xl p-4 border border-border">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
                  <IconSymbol name="gift.fill" size={24} color={colors.primary} />
                </View>
                <Text className="text-foreground font-medium">Vouchers</Text>
                <Text className="text-muted text-xs mt-1">Redeem rewards</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 min-w-[45%] bg-card rounded-2xl p-4 border border-border">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
                  <IconSymbol name="doc.text.fill" size={24} color={colors.primary} />
                </View>
                <Text className="text-foreground font-medium">Statements</Text>
                <Text className="text-muted text-xs mt-1">View history</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/wallet-add-account')}
                className="flex-1 min-w-[45%] bg-card rounded-2xl p-4 border border-border"
              >
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
                  <IconSymbol name="building.columns.fill" size={24} color={colors.primary} />
                </View>
                <Text className="text-foreground font-medium">Add Bank Account</Text>
                <Text className="text-muted text-xs mt-1">Link your bank</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Transactions */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-foreground">Recent Transactions</Text>
              <TouchableOpacity onPress={() => router.push('/wallet-transaction-summary')}>
                <Text className="text-primary text-sm">See All</Text>
              </TouchableOpacity>
            </View>

            {transactions.length > 0 ? (
              <View className="bg-card rounded-2xl border border-border overflow-hidden">
                {transactions.map((transaction, index) => (
                  <TouchableOpacity
                    key={transaction.id || index}
                    onPress={() => router.push(`/wallet-transaction-details?id=${transaction.id || index}`)}
                    className={`flex-row items-center p-4 ${
                      index < transactions.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                        transaction.type === "credit" ? "bg-green-500/10" : "bg-red-500/10"
                      }`}
                    >
                      <IconSymbol
                        name={transaction.type === "credit" ? "arrow.down.circle.fill" : "arrow.up.circle.fill"}
                        size={24}
                        color={transaction.type === "credit" ? "#22c55e" : "#ef4444"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-medium">{transaction.description}</Text>
                      <Text className="text-muted text-xs mt-1">{transaction.date}</Text>
                    </View>
                    <Text
                      className={`font-semibold ${
                        transaction.type === "credit" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : "-"}R {transaction.amount.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="bg-card rounded-2xl border border-border p-8 items-center">
                <IconSymbol name="doc.text" size={48} color={colors.muted} />
                <Text className="text-muted text-center mt-3">No transactions yet</Text>
                <Text className="text-muted text-center text-xs mt-1">
                  Your transaction history will appear here
                </Text>
              </View>
            )}
          </View>

              {/* Account Information */}
          {profile && (
            <View className="px-6 pb-6">
              <Text className="text-lg font-semibold text-foreground mb-4">Account Information</Text>
              <View className="bg-card rounded-2xl p-4 space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-muted">Account Number</Text>
                  <Text className="text-foreground font-medium">{profile.account_number || "N/A"}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted">Wallet Account</Text>
                  <Text className="text-foreground font-medium">{profile.wallet_acc_number || "N/A"}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted">Customer ID</Text>
                  <Text className="text-foreground font-medium">{profile.customer_id || "N/A"}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted">Phone Number</Text>
                  <Text className="text-foreground font-medium">{profile.msisdn || "N/A"}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted">Email</Text>
                  <Text className="text-foreground font-medium">{profile.email || "Not set"}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted">Status</Text>
                  <View className="flex-row items-center">
                    <View className={`w-2 h-2 rounded-full mr-2 ${profile.status === "1" ? "bg-green-500" : "bg-red-500"}`} />
                    <Text className="text-foreground font-medium">{profile.status === "1" ? "Active" : "Inactive"}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
