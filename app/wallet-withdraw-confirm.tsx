import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/constants/Colors';
import { WalletAPI } from '@/lib/wallet-api';

export default function WalletWithdrawConfirmScreen() {
  const { amount, fee } = useLocalSearchParams();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);
  const walletAPI = new WalletAPI();

  const withdrawAmount = parseFloat(amount as string);
  const feeAmount = parseFloat(fee as string);
  const totalAmount = withdrawAmount + feeAmount;

  const handleConfirm = async () => {
    if (pin.length !== 5) {
      Alert.alert('Error', 'Please enter your 5-digit PIN');
      return;
    }

    try {
      setLoading(true);
      const response = await walletAPI.processCashout(withdrawAmount, feeAmount, pin);

      if (response.statusCode === 200) {
        Alert.alert(
          'Withdrawal Successful',
          `R${withdrawAmount.toFixed(2)} has been withdrawn from your wallet. Funds will be sent to your bank account within 1-3 business days.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/wallet-dashboard'),
            },
          ]
        );
      } else {
        throw new Error(response.messages || 'Withdrawal failed');
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      
      // Check for PIN error
      if (error.message.includes('Pin') || error.message.includes('PIN')) {
        const newAttempts = pinAttempts + 1;
        setPinAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          Alert.alert(
            'Too Many Attempts',
            'You have entered an incorrect PIN too many times. Please try again later or reset your PIN.',
            [
              {
                text: 'Reset PIN',
                onPress: () => router.push('/wallet-forgot-pin'),
              },
              {
                text: 'Cancel',
                onPress: () => router.back(),
                style: 'cancel',
              },
            ]
          );
        } else {
          Alert.alert(
            'Incorrect PIN',
            `${error.message}\n\nAttempts remaining: ${3 - newAttempts}`,
            [{ text: 'Try Again' }]
          );
          setPin('');
        }
      } else {
        Alert.alert(
          'Withdrawal Failed',
          error.message || 'Failed to process withdrawal. Please try again.'
        );
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
              <Text className="text-2xl font-bold text-foreground">Confirm Withdrawal</Text>
              <Text className="text-sm text-muted">Enter your PIN to continue</Text>
            </View>
          </View>

          {/* Amount Display */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-6 mb-6 items-center">
            <Text className="text-muted text-sm mb-2">Withdrawal Amount</Text>
            <Text className="text-foreground text-4xl font-bold mb-1">R{withdrawAmount.toFixed(2)}</Text>
            <Text className="text-muted text-xs">+ R{feeAmount.toFixed(2)} fee</Text>
          </View>

          {/* Withdrawal Summary */}
          <View className="bg-card rounded-2xl p-4 border border-border mb-6">
            <Text className="text-foreground font-semibold mb-3">Transaction Details</Text>
            
            <View className="flex-row justify-between py-2">
              <Text className="text-muted">Withdrawal Amount</Text>
              <Text className="text-foreground font-medium">R{withdrawAmount.toFixed(2)}</Text>
            </View>
            
            <View className="flex-row justify-between py-2">
              <Text className="text-muted">Transaction Fee</Text>
              <Text className="text-foreground font-medium">R{feeAmount.toFixed(2)}</Text>
            </View>
            
            <View className="border-t border-border my-2" />
            
            <View className="flex-row justify-between py-2">
              <Text className="text-foreground font-semibold">Total to Deduct</Text>
              <Text className="text-foreground font-bold text-lg">R{totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          {/* PIN Input */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-2">Enter Your PIN</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <TextInput
                className="text-foreground py-4 px-4 text-2xl font-bold text-center tracking-widest"
                placeholder="• • • • •"
                placeholderTextColor={colors.muted}
                value={pin}
                onChangeText={(text) => {
                  // Only allow numbers and max 5 digits
                  const cleaned = text.replace(/[^0-9]/g, '').slice(0, 5);
                  setPin(cleaned);
                }}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={5}
                editable={!loading}
              />
            </View>
            {pinAttempts > 0 && (
              <Text className="text-red-500 text-xs mt-2">
                ⚠️ {pinAttempts} incorrect attempt(s). {3 - pinAttempts} remaining.
              </Text>
            )}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={pin.length !== 5 || loading}
            className={`bg-primary rounded-2xl p-4 items-center mb-4 ${
              pin.length !== 5 || loading ? 'opacity-50' : ''
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-lg">Confirm Withdrawal</Text>
            )}
          </TouchableOpacity>

          {/* Forgot PIN Link */}
          <TouchableOpacity
            onPress={() => router.push('/wallet-forgot-pin')}
            className="items-center mb-6"
          >
            <Text className="text-primary font-medium">Forgot PIN?</Text>
          </TouchableOpacity>

          {/* Security Notice */}
          <View className="bg-card rounded-2xl p-4 border border-border">
            <View className="flex-row items-start">
              <IconSymbol name="lock.shield.fill" size={20} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Secure Transaction</Text>
                <Text className="text-muted text-xs">
                  Your PIN is required to authorize this withdrawal. The funds will be transferred to your linked bank account within 1-3 business days.
                </Text>
              </View>
            </View>
          </View>

          {/* Important Info */}
          <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mt-4">
            <View className="flex-row items-start">
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#EAB308" />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Important</Text>
                <Text className="text-muted text-xs">
                  • Ensure you have sufficient balance (R{totalAmount.toFixed(2)} will be deducted){'\n'}
                  • This transaction cannot be reversed{'\n'}
                  • Contact support if funds don't arrive within 3 business days
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
