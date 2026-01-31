import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { walletAPI } from '@/lib/wallet-api';
import Toast from 'react-native-toast-message';

const SUBSCRIPTION_PRODUCTS = [
  {
    id: 11,
    name: 'Premium Plan',
    description: 'Full access to all features',
    price: 'R99/month',
    features: ['Unlimited transactions', 'Priority support', 'Advanced analytics', 'No fees'],
    tiers: [
      { id: 29, name: 'Monthly', price: 'R99' },
      { id: 30, name: 'Yearly', price: 'R990' },
    ],
  },
  {
    id: 12,
    name: 'Business Plan',
    description: 'For business accounts',
    price: 'R299/month',
    features: ['Multiple users', 'API access', 'Custom branding', 'Dedicated support'],
    tiers: [
      { id: 31, name: 'Monthly', price: 'R299' },
      { id: 32, name: 'Yearly', price: 'R2990' },
    ],
  },
];

export default function WalletSubscriptionsScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const handleSubscribe = async (productId: number, tierId?: number) => {
    const product = SUBSCRIPTION_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const tier = tierId ? product.tiers.find(t => t.id === tierId) : null;

    Alert.alert(
      'Confirm Subscription',
      `Subscribe to ${product.name}${tier ? ` (${tier.name})` : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            setLoading(true);
            setSelectedProduct(productId);
            setSelectedTier(tierId || null);

            try {
              const intentResponse = await walletAPI.createSubscriptionIntent(
                productId,
                tierId
              );

              console.log('Subscription Intent Response:', intentResponse);

              Toast.show({
                type: 'success',
                text1: 'Subscription Activated',
                text2: `Successfully subscribed to ${product.name}`,
              });

              router.back();
            } catch (error: any) {
              console.error('Subscription Error:', error);
              
              if (error.message?.includes('not available for your white label')) {
                Alert.alert(
                  'Subscription Unavailable',
                  'This subscription is not available for your account type. Please contact support for more information.',
                  [{ text: 'OK' }]
                );
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Subscription Failed',
                  text2: error.message || 'Unable to activate subscription',
                });
              }
            } finally {
              setLoading(false);
              setSelectedProduct(null);
              setSelectedTier(null);
            }
          },
        },
      ]
    );
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
              <Text className="text-2xl font-bold text-foreground">Subscriptions</Text>
              <Text className="text-sm text-muted">Upgrade your wallet experience</Text>
            </View>
          </View>

          {/* Subscription Plans */}
          {SUBSCRIPTION_PRODUCTS.map((product) => (
            <View key={product.id} className="bg-card rounded-2xl p-6 mb-4 border border-border">
              {/* Plan Header */}
              <View className="mb-4">
                <Text className="text-xl font-bold text-foreground mb-1">{product.name}</Text>
                <Text className="text-muted text-sm mb-2">{product.description}</Text>
                <Text className="text-primary text-2xl font-bold">{product.price}</Text>
              </View>

              {/* Features */}
              <View className="mb-4">
                <Text className="text-foreground font-semibold mb-2">Features:</Text>
                {product.features.map((feature, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <IconSymbol name="checkmark.circle.fill" size={18} color={colors.primary} />
                    <Text className="text-muted text-sm ml-2">{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Tier Selection */}
              <View className="mb-4">
                <Text className="text-foreground font-semibold mb-2">Billing Period:</Text>
                <View className="flex-row gap-3">
                  {product.tiers.map((tier) => (
                    <TouchableOpacity
                      key={tier.id}
                      onPress={() => handleSubscribe(product.id, tier.id)}
                      disabled={loading && selectedProduct === product.id && selectedTier === tier.id}
                      className="flex-1 bg-primary/10 border border-primary rounded-xl p-3"
                    >
                      {loading && selectedProduct === product.id && selectedTier === tier.id ? (
                        <ActivityIndicator color={colors.primary} />
                      ) : (
                        <>
                          <Text className="text-foreground font-semibold text-center mb-1">
                            {tier.name}
                          </Text>
                          <Text className="text-primary text-center font-bold">{tier.price}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Subscribe Button (without tier) */}
              <TouchableOpacity
                onPress={() => handleSubscribe(product.id)}
                disabled={loading && selectedProduct === product.id && !selectedTier}
                className={`bg-primary rounded-xl p-4 items-center ${
                  loading && selectedProduct === product.id && !selectedTier ? 'opacity-50' : ''
                }`}
              >
                {loading && selectedProduct === product.id && !selectedTier ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">Subscribe Now</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">About Subscriptions</Text>
                <Text className="text-muted text-xs">
                  • Cancel anytime{'\n'}
                  • Automatic renewal{'\n'}
                  • Secure payment processing{'\n'}
                  • Instant activation
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
