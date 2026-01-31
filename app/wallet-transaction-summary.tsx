import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/Colors';
import { WalletAPI } from '@/lib/wallet-api';

export default function WalletTransactionSummaryScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const walletAPI = new WalletAPI();

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getTransactionSummary();
      setSummary(response.data);
    } catch (error: any) {
      console.error('Error fetching transaction summary:', error);
      Alert.alert('Error', error.message || 'Failed to load transaction summary');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted mt-4">Loading summary...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const totalIncome = summary?.total_income || 0;
  const totalExpenses = summary?.total_expenses || 0;
  const netBalance = totalIncome - totalExpenses;
  const transactionCount = summary?.transaction_count || 0;

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 pt-12 pb-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center mr-4"
              >
                <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
              </TouchableOpacity>
              <View>
                <Text className="text-2xl font-bold text-foreground">Transaction Summary</Text>
                <Text className="text-sm text-muted">Your financial overview</Text>
              </View>
            </View>
          </View>

          {/* Net Balance Card */}
          <View className={`rounded-3xl p-6 mb-6 ${netBalance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
            <Text className="text-white/70 text-sm mb-2">Net Balance</Text>
            <Text className="text-white text-4xl font-bold">
              {netBalance >= 0 ? '+' : ''}R {netBalance.toFixed(2)}
            </Text>
            <Text className="text-white/70 text-sm mt-2">
              {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} this period
            </Text>
          </View>

          {/* Income & Expenses */}
          <View className="flex-row gap-3 mb-6">
            {/* Income Card */}
            <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
              <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 rounded-full bg-green-500/20 items-center justify-center mr-3">
                  <IconSymbol name="arrow.down.circle.fill" size={24} color="#22c55e" />
                </View>
                <Text className="text-muted text-sm">Income</Text>
              </View>
              <Text className="text-foreground text-2xl font-bold">
                R {totalIncome.toFixed(2)}
              </Text>
              <Text className="text-green-600 text-sm mt-1">
                {summary?.income_count || 0} transactions
              </Text>
            </View>

            {/* Expenses Card */}
            <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
              <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center mr-3">
                  <IconSymbol name="arrow.up.circle.fill" size={24} color="#ef4444" />
                </View>
                <Text className="text-muted text-sm">Expenses</Text>
              </View>
              <Text className="text-foreground text-2xl font-bold">
                R {totalExpenses.toFixed(2)}
              </Text>
              <Text className="text-red-600 text-sm mt-1">
                {summary?.expense_count || 0} transactions
              </Text>
            </View>
          </View>

          {/* Statistics */}
          <View className="bg-card rounded-2xl p-4 space-y-4 mb-6">
            <Text className="text-foreground font-semibold text-lg">Statistics</Text>
            
            <View className="flex-row justify-between">
              <Text className="text-muted">Average Transaction</Text>
              <Text className="text-foreground font-medium">
                R {summary?.average_transaction ? summary.average_transaction.toFixed(2) : '0.00'}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted">Largest Transaction</Text>
              <Text className="text-foreground font-medium">
                R {summary?.largest_transaction ? summary.largest_transaction.toFixed(2) : '0.00'}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted">Smallest Transaction</Text>
              <Text className="text-foreground font-medium">
                R {summary?.smallest_transaction ? summary.smallest_transaction.toFixed(2) : '0.00'}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted">Total Transactions</Text>
              <Text className="text-foreground font-medium">{transactionCount}</Text>
            </View>
          </View>

          {/* Top Categories */}
          {summary?.top_categories && summary.top_categories.length > 0 && (
            <View className="bg-card rounded-2xl p-4 mb-6">
              <Text className="text-foreground font-semibold text-lg mb-4">Top Categories</Text>
              {summary.top_categories.map((category: any, index: number) => (
                <View key={index} className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                      <IconSymbol name="tag.fill" size={20} color={colors.primary} />
                    </View>
                    <Text className="text-foreground font-medium">{category.name}</Text>
                  </View>
                  <Text className="text-foreground font-bold">
                    R {category.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Period Selector */}
          <View className="bg-card rounded-2xl p-4 mb-6">
            <Text className="text-foreground font-semibold text-lg mb-4">Period</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity className="flex-1 bg-primary rounded-xl py-3 items-center">
                <Text className="text-white font-semibold">This Month</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-muted/20 rounded-xl py-3 items-center">
                <Text className="text-foreground font-semibold">Last Month</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-2 mt-2">
              <TouchableOpacity className="flex-1 bg-muted/20 rounded-xl py-3 items-center">
                <Text className="text-foreground font-semibold">This Year</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-muted/20 rounded-xl py-3 items-center">
                <Text className="text-foreground font-semibold">Custom</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Export Button */}
          <TouchableOpacity
            className="bg-primary rounded-2xl p-4 flex-row items-center justify-center"
          >
            <IconSymbol name="square.and.arrow.down" size={20} color="#fff" />
            <Text className="text-white font-semibold text-lg ml-2">Export Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
