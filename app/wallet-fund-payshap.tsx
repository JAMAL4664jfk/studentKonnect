import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/Colors';
import { WalletAPI } from '@/lib/wallet-api';

const BANKS = [
  { code: '051001', domain: 'standardbank', identifier: '210001', name: 'Standard Bank', logo: 'building.columns.fill' },
  { code: '470010', domain: 'capitecbank', identifier: '470010', name: 'Capitec Bank', logo: 'building.columns.fill' },
  { code: '632005', domain: 'absa', identifier: '632005', name: 'ABSA', logo: 'building.columns.fill' },
  { code: '250655', domain: 'fnb', identifier: '250655', name: 'FNB', logo: 'building.columns.fill' },
  { code: '198765', domain: 'nedbank', identifier: '198765', name: 'Nedbank', logo: 'building.columns.fill' },
  { code: '410506', domain: 'investec', identifier: '410506', name: 'Investec', logo: 'building.columns.fill' },
  { code: '450105', domain: 'africanbank', identifier: '450105', name: 'African Bank', logo: 'building.columns.fill' },
  { code: '679000', domain: 'discoverybank', identifier: '679000', name: 'Discovery Bank', logo: 'building.columns.fill' },
  { code: '678910', domain: 'tymebank', identifier: '678910', name: 'TymeBank', logo: 'building.columns.fill' },
];

export default function WalletFundPayShapScreen() {
  const { amount } = useLocalSearchParams();
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const walletAPI = new WalletAPI();

  const handleProceed = async () => {
    if (!selectedBank) {
      Alert.alert('Error', 'Please select your bank');
      return;
    }

    try {
      setLoading(true);
      const response = await walletAPI.fundViaPayShap(
        amount as string,
        selectedBank.code,
        selectedBank.domain,
        selectedBank.identifier
      );

      console.log('PayShap Response:', response);

      // Check if payment was successful
      if (response.statusCode === 200 || response.data) {
        Alert.alert(
          'Payment Initiated',
          'Your payment request has been sent. Please complete the payment in your banking app.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/wallet-dashboard'),
            },
          ]
        );
      } else {
        throw new Error(response.messages || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('PayShap payment error:', error);
      Alert.alert(
        'Payment Error',
        error.message || 'Failed to initiate payment. Please try again or use a different payment method.'
      );
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
              <Text className="text-2xl font-bold text-foreground">PayShap Payment</Text>
              <Text className="text-sm text-muted">Instant EFT from your bank</Text>
            </View>
          </View>

          {/* Amount Display */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-6 mb-6 items-center">
            <Text className="text-muted text-sm mb-2">Amount to Deposit</Text>
            <Text className="text-foreground text-4xl font-bold">R{amount}</Text>
          </View>

          {/* Bank Selection */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-3">Select Your Bank</Text>
            <View className="space-y-3">
              {BANKS.map((bank) => (
                <TouchableOpacity
                  key={bank.code}
                  onPress={() => setSelectedBank(bank)}
                  className={`bg-card rounded-2xl p-4 border ${
                    selectedBank?.code === bank.code
                      ? 'border-primary'
                      : 'border-border'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                        selectedBank?.code === bank.code
                          ? 'bg-primary/20'
                          : 'bg-muted/10'
                      }`}
                    >
                      <IconSymbol
                        name={bank.logo}
                        size={24}
                        color={selectedBank?.code === bank.code ? colors.primary : colors.muted}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold">{bank.name}</Text>
                      <Text className="text-muted text-xs mt-1">Instant EFT</Text>
                    </View>
                    <View
                      className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                        selectedBank?.code === bank.code
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}
                    >
                      {selectedBank?.code === bank.code && (
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
                <Text className="text-foreground font-semibold mb-1">How it Works</Text>
                <Text className="text-muted text-sm">
                  1. Select your bank{'\n'}
                  2. You'll be redirected to your banking app{'\n'}
                  3. Approve the payment{'\n'}
                  4. Funds appear instantly in your wallet
                </Text>
              </View>
            </View>
          </View>

          {/* Proceed Button */}
          <TouchableOpacity
            onPress={handleProceed}
            disabled={!selectedBank || loading}
            className={`bg-primary rounded-2xl p-4 items-center mb-4 ${
              !selectedBank || loading ? 'opacity-50' : ''
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-lg">
                Proceed to {selectedBank?.name || 'Bank'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Security Notice */}
          <View className="bg-card rounded-2xl p-4 border border-border">
            <View className="flex-row items-start">
              <IconSymbol name="lock.shield.fill" size={20} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Secure Payment</Text>
                <Text className="text-muted text-xs">
                  You'll be redirected to your bank's secure payment page. We never see or store your banking credentials.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
