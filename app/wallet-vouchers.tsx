import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { WalletAPI } from '@/lib/wallet-api';
import Toast from 'react-native-toast-message';

interface CustomerVoucher {
  id: string;
  code: string;
  type: string;
  name: string;
  balance?: number;
  status: number;
  expiryDate?: string;
  merchant?: string;
}

export default function WalletVouchersScreen() {
  const colors = useColors();
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [myVouchers, setMyVouchers] = useState<CustomerVoucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<CustomerVoucher | null>(null);
  const walletAPI = new WalletAPI();

  useEffect(() => {
    fetchMyVouchers();
  }, []);

  const fetchMyVouchers = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getCustomerVouchers();
      
      if (response.data && Array.isArray(response.data)) {
        setMyVouchers(response.data);
      } else if (response.success) {
        const vouchers = response.data?.vouchers || response.vouchers || [];
        setMyVouchers(vouchers);
      }
    } catch (error: any) {
      console.error('Failed to fetch vouchers:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load vouchers',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCheckBalance = async (code: string) => {
    try {
      setCheckingBalance(true);
      const response = await walletAPI.checkVoucherBalance(code, true);
      
      if (response.success && response.data) {
        const balance = response.data.balance || 0;
        const currencySymbol = response.data.currencySymbol || 'R';
        const cardNumber = response.data.cardNumber || code;
        const active = response.data.active;
        
        Alert.alert(
          'Voucher Balance',
          `Card: ${cardNumber}\nBalance: ${currencySymbol}${balance.toFixed(2)}\nStatus: ${active ? 'Active' : 'Inactive'}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to check balance',
      });
    } finally {
      setCheckingBalance(false);
    }
  };

  const handleRedeemVoucher = async () => {
    if (!voucherCode) {
      Alert.alert('Error', 'Please enter a voucher code');
      return;
    }

    try {
      setLoading(true);
      const response = await walletAPI.getVoucherByCode(voucherCode);
      
      if (response.success && response.data) {
        Alert.alert(
          'Voucher Found',
          `Voucher code ${voucherCode} is valid!\n\nWould you like to check the balance?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Check Balance',
              onPress: () => handleCheckBalance(voucherCode),
            },
          ]
        );
        setVoucherCode('');
        fetchMyVouchers(); // Refresh list
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid voucher code');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyVouchers();
  };

  return (
    <ScreenContainer>
      <ScrollView 
        style={{ flex: 1, backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={{ padding: 20, paddingTop: 60 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <IconSymbol name="chevron.left" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>
                Vouchers
              </Text>
              <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
                Redeem & manage vouchers
              </Text>
            </View>
          </View>

          {/* Voucher Code Input */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
              Redeem Voucher
            </Text>
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            }}>
              <TextInput
                style={{
                  color: colors.text,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: '700',
                  letterSpacing: 2,
                }}
                placeholder="XXXX-XXXX-XXXX"
                placeholderTextColor={colors.muted}
                value={voucherCode}
                onChangeText={(text) => setVoucherCode(text.toUpperCase())}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Redeem Button */}
          <TouchableOpacity
            onPress={handleRedeemVoucher}
            disabled={!voucherCode || loading}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              marginBottom: 24,
              opacity: (!voucherCode || loading) ? 0.5 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                Redeem Voucher
              </Text>
            )}
          </TouchableOpacity>

          {/* Quick Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
            <TouchableOpacity
              onPress={() => router.push('/wallet-vouchers-purchase')}
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
              }}
            >
              <IconSymbol name="cart.fill" size={24} color={colors.primary} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 8 }}>
                Purchase Vouchers
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/wallet-vas-vouchers')}
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
              }}
            >
              <IconSymbol name="sparkles" size={24} color={colors.primary} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 8 }}>
                Online Shopping
              </Text>
            </TouchableOpacity>
          </View>

          {/* My Vouchers Section */}
          <View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
              My Vouchers
            </Text>

            {loading && !refreshing ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 16, fontSize: 14, color: colors.muted }}>
                  Loading vouchers...
                </Text>
              </View>
            ) : myVouchers.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <IconSymbol name="ticket.fill" size={64} color={colors.muted} />
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 16 }}>
                  No Vouchers Yet
                </Text>
                <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8, textAlign: 'center' }}>
                  Purchase or redeem vouchers to see them here
                </Text>
              </View>
            ) : (
              myVouchers.map((voucher, index) => (
                <View
                  key={voucher.id || index}
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
                      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                        {voucher.name || voucher.type}
                      </Text>
                      {voucher.merchant && (
                        <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
                          {voucher.merchant}
                        </Text>
                      )}
                      <View style={{
                        backgroundColor: colors.background,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        marginTop: 12,
                        alignSelf: 'flex-start',
                      }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary, letterSpacing: 1 }}>
                          {voucher.code}
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      {voucher.balance !== undefined && (
                        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primary }}>
                          R{voucher.balance.toFixed(2)}
                        </Text>
                      )}
                      <View style={{
                        backgroundColor: voucher.status === 1 ? '#10b98120' : colors.muted + '20',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        marginTop: 8,
                      }}>
                        <Text style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: voucher.status === 1 ? '#10b981' : colors.muted,
                        }}>
                          {voucher.status === 1 ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <TouchableOpacity
                      onPress={() => handleCheckBalance(voucher.code)}
                      disabled={checkingBalance}
                      style={{
                        flex: 1,
                        backgroundColor: colors.primary + '20',
                        borderRadius: 12,
                        padding: 12,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                        {checkingBalance ? 'Checking...' : 'Check Balance'}
                      </Text>
                    </TouchableOpacity>
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
