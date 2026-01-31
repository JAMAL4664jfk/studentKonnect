import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/Colors';
import { WalletAPI } from '@/lib/wallet-api';

interface FeeStructure {
  id: number;
  min: number;
  max: number;
  amount: number;
}

export default function WalletWithdrawScreen() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [quickAmounts, setQuickAmounts] = useState<string[]>([]);
  const [fees, setFees] = useState<FeeStructure[]>([]);
  const [minAmount, setMinAmount] = useState(50);
  const [maxAmount, setMaxAmount] = useState(4000);
  const [calculatedFee, setCalculatedFee] = useState(0);
  const walletAPI = new WalletAPI();

  useEffect(() => {
    fetchCashoutInfo();
  }, []);

  useEffect(() => {
    if (amount && fees.length > 0) {
      calculateFee(parseFloat(amount));
    } else {
      setCalculatedFee(0);
    }
  }, [amount, fees]);

  const fetchCashoutInfo = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getCashoutInfo();
      
      if (response.data && response.data.length > 0) {
        const info = response.data[0];
        setQuickAmounts(info.quickAmounts || ['50', '100', '200', '500']);
        setFees(info.fees || []);
        setMinAmount(info.min || 50);
        setMaxAmount(info.max || 4000);
      }
    } catch (error: any) {
      console.error('Failed to fetch cashout info:', error);
      // Use default values
      setQuickAmounts(['50', '100', '200', '500']);
      setFees([
        { id: 1, min: 50, max: 1000, amount: 17.5 },
        { id: 2, min: 1001, max: 2000, amount: 30 },
        { id: 3, min: 2001, max: 3000, amount: 40 },
        { id: 4, min: 3001, max: 4000, amount: 47.5 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateFee = (withdrawAmount: number) => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      setCalculatedFee(0);
      return;
    }

    const applicableFee = fees.find(
      (fee) => withdrawAmount >= fee.min && withdrawAmount <= fee.max
    );

    if (applicableFee) {
      setCalculatedFee(applicableFee.amount);
    } else {
      setCalculatedFee(0);
    }
  };

  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount < minAmount) {
      Alert.alert('Error', `Minimum withdrawal amount is R${minAmount}`);
      return;
    }

    if (withdrawAmount > maxAmount) {
      Alert.alert('Error', `Maximum withdrawal amount is R${maxAmount}`);
      return;
    }

    if (calculatedFee === 0) {
      Alert.alert('Error', 'Unable to calculate fee for this amount');
      return;
    }

    // Navigate to PIN verification
    router.push({
      pathname: '/wallet-withdraw-confirm',
      params: {
        amount: withdrawAmount.toString(),
        fee: calculatedFee.toString(),
      },
    });
  };

  const totalAmount = amount ? parseFloat(amount) + calculatedFee : 0;

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted mt-4">Loading withdrawal info...</Text>
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
              <Text className="text-2xl font-bold text-foreground">Withdraw Money</Text>
              <Text className="text-sm text-muted">Cash out to your bank</Text>
            </View>
          </View>

          {/* Amount Input */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-2">Withdrawal Amount (ZAR)</Text>
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
              Min: R{minAmount} • Max: R{maxAmount}
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

          {/* Fee Breakdown */}
          {amount && parseFloat(amount) > 0 && (
            <View className="bg-card rounded-2xl p-4 border border-border mb-6">
              <Text className="text-foreground font-semibold mb-3">Withdrawal Summary</Text>
              
              <View className="flex-row justify-between py-2">
                <Text className="text-muted">Withdrawal Amount</Text>
                <Text className="text-foreground font-medium">R{parseFloat(amount).toFixed(2)}</Text>
              </View>
              
              <View className="flex-row justify-between py-2">
                <Text className="text-muted">Transaction Fee</Text>
                <Text className="text-foreground font-medium">R{calculatedFee.toFixed(2)}</Text>
              </View>
              
              <View className="border-t border-border my-2" />
              
              <View className="flex-row justify-between py-2">
                <Text className="text-foreground font-semibold">Total Deducted</Text>
                <Text className="text-foreground font-bold text-lg">R{totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {/* Fee Structure Info */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Fee Structure</Text>
                {fees.map((fee, index) => (
                  <Text key={index} className="text-muted text-sm">
                    R{fee.min} - R{fee.max}: R{fee.amount.toFixed(2)} fee
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!amount || parseFloat(amount) <= 0 || calculatedFee === 0}
            className={`bg-primary rounded-2xl p-4 items-center mb-4 ${
              !amount || parseFloat(amount) <= 0 || calculatedFee === 0 ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-white font-semibold text-lg">Continue to Confirmation</Text>
          </TouchableOpacity>

          {/* Important Notice */}
          <View className="bg-card rounded-2xl p-4 border border-border">
            <View className="flex-row items-start">
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Important</Text>
                <Text className="text-muted text-xs">
                  • Funds will be sent to your linked bank account{'\n'}
                  • Processing time: 1-3 business days{'\n'}
                  • You'll need to enter your PIN to confirm{'\n'}
                  • Ensure you have sufficient balance
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
