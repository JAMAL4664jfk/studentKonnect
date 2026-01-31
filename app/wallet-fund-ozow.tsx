import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/Colors';
import { WalletAPI } from '@/lib/wallet-api';

export default function WalletFundOzowScreen() {
  const { amount } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const walletAPI = new WalletAPI();

  useEffect(() => {
    initiateOzowPayment();
  }, []);

  const initiateOzowPayment = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.fundViaOzow(amount as string);
      
      console.log('Ozow Response:', response);

      // Check if we got a checkout URL or payment URL
      if (response.data?.checkoutUrl || response.data?.paymentUrl || response.data?.url) {
        const url = response.data.checkoutUrl || response.data.paymentUrl || response.data.url;
        setCheckoutUrl(url);
        setTransactionId(response.data.transactionId || response.data.transaction_id || 'N/A');
      } else if (response.statusCode === 200 && response.data) {
        // Payment initiated successfully but no URL
        Alert.alert(
          'Payment Initiated',
          'Your Ozow payment has been initiated. Please check your banking app to complete the payment.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/wallet-dashboard'),
            },
          ]
        );
      } else {
        throw new Error(response.messages || 'Failed to initiate Ozow payment');
      }
    } catch (error: any) {
      console.error('Ozow initiation error:', error);
      Alert.alert(
        'Payment Error',
        error.message || 'Failed to initiate Ozow payment. Please try again or use a different payment method.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log('WebView URL:', url);

    // Check for success URL patterns
    if (url.includes('success') || url.includes('complete') || url.includes('approved')) {
      Alert.alert(
        'Payment Successful',
        'Your Ozow payment has been processed successfully. Funds will be available shortly.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/wallet-dashboard'),
          },
        ]
      );
    }

    // Check for cancel/error URL patterns
    if (url.includes('cancel') || url.includes('error') || url.includes('declined')) {
      Alert.alert(
        'Payment Failed',
        'Your payment was not completed. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-foreground font-semibold text-lg mt-4">
            Preparing Payment...
          </Text>
          <Text className="text-muted text-center mt-2">
            Connecting to Ozow secure checkout
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-12 pb-4 bg-card border-b border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Cancel Payment',
                    'Are you sure you want to cancel this payment?',
                    [
                      { text: 'No', style: 'cancel' },
                      { text: 'Yes', onPress: () => router.back() },
                    ]
                  );
                }}
                className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center mr-4"
              >
                <IconSymbol name="xmark" size={20} color={colors.foreground} />
              </TouchableOpacity>
              <View>
                <Text className="text-lg font-bold text-foreground">Ozow Instant EFT</Text>
                <Text className="text-sm text-muted">Depositing R{amount}</Text>
              </View>
            </View>
            <View className="bg-green-500/10 px-3 py-1 rounded-full">
              <Text className="text-green-600 text-xs font-medium">Secure</Text>
            </View>
          </View>
        </View>

        {/* WebView or Info */}
        {checkoutUrl ? (
          <WebView
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            style={{ flex: 1 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <View className="bg-primary/10 rounded-full w-20 h-20 items-center justify-center mb-4">
              <IconSymbol name="bolt.circle.fill" size={48} color={colors.primary} />
            </View>
            <Text className="text-foreground font-semibold text-lg mb-2">
              Payment Initiated
            </Text>
            <Text className="text-muted text-center mb-6">
              Your Ozow payment request has been sent. Please complete the payment in your banking app.
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/wallet-dashboard')}
              className="bg-primary rounded-2xl px-6 py-3"
            >
              <Text className="text-white font-semibold">Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Footer */}
        <View className="px-6 py-4 bg-card border-t border-border">
          <View className="flex-row items-center">
            <IconSymbol name="lock.shield.fill" size={16} color={colors.primary} />
            <Text className="text-muted text-xs ml-2">
              Secured by Ozow{transactionId !== 'N/A' ? ` • Transaction: ${transactionId}` : ''}
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
