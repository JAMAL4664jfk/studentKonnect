import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { walletAPI } from '@/lib/wallet-api';
import Toast from 'react-native-toast-message';

interface CellularVoucher {
  id: string;
  product_code: string;
  product_name: string;
  minimum_amount: string;
  maximum_amount: string;
  product_group: string;
  vas_type: string;
  logo: string;
}

interface CellularProvider {
  info: {
    provider_id: string;
    name: string;
    logo: string;
  };
  vouchers: CellularVoucher[];
}

const QUICK_AMOUNTS = ['10', '20', '50', '100', '200', '500'];

export default function WalletBuyAirtimeScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [providers, setProviders] = useState<Record<string, CellularProvider>>({});
  const [selectedVoucher, setSelectedVoucher] = useState<CellularVoucher | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchCellularVouchers();
  }, []);

  const fetchCellularVouchers = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getVASVouchers('cellular');
      
      if (response.data) {
        setProviders(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching cellular vouchers:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load',
        text2: 'Unable to fetch airtime options',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyAirtime = async () => {
    if (!selectedVoucher) {
      Alert.alert('Error', 'Please select a network');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amountCents = parseFloat(amount) * 100; // Convert to cents
    const minAmount = parseFloat(selectedVoucher.minimum_amount);
    const maxAmount = parseFloat(selectedVoucher.maximum_amount);

    if (amountCents < minAmount) {
      Alert.alert('Error', `Minimum amount is R${(minAmount / 100).toFixed(2)}`);
      return;
    }
    if (amountCents > maxAmount) {
      Alert.alert('Error', `Maximum amount is R${(maxAmount / 100).toFixed(2)}`);
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Buy R${parseFloat(amount).toFixed(2)} airtime for ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: async () => {
            setPurchasing(true);

            try {
              const intentResponse = await walletAPI.createVASVoucherIntent(
                selectedProviderId,
                selectedVoucher.product_code,
                selectedVoucher.id,
                amountCents.toString(),
                phoneNumber
              );

              console.log('Airtime Purchase Response:', intentResponse);

              Toast.show({
                type: 'success',
                text1: 'Purchase Successful',
                text2: `R${parseFloat(amount).toFixed(2)} airtime sent to ${phoneNumber}`,
              });

              // Reset form
              setAmount('');
              setPhoneNumber('');
              
              router.back();
            } catch (error: any) {
              console.error('Airtime Purchase Error:', error);
              
              if (error.message?.includes('Insufficient Funds')) {
                Alert.alert(
                  'Insufficient Funds',
                  `You need R${parseFloat(amount).toFixed(2)} to complete this purchase. Please deposit funds first.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Deposit', onPress: () => router.push('/wallet-deposit') },
                  ]
                );
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Purchase Failed',
                  text2: error.message || 'Unable to purchase airtime',
                });
              }
            } finally {
              setPurchasing(false);
            }
          },
        },
      ]
    );
  };

  const renderNetworkSelection = () => {
    return (
      <View className="mb-6">
        <Text className="text-foreground font-medium mb-3">Select Network</Text>
        {Object.entries(providers).map(([key, provider]) => (
          <View key={key} className="mb-4">
            <Text className="text-muted text-sm mb-2">{provider.info.name}</Text>
            {provider.vouchers.map((voucher) => (
              <TouchableOpacity
                key={voucher.id}
                onPress={() => {
                  setSelectedVoucher(voucher);
                  setSelectedProviderId(provider.info.provider_id);
                }}
                className={`bg-card rounded-2xl p-4 mb-2 border ${
                  selectedVoucher?.id === voucher.id ? 'border-primary' : 'border-border'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold mb-1">
                      {voucher.product_name}
                    </Text>
                    <Text className="text-muted text-xs">
                      Range: R{(parseFloat(voucher.minimum_amount) / 100).toFixed(2)} - R
                      {(parseFloat(voucher.maximum_amount) / 100).toFixed(2)}
                    </Text>
                  </View>
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      selectedVoucher?.id === voucher.id
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}
                  >
                    {selectedVoucher?.id === voucher.id && (
                      <IconSymbol name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted mt-4">Loading networks...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        <View className="px-6 pt-12 pb-6">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center mr-4"
            >
              <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-foreground">Buy Airtime</Text>
              <Text className="text-sm text-muted">Top up your mobile phone</Text>
            </View>
          </View>

          {/* Network Selection */}
          {renderNetworkSelection()}

          {/* Phone Number */}
          {selectedVoucher && (
            <>
              <View className="mb-6">
                <Text className="text-foreground font-medium mb-2">Phone Number</Text>
                <View className="bg-card rounded-2xl border border-border overflow-hidden">
                  <TextInput
                    className="text-foreground py-4 px-4"
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.muted}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Amount */}
              <View className="mb-6">
                <Text className="text-foreground font-medium mb-2">Amount (ZAR)</Text>
                <View className="bg-card rounded-2xl border border-border overflow-hidden">
                  <View className="flex-row items-center px-4">
                    <Text className="text-foreground text-xl font-bold">R</Text>
                    <TextInput
                      className="flex-1 text-foreground py-4 px-3 text-xl font-bold"
                      placeholder="0.00"
                      placeholderTextColor={colors.muted}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
                <Text className="text-muted text-xs mt-2">
                  Min: R{(parseFloat(selectedVoucher.minimum_amount) / 100).toFixed(2)} | Max: R
                  {(parseFloat(selectedVoucher.maximum_amount) / 100).toFixed(2)}
                </Text>
              </View>

              {/* Quick Amounts */}
              <View className="mb-6">
                <Text className="text-foreground font-medium mb-3">Quick Amounts</Text>
                <View className="flex-row flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((quickAmount) => (
                    <TouchableOpacity
                      key={quickAmount}
                      onPress={() => setAmount(quickAmount)}
                      className={`px-6 py-3 rounded-xl border ${
                        amount === quickAmount ? 'bg-primary border-primary' : 'bg-card border-border'
                      }`}
                    >
                      <Text
                        className={`font-semibold ${
                          amount === quickAmount ? 'text-white' : 'text-foreground'
                        }`}
                      >
                        R{quickAmount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Buy Button */}
              <TouchableOpacity
                onPress={handleBuyAirtime}
                disabled={!phoneNumber || !amount || purchasing}
                className={`bg-primary rounded-2xl p-4 items-center ${
                  !phoneNumber || !amount || purchasing ? 'opacity-50' : ''
                }`}
              >
                {purchasing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-lg">Buy Airtime</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mt-6">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">About Airtime Purchase</Text>
                <Text className="text-muted text-xs">
                  • Instant delivery to phone number{'\n'}
                  • All major networks supported{'\n'}
                  • Check amount limits before purchase{'\n'}
                  • Non-refundable once processed
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
