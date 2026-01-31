import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { WalletAPI } from '@/lib/wallet-api';
import Toast from 'react-native-toast-message';

export default function WalletCashoutHistoryScreen() {
  const colors = useColors();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const walletAPI = new WalletAPI();

  useEffect(() => {
    fetchCashoutHistory();
  }, []);

  const fetchCashoutHistory = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getCashoutHistory();
      
      if (response.data && Array.isArray(response.data)) {
        setHistory(response.data);
      } else if (response.data && response.data.history) {
        setHistory(response.data.history);
      } else {
        setHistory([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch cashout history:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load',
        text2: error.message || 'Unable to fetch cashout history',
      });
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCashoutHistory();
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'completed' || statusLower === 'success') return colors.success;
    if (statusLower === 'pending' || statusLower === 'processing') return colors.warning;
    if (statusLower === 'failed' || statusLower === 'rejected') return colors.destructive;
    return colors.muted;
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'completed' || statusLower === 'success') return 'checkmark.circle.fill';
    if (statusLower === 'pending' || statusLower === 'processing') return 'clock.fill';
    if (statusLower === 'failed' || statusLower === 'rejected') return 'xmark.circle.fill';
    return 'circle.fill';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-ZA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="px-6 pt-12 pb-8">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center mr-4"
            >
              <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Cashout History</Text>
              <Text className="text-sm text-muted">Your withdrawal transactions</Text>
            </View>
          </View>

          {/* Loading State */}
          {loading && !refreshing && (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted mt-4">Loading history...</Text>
            </View>
          )}

          {/* Empty State */}
          {!loading && history.length === 0 && (
            <View className="py-12 items-center">
              <View className="w-20 h-20 rounded-full bg-muted/20 items-center justify-center mb-4">
                <IconSymbol name="arrow.down.circle" size={40} color={colors.muted} />
              </View>
              <Text className="text-foreground font-semibold text-lg mb-2">No Withdrawals Yet</Text>
              <Text className="text-muted text-center px-8 mb-6">
                You haven't made any withdrawals. Start by withdrawing funds to your bank account.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/wallet-withdraw')}
                className="bg-primary rounded-full px-6 py-3"
              >
                <Text className="text-white font-semibold">Withdraw Funds</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* History List */}
          {!loading && history.length > 0 && (
            <View className="space-y-4">
              {history.map((item, index) => (
                <View
                  key={item.id || item.order_id || index}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <View className="flex-row items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-xl mb-1">
                        R {parseFloat(item.amount || 0).toFixed(2)}
                      </Text>
                      <Text className="text-muted text-sm">
                        {formatDate(item.created_at || item.date || '')}
                        {' • '}
                        {formatTime(item.created_at || item.date || '')}
                      </Text>
                    </View>
                    <View
                      className="px-3 py-1 rounded-full flex-row items-center"
                      style={{ backgroundColor: `${getStatusColor(item.status)}20` }}
                    >
                      <IconSymbol
                        name={getStatusIcon(item.status)}
                        size={14}
                        color={getStatusColor(item.status)}
                      />
                      <Text
                        className="text-xs font-semibold ml-1 capitalize"
                        style={{ color: getStatusColor(item.status) }}
                      >
                        {item.status || 'Unknown'}
                      </Text>
                    </View>
                  </View>

                  {/* Bank Details */}
                  {item.bank_name && (
                    <View className="bg-muted/10 rounded-xl p-3 mb-2">
                      <Text className="text-muted text-xs mb-1">Bank Account</Text>
                      <Text className="text-foreground font-medium">
                        {item.bank_name}
                      </Text>
                      {item.account_number && (
                        <Text className="text-muted text-sm">
                          ****{item.account_number.slice(-4)}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Fee */}
                  {item.fee && parseFloat(item.fee) > 0 && (
                    <View className="flex-row justify-between items-center pt-2 border-t border-border">
                      <Text className="text-muted text-sm">Transaction Fee</Text>
                      <Text className="text-muted text-sm">R {parseFloat(item.fee).toFixed(2)}</Text>
                    </View>
                  )}

                  {/* Reference */}
                  {item.reference && (
                    <View className="pt-2 border-t border-border mt-2">
                      <Text className="text-muted text-xs">
                        Ref: {item.reference}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Info Card */}
          <View className="bg-muted/10 border border-muted/30 rounded-2xl p-4 mt-6">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Processing Times</Text>
                <Text className="text-muted text-sm">
                  • Withdrawals are processed within 1-3 business days{'\n'}
                  • Fees vary based on withdrawal amount{'\n'}
                  • Check your bank account for deposits{'\n'}
                  • Contact support if delayed beyond 3 days
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
