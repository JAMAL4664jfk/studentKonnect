import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { walletAPI } from '@/lib/wallet-api';
import Toast from 'react-native-toast-message';

const VOUCHER_DENOMINATIONS = [
  { id: '1', amount: '50', name: 'R50 Voucher' },
  { id: '2', amount: '100', name: 'R100 Voucher' },
  { id: '3', amount: '200', name: 'R200 Voucher' },
  { id: '4', amount: '500', name: 'R500 Voucher' },
  { id: '5', amount: '1000', name: 'R1000 Voucher' },
];

const MERCHANTS = [
  { id: '215898', name: 'General Vouchers' },
  { id: '215899', name: 'Gift Cards' },
  { id: '215900', name: 'Shopping Vouchers' },
];

export default function WalletVouchersPurchaseScreen() {
  const colors = useColors();
  const [selectedDenomination, setSelectedDenomination] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState('215898');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    const denom = VOUCHER_DENOMINATIONS.find(d => d.id === selectedDenomination);
    if (!denom) return 0;
    return parseFloat(denom.amount) * parseInt(quantity || '1');
  };

  const handlePurchaseVoucher = async () => {
    if (!selectedDenomination) {
      Alert.alert('Error', 'Please select a voucher denomination');
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const denom = VOUCHER_DENOMINATIONS.find(d => d.id === selectedDenomination);
    if (!denom) return;

    const total = calculateTotal();

    Alert.alert(
      'Confirm Purchase',
      `Purchase ${quantity}x ${denom.name} for R${total.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            setLoading(true);

            try {
              const intentResponse = await walletAPI.createVoucherPaymentIntent(
                [{
                  amount: denom.amount,
                  id: denom.id,
                  quantity: quantity,
                }],
                selectedMerchant,
                total.toString(),
                'strict'
              );

              console.log('Voucher Payment Intent Response:', intentResponse);

              Toast.show({
                type: 'success',
                text1: 'Purchase Successful',
                text2: `${quantity}x ${denom.name} purchased successfully`,
              });

              // Reset form
              setSelectedDenomination('');
              setQuantity('1');
              
              // Navigate back or to vouchers list
              router.back();
            } catch (error: any) {
              console.error('Voucher Purchase Error:', error);
              
              if (error.message?.includes('Insufficient Funds')) {
                Alert.alert(
                  'Insufficient Funds',
                  `You need R${total.toFixed(2)} to complete this purchase. Please deposit funds first.`,
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
              setLoading(false);
            }
          },
        },
      ]
    );
  };

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
              <Text className="text-2xl font-bold text-foreground">Purchase Voucher</Text>
              <Text className="text-sm text-muted">Buy vouchers with your wallet</Text>
            </View>
          </View>

          {/* Merchant Selection */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-3">Merchant</Text>
            {MERCHANTS.map((merchant) => (
              <TouchableOpacity
                key={merchant.id}
                onPress={() => setSelectedMerchant(merchant.id)}
                className={`bg-card rounded-2xl p-4 mb-3 border ${
                  selectedMerchant === merchant.id ? 'border-primary' : 'border-border'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground font-medium">{merchant.name}</Text>
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      selectedMerchant === merchant.id
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}
                  >
                    {selectedMerchant === merchant.id && (
                      <IconSymbol name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Denomination Selection */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-3">Select Denomination</Text>
            <View className="flex-row flex-wrap gap-3">
              {VOUCHER_DENOMINATIONS.map((denom) => (
                <TouchableOpacity
                  key={denom.id}
                  onPress={() => setSelectedDenomination(denom.id)}
                  className={`px-6 py-4 rounded-xl border ${
                    selectedDenomination === denom.id
                      ? 'bg-primary border-primary'
                      : 'bg-card border-border'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      selectedDenomination === denom.id ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    R{denom.amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-2">Quantity</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <TextInput
                className="text-foreground py-4 px-4 text-center text-lg font-bold"
                placeholder="1"
                placeholderTextColor={colors.muted}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>

          {/* Total Amount */}
          {selectedDenomination && (
            <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
              <View className="flex-row justify-between items-center">
                <Text className="text-foreground font-semibold">Total Amount:</Text>
                <Text className="text-primary text-2xl font-bold">
                  R{calculateTotal().toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {/* Purchase Button */}
          <TouchableOpacity
            onPress={handlePurchaseVoucher}
            disabled={!selectedDenomination || !quantity || loading}
            className={`bg-primary rounded-2xl p-4 items-center mb-4 ${
              !selectedDenomination || !quantity || loading ? 'opacity-50' : ''
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-lg">Purchase Voucher</Text>
            )}
          </TouchableOpacity>

          {/* Info Card */}
          <View className="bg-card rounded-2xl p-4 border border-border">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">About Vouchers</Text>
                <Text className="text-muted text-xs">
                  • Vouchers are delivered instantly{'\n'}
                  • Can be used for various purchases{'\n'}
                  • Check your balance before purchasing{'\n'}
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
