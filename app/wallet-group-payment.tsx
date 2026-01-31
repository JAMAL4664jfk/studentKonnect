import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { walletAPI } from '@/lib/wallet-api';
import Toast from 'react-native-toast-message';

const QUICK_AMOUNTS = ['100', '200', '500', '1000', '2000'];

export default function WalletGroupPaymentScreen() {
  const colors = useColors();
  const [toWallet, setToWallet] = useState('');
  const [fromWallet, setFromWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'fund' | 'withdraw'>('fund');
  const [loading, setLoading] = useState(false);

  const handleGroupPayment = async () => {
    if (!toWallet || toWallet.length < 7) {
      Alert.alert('Error', 'Please enter a valid recipient wallet ID');
      return;
    }
    if (!fromWallet || fromWallet.length < 7) {
      Alert.alert('Error', 'Please enter a valid sender wallet ID');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // Create group payment intent
      const intentResponse = await walletAPI.createGroupPaymentIntent(
        parseFloat(amount),
        toWallet,
        fromWallet,
        type
      );

      console.log('Group Payment Intent Response:', intentResponse);

      Toast.show({
        type: 'success',
        text1: 'Payment Intent Created',
        text2: `${type === 'fund' ? 'Funding' : 'Withdrawal'} intent created successfully`,
      });

      // Navigate to confirmation or back to dashboard
      router.back();
    } catch (error: any) {
      console.error('Group Payment Intent Error:', error);
      
      // Check if it's insufficient funds error
      if (error.message?.includes('Insufficient Funds')) {
        Alert.alert(
          'Insufficient Funds',
          'The wallet does not have enough balance to complete this transaction.',
          [
            { text: 'OK', style: 'cancel' },
          ]
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Payment Failed',
          text2: error.message || 'Unable to create payment intent',
        });
      }
    } finally {
      setLoading(false);
    }
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
              <Text className="text-2xl font-bold text-foreground">Group Payment</Text>
              <Text className="text-sm text-muted">Fund or withdraw from group wallet</Text>
            </View>
          </View>

          {/* Payment Type Selection */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-3">Payment Type</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setType('fund')}
                className={`flex-1 rounded-2xl p-4 border ${
                  type === 'fund' ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}
              >
                <View className="items-center">
                  <IconSymbol 
                    name="arrow.down.circle.fill" 
                    size={32} 
                    color={type === 'fund' ? '#fff' : colors.primary} 
                  />
                  <Text className={`font-semibold mt-2 ${type === 'fund' ? 'text-white' : 'text-foreground'}`}>
                    Fund Group
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType('withdraw')}
                className={`flex-1 rounded-2xl p-4 border ${
                  type === 'withdraw' ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}
              >
                <View className="items-center">
                  <IconSymbol 
                    name="arrow.up.circle.fill" 
                    size={32} 
                    color={type === 'withdraw' ? '#fff' : colors.primary} 
                  />
                  <Text className={`font-semibold mt-2 ${type === 'withdraw' ? 'text-white' : 'text-foreground'}`}>
                    Withdraw
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* To Wallet ID */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-2">To Wallet ID</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <TextInput
                className="text-foreground py-4 px-4"
                placeholder="Enter recipient wallet ID"
                placeholderTextColor={colors.muted}
                value={toWallet}
                onChangeText={setToWallet}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* From Wallet ID */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-2">From Wallet ID</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <TextInput
                className="text-foreground py-4 px-4"
                placeholder="Enter sender wallet ID"
                placeholderTextColor={colors.muted}
                value={fromWallet}
                onChangeText={setFromWallet}
                keyboardType="numeric"
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
                    className={`font-semibold ${amount === quickAmount ? 'text-white' : 'text-foreground'}`}
                  >
                    R{quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Group Payment</Text>
                <Text className="text-muted text-sm">
                  {type === 'fund' 
                    ? 'Fund a group wallet by transferring money from one wallet to another.'
                    : 'Withdraw money from a group wallet to another wallet.'}
                </Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleGroupPayment}
            disabled={!toWallet || !fromWallet || !amount || loading}
            className={`bg-primary rounded-2xl p-4 items-center ${
              !toWallet || !fromWallet || !amount || loading ? 'opacity-50' : ''
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-lg">
                {type === 'fund' ? 'Fund Group Wallet' : 'Withdraw from Group'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
