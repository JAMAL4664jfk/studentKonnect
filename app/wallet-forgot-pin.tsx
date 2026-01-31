import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/Colors';
import { WalletAPI } from '@/lib/wallet-api';

export default function WalletForgotPinScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const walletAPI = new WalletAPI();

  const handleResetPin = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Validate phone number format (South African format)
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid South African phone number');
      return;
    }

    try {
      setLoading(true);
      await walletAPI.resetPin(phoneNumber);
      
      Alert.alert(
        'PIN Reset Initiated',
        'An OTP has been sent to your phone number. Please check your messages and follow the instructions to create a new PIN.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to create PIN screen or back to login
              router.replace('/wallet-create-pin');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Reset PIN error:', error);
      Alert.alert(
        'Reset Failed',
        error.message || 'Failed to reset PIN. Please try again or contact support.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 pt-12">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center mr-4"
          >
            <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-foreground">Forgot PIN</Text>
            <Text className="text-sm text-muted">Reset your wallet PIN</Text>
          </View>
        </View>

        {/* Info Card */}
        <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start">
            <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
            <View className="flex-1 ml-3">
              <Text className="text-foreground font-semibold mb-1">PIN Reset Process</Text>
              <Text className="text-muted text-sm">
                Enter your registered phone number. We'll send you an OTP to verify your identity and allow you to create a new PIN.
              </Text>
            </View>
          </View>
        </View>

        {/* Phone Number Input */}
        <View className="mb-6">
          <Text className="text-foreground font-medium mb-2">Phone Number</Text>
          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            <View className="flex-row items-center px-4">
              <IconSymbol name="phone.fill" size={20} color={colors.muted} />
              <TextInput
                className="flex-1 text-foreground py-4 px-3"
                placeholder="0812345678"
                placeholderTextColor={colors.muted}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
              />
            </View>
          </View>
          <Text className="text-muted text-xs mt-2">
            Enter the phone number you used to register your wallet account
          </Text>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          onPress={handleResetPin}
          disabled={loading}
          className={`bg-primary rounded-2xl p-4 items-center mb-4 ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-lg">Send Reset OTP</Text>
          )}
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
          className="items-center py-3"
        >
          <Text className="text-primary font-medium">Back to Login</Text>
        </TouchableOpacity>

        {/* Help Section */}
        <View className="mt-auto mb-6">
          <View className="bg-card rounded-2xl p-4 border border-border">
            <Text className="text-foreground font-semibold mb-2">Need Help?</Text>
            <Text className="text-muted text-sm mb-3">
              If you no longer have access to your registered phone number, please contact our support team.
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <IconSymbol name="envelope.fill" size={16} color={colors.primary} />
              <Text className="text-primary text-sm ml-2 font-medium">Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
