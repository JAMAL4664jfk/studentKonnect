import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ScreenContainer } from '@/components/ScreenContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/Colors';
import { WalletAPI } from '@/lib/wallet-api';

export default function WalletFundPayFastScreen() {
  const { amount } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [orderId, setOrderId] = useState('');
  const walletAPI = new WalletAPI();

  useEffect(() => {
    initiatePayFastPayment();
  }, []);

  const initiatePayFastPayment = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.fundViaPayFast(amount as string);
      
      if (response.data?.checkoutUrl) {
        setCheckoutUrl(response.data.checkoutUrl);
        setOrderId(response.data.order_id);
      } else {
        throw new Error('Failed to get checkout URL');
      }
    } catch (error: any) {
      console.error('PayFast initiation error:', error);
      Alert.alert(
        'Payment Error',
        error.message || 'Failed to initiate payment. Please try again.',
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

    // Check for return URL (success)
    if (url.includes('payfast_notify/return')) {
      Alert.alert(
        'Payment Successful',
        'Your deposit has been processed successfully. Funds will be available shortly.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/wallet-dashboard'),
          },
        ]
      );
    }

    // Check for cancel URL
    if (url.includes('payfast_notify/cancel')) {
      Alert.alert(
        'Payment Cancelled',
        'You cancelled the payment. No funds were deducted.',
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
            Connecting to PayFast secure checkout
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
                <Text className="text-lg font-bold text-foreground">PayFast Checkout</Text>
                <Text className="text-sm text-muted">Depositing R{amount}</Text>
              </View>
            </View>
            <View className="bg-green-500/10 px-3 py-1 rounded-full">
              <Text className="text-green-600 text-xs font-medium">Secure</Text>
            </View>
          </View>
        </View>

        {/* WebView */}
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
            <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.muted} />
            <Text className="text-foreground font-semibold text-lg mt-4">
              Unable to Load Checkout
            </Text>
            <Text className="text-muted text-center mt-2">
              Failed to load PayFast checkout page. Please try again.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-primary rounded-2xl px-6 py-3 mt-6"
            >
              <Text className="text-white font-semibold">Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Footer */}
        <View className="px-6 py-4 bg-card border-t border-border">
          <View className="flex-row items-center">
            <IconSymbol name="lock.shield.fill" size={16} color={colors.primary} />
            <Text className="text-muted text-xs ml-2">
              Secured by PayFast • Order ID: {orderId}
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
