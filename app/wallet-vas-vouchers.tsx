import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { walletAPI } from '@/lib/wallet-api';
import Toast from 'react-native-toast-message';

interface VASVoucher {
  id: string;
  product_code: string;
  product_name: string;
  minimum_amount: string;
  maximum_amount: string;
  product_group: string;
  vas_type: string;
  logo: string;
}

interface VASProvider {
  info: {
    provider_id: string;
    name: string;
    logo: string;
  };
  vouchers: VASVoucher[];
}

export default function WalletVASVouchersScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [providers, setProviders] = useState<Record<string, VASProvider>>({});
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<VASVoucher | null>(null);
  const [amount, setAmount] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [voucherCode, setVoucherCode] = useState('1'); // Default voucher code

  useEffect(() => {
    fetchVASVouchers();
  }, []);

  const fetchVASVouchers = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getVASVouchers('online_shopping');
      
      if (response.data) {
        setProviders(response.data);
        // Auto-select first provider
        const firstProvider = Object.keys(response.data)[0];
        if (firstProvider) {
          setSelectedProvider(firstProvider);
        }
      }
    } catch (error: any) {
      console.error('Error fetching VAS vouchers:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load',
        text2: 'Unable to fetch available vouchers',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseVoucher = async () => {
    if (!selectedVoucher) {
      Alert.alert('Error', 'Please select a voucher');
      return;
    }
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }
    if (!mobileNumber || mobileNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
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

    const provider = providers[selectedProvider!];
    if (!provider) return;

    Alert.alert(
      'Confirm Purchase',
      `Purchase ${selectedVoucher.product_name} for R${parseFloat(amount).toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            setPurchasing(true);

            try {
              const intentResponse = await walletAPI.createVASVoucherIntent(
                provider.info.provider_id,
                selectedVoucher.product_code,
                voucherCode,
                amountCents.toString(),
                mobileNumber
              );

              console.log('VAS Voucher Intent Response:', intentResponse);

              Toast.show({
                type: 'success',
                text1: 'Purchase Successful',
                text2: `${selectedVoucher.product_name} purchased successfully`,
              });

              // Reset form
              setAmount('');
              setMobileNumber('');
              setSelectedVoucher(null);
            } catch (error: any) {
              console.error('VAS Voucher Purchase Error:', error);
              
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
                  text2: error.message || 'Unable to purchase voucher',
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

  const renderProviderSelection = () => {
    return (
      <View className="mb-6">
        <Text className="text-foreground font-medium mb-3">Select Provider</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {Object.entries(providers).map(([key, provider]) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  setSelectedProvider(key);
                  setSelectedVoucher(null);
                }}
                className={`bg-card rounded-2xl p-4 border ${
                  selectedProvider === key ? 'border-primary' : 'border-border'
                } min-w-[120px] items-center`}
              >
                <Text className="text-foreground font-semibold">{provider.info.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderVoucherSelection = () => {
    if (!selectedProvider || !providers[selectedProvider]) return null;

    const provider = providers[selectedProvider];

    return (
      <View className="mb-6">
        <Text className="text-foreground font-medium mb-3">Select Voucher</Text>
        {provider.vouchers.map((voucher) => (
          <TouchableOpacity
            key={voucher.id}
            onPress={() => setSelectedVoucher(voucher)}
            className={`bg-card rounded-2xl p-4 mb-3 border ${
              selectedVoucher?.id === voucher.id ? 'border-primary' : 'border-border'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-foreground font-semibold mb-1">{voucher.product_name}</Text>
                <Text className="text-muted text-xs mb-1">{voucher.product_group}</Text>
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
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted mt-4">Loading vouchers...</Text>
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
              <Text className="text-2xl font-bold text-foreground">VAS Vouchers</Text>
              <Text className="text-sm text-muted">Online shopping vouchers</Text>
            </View>
          </View>

          {/* Provider Selection */}
          {renderProviderSelection()}

          {/* Voucher Selection */}
          {renderVoucherSelection()}

          {/* Amount Input */}
          {selectedVoucher && (
            <>
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

              {/* Mobile Number */}
              <View className="mb-6">
                <Text className="text-foreground font-medium mb-2">Mobile Number</Text>
                <View className="bg-card rounded-2xl border border-border overflow-hidden">
                  <TextInput
                    className="text-foreground py-4 px-4"
                    placeholder="Enter mobile number"
                    placeholderTextColor={colors.muted}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Purchase Button */}
              <TouchableOpacity
                onPress={handlePurchaseVoucher}
                disabled={!amount || !mobileNumber || purchasing}
                className={`bg-primary rounded-2xl p-4 items-center ${
                  !amount || !mobileNumber || purchasing ? 'opacity-50' : ''
                }`}
              >
                {purchasing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-lg">Purchase Voucher</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mt-6">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">About VAS Vouchers</Text>
                <Text className="text-muted text-xs">
                  • Instant delivery to mobile number{'\n'}
                  • Valid for online shopping{'\n'}
                  • Check amount limits before purchase{'\n'}
                  • Non-refundable once purchased
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
