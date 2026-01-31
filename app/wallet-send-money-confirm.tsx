import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

export default function WalletSendMoneyConfirmScreen() {
  const colors = useColors();
  const { recipientPhone, amount, note } = useLocalSearchParams();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (pin.length !== 5) {
      Alert.alert('Error', 'Please enter your 5-digit PIN');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Transfer Successful',
        `R${parseFloat(amount as string).toFixed(2)} has been sent to ${recipientPhone}`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/wallet-dashboard'),
          },
        ]
      );
    }, 1500);
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
              <Text className="text-2xl font-bold text-foreground">Confirm Transfer</Text>
              <Text className="text-sm text-muted">Enter your PIN to continue</Text>
            </View>
          </View>

          {/* Amount Display */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-6 mb-6 items-center">
            <Text className="text-muted text-sm mb-2">Sending</Text>
            <Text className="text-foreground text-4xl font-bold mb-1">
              R{parseFloat(amount as string).toFixed(2)}
            </Text>
            <Text className="text-muted text-xs">to {recipientPhone}</Text>
          </View>

          {/* Transfer Details */}
          <View className="bg-card rounded-2xl p-4 border border-border mb-6">
            <Text className="text-foreground font-semibold mb-3">Transfer Details</Text>
            
            <View className="flex-row justify-between py-2">
              <Text className="text-muted">Recipient</Text>
              <Text className="text-foreground font-medium">{recipientPhone}</Text>
            </View>
            
            <View className="flex-row justify-between py-2">
              <Text className="text-muted">Amount</Text>
              <Text className="text-foreground font-medium">R{parseFloat(amount as string).toFixed(2)}</Text>
            </View>
            
            <View className="flex-row justify-between py-2">
              <Text className="text-muted">Transfer Fee</Text>
              <Text className="text-green-500 font-medium">FREE</Text>
            </View>
            
            {note && (
              <View className="py-2 mt-2 border-t border-border">
                <Text className="text-muted mb-1">Note</Text>
                <Text className="text-foreground">{note}</Text>
              </View>
            )}
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
                  const cleaned = text.replace(/[^0-9]/g, '').slice(0, 5);
                  setPin(cleaned);
                }}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={5}
                editable={!loading}
              />
            </View>
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
              <Text className="text-white font-semibold text-lg">Confirm Transfer</Text>
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
                  Your PIN is required to authorize this transfer. The money will be sent instantly to the recipient's wallet.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
