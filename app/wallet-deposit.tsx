import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/Colors';

const FUNDING_METHODS = [
  {
    id: 'payfast',
    name: 'PayFast',
    description: 'Credit/Debit Card, EFT, Instant EFT',
    icon: 'creditcard.fill',
    recommended: true,
  },
  {
    id: 'ozow',
    name: 'Ozow',
    description: 'Instant EFT - Fast & Secure',
    icon: 'bolt.circle.fill',
    recommended: false,
  },
  {
    id: 'payshap',
    name: 'PayShap',
    description: 'Instant EFT from your bank',
    icon: 'building.columns.fill',
    recommended: false,
  },
];

export default function WalletDepositScreen() {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('payfast');

  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amountValue = parseFloat(amount);
    if (amountValue < 10) {
      Alert.alert('Error', 'Minimum deposit amount is R10');
      return;
    }

    if (amountValue > 10000) {
      Alert.alert('Error', 'Maximum deposit amount is R10,000');
      return;
    }

    // Navigate to selected funding method
    if (selectedMethod === 'payfast') {
      router.push(`/wallet-fund-payfast?amount=${amount}`);
    } else if (selectedMethod === 'ozow') {
      router.push(`/wallet-fund-ozow?amount=${amount}`);
    } else if (selectedMethod === 'payshap') {
      router.push(`/wallet-fund-payshap?amount=${amount}`);
    }
  };

  const quickAmounts = ['50', '100', '200', '500', '1000'];

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
              <Text className="text-2xl font-bold text-foreground">Deposit Money</Text>
              <Text className="text-sm text-muted">Add funds to your wallet</Text>
            </View>
          </View>

          {/* Amount Input */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-2">Amount (ZAR)</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <View className="flex-row items-center px-4">
                <Text className="text-foreground text-2xl font-bold">R</Text>
                <TextInput
                  className="flex-1 text-foreground py-4 px-3 text-2xl font-bold"
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <Text className="text-muted text-xs mt-2">
              Min: R10 • Max: R10,000
            </Text>
          </View>

          {/* Quick Amount Buttons */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-3">Quick Amounts</Text>
            <View className="flex-row flex-wrap gap-2">
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  onPress={() => setAmount(quickAmount)}
                  className={`px-6 py-3 rounded-xl border ${
                    amount === quickAmount
                      ? 'bg-primary border-primary'
                      : 'bg-card border-border'
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

          {/* Funding Method Selection */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-3">Payment Method</Text>
            <View className="space-y-3">
              {FUNDING_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setSelectedMethod(method.id)}
                  className={`bg-card rounded-2xl p-4 border ${
                    selectedMethod === method.id
                      ? 'border-primary'
                      : 'border-border'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                        selectedMethod === method.id
                          ? 'bg-primary/20'
                          : 'bg-muted/10'
                      }`}
                    >
                      <IconSymbol
                        name={method.icon}
                        size={24}
                        color={selectedMethod === method.id ? colors.primary : colors.muted}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-foreground font-semibold">{method.name}</Text>
                        {method.recommended && (
                          <View className="bg-primary/20 px-2 py-1 rounded-full ml-2">
                            <Text className="text-primary text-xs font-medium">Recommended</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-muted text-xs mt-1">{method.description}</Text>
                    </View>
                    <View
                      className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                        selectedMethod === method.id
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}
                    >
                      {selectedMethod === method.id && (
                        <IconSymbol name="checkmark" size={12} color="white" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Instant Deposits</Text>
                <Text className="text-muted text-sm">
                  Funds are typically available in your wallet within minutes after successful payment.
                </Text>
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!amount || parseFloat(amount) <= 0}
            className={`bg-primary rounded-2xl p-4 items-center ${
              !amount || parseFloat(amount) <= 0 ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-white font-semibold text-lg">Continue to Payment</Text>
          </TouchableOpacity>

          {/* Security Notice */}
          <View className="mt-6 bg-card rounded-2xl p-4 border border-border">
            <View className="flex-row items-start">
              <IconSymbol name="lock.shield.fill" size={20} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Secure Payments</Text>
                <Text className="text-muted text-xs">
                  All transactions are encrypted and processed through secure payment gateways. Your financial information is never stored on our servers.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
