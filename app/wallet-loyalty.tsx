import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { WalletAPI } from '@/lib/wallet-api';
import Toast from 'react-native-toast-message';

interface LoyaltyTransaction {
  id: string;
  type: string;
  amount: number;
  points: number;
  description: string;
  merchant?: string;
  date: string;
  status: string;
}

export default function WalletLoyaltyScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const walletAPI = new WalletAPI();

  useEffect(() => {
    fetchLoyaltyTransactions();
  }, []);

  const fetchLoyaltyTransactions = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getLoyaltyTransactions(50, 0);
      
      if (response.data && Array.isArray(response.data)) {
        setTransactions(response.data);
        // Calculate total points
        const total = response.data.reduce((sum: number, tx: LoyaltyTransaction) => {
          return sum + (tx.type === 'earned' ? tx.points : -tx.points);
        }, 0);
        setTotalPoints(total);
      } else if (response.success) {
        const txs = response.data?.transactions || response.transactions || [];
        setTransactions(txs);
        const total = response.data?.total_points || response.total_points || 0;
        setTotalPoints(total);
      }
    } catch (error: any) {
      console.error('Failed to fetch loyalty transactions:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load loyalty rewards',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLoyaltyTransactions();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, fontSize: 16, color: colors.text }}>Loading loyalty rewards...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView 
        style={{ flex: 1, backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>
              Loyalty Rewards
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
              Earn points on every transaction
            </Text>
          </View>
        </View>

        {/* Points Balance Card */}
        <View style={{ padding: 20, paddingTop: 0 }}>
          <View style={{
            backgroundColor: colors.primary,
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <IconSymbol name="star.fill" size={32} color="white" />
              <Text style={{ fontSize: 16, color: 'white', marginLeft: 12, opacity: 0.9 }}>
                Total Points
              </Text>
            </View>
            <Text style={{ fontSize: 48, fontWeight: '800', color: 'white' }}>
              {totalPoints.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 14, color: 'white', marginTop: 8, opacity: 0.8 }}>
              Keep earning points with every purchase!
            </Text>
          </View>

          {/* Info Cards */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <View style={{
              flex: 1,
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <IconSymbol name="gift.fill" size={24} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8 }}>
                Redeem
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 4 }}>
                Coming Soon
              </Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8 }}>
                Earn Rate
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 4 }}>
                1% - 5%
              </Text>
            </View>
          </View>

          {/* Transactions List */}
          <View>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 }}>
              Recent Activity
            </Text>

            {transactions.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <IconSymbol name="star.slash" size={64} color={colors.muted} />
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 16 }}>
                  No Loyalty Transactions
                </Text>
                <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8, textAlign: 'center' }}>
                  Start making purchases to earn loyalty points
                </Text>
              </View>
            ) : (
              transactions.map((transaction, index) => (
                <View
                  key={transaction.id || index}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <View style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: transaction.type === 'earned' ? colors.primary + '20' : colors.muted + '20',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}>
                          <IconSymbol 
                            name={transaction.type === 'earned' ? 'plus.circle.fill' : 'minus.circle.fill'} 
                            size={20} 
                            color={transaction.type === 'earned' ? colors.primary : colors.muted} 
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                            {transaction.description}
                          </Text>
                          {transaction.merchant && (
                            <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>
                              {transaction.merchant}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginLeft: 52 }}>
                        <Text style={{ fontSize: 13, color: colors.muted }}>
                          {formatDate(transaction.date)}
                        </Text>
                        {transaction.amount && (
                          <>
                            <Text style={{ fontSize: 13, color: colors.muted, marginHorizontal: 8 }}>•</Text>
                            <Text style={{ fontSize: 13, color: colors.muted }}>
                              R{transaction.amount.toFixed(2)}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: '700',
                        color: transaction.type === 'earned' ? '#10b981' : '#ef4444',
                      }}>
                        {transaction.type === 'earned' ? '+' : '-'}{transaction.points}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                        points
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
