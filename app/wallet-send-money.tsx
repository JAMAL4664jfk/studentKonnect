import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { walletAPI } from '@/lib/wallet-api';
import Toast from 'react-native-toast-message';

const QUICK_AMOUNTS = ['50', '100', '200', '500', '1000'];

export default function WalletSendMoneyScreen() {
  const colors = useColors();
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMoney = async () => {
    if (!recipientPhone || recipientPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // Create P2P payment intent
      const intentResponse = await walletAPI.createP2PIntent(
        parseFloat(amount),
        recipientPhone,
        note || 'P2P Transfer'
      );

      console.log('P2P Intent Response:', intentResponse);

      // Navigate to PIN confirmation with intent data
      router.push({
        pathname: '/wallet-send-money-confirm',
        params: {
          recipientPhone,
          amount,
          note,
          intentData: JSON.stringify(intentResponse.data),
        },
      });
    } catch (error: any) {
      console.error('P2P Intent Error:', error);
      
      // Check if it's insufficient funds error
      if (error.message?.includes('Insufficient Funds')) {
        Alert.alert(
          'Insufficient Funds',
          'You do not have enough balance to complete this transfer. Please deposit funds first.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Deposit', onPress: () => router.push('/wallet-deposit') },
          ]
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Transfer Failed',
          text2: error.message || 'Unable to initiate transfer',
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
              <Text className="text-2xl font-bold text-foreground">Send Money</Text>
              <Text className="text-sm text-muted">Transfer to another wallet</Text>
            </View>
          </View>

          {/* Recipient Phone Number */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-2">Recipient Phone Number</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <TextInput
                className="text-foreground py-4 px-4"
                placeholder="0XX XXX XXXX"
                placeholderTextColor={colors.muted}
                value={recipientPhone}
                onChangeText={setRecipientPhone}
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

          {/* Note (Optional) */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-2">Note (Optional)</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <TextInput
                className="text-foreground py-4 px-4"
                placeholder="Add a note..."
                placeholderTextColor={colors.muted}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Instant Transfer</Text>
                <Text className="text-muted text-sm">
                  Money will be sent instantly to the recipient's wallet. No fees for wallet-to-wallet transfers.
                </Text>
              </View>
            </View>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSendMoney}
            disabled={!recipientPhone || !amount || loading}
            className={`bg-primary rounded-2xl p-4 items-center ${
              !recipientPhone || !amount || loading ? 'opacity-50' : ''
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-lg">Continue</Text>
            )}
          </TouchableOpacity>

          {/* Recent Recipients */}
          <View className="mt-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Recent Recipients</Text>
            <View className="bg-card rounded-2xl p-6 border border-border items-center">
              <IconSymbol name="person.2.fill" size={48} color={colors.muted} />
              <Text className="text-foreground font-medium mt-3">No Recent Transfers</Text>
              <Text className="text-muted text-sm text-center mt-2">
                Your recent recipients will appear here
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
