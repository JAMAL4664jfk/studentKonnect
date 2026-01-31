import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { walletAPI } from '@/lib/wallet-api';
import Toast from 'react-native-toast-message';

interface MerchantDenomination {
  id: string;
  name: string;
  merchant_id: string;
  status: string;
  available: string;
}

interface Merchant {
  wl_id: string;
  merchant_id: string;
  customer_benefit: string;
  customer_bonus_rewards: string;
  id: string;
  mid: string;
  name: string;
  logo: string;
  short_description: string;
  denominations: MerchantDenomination[];
}

export default function WalletMerchantsScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getMerchants();
      
      if (response.data && Array.isArray(response.data)) {
        setMerchants(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching merchants:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load',
        text2: 'Unable to fetch merchants',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderMerchantCard = ({ item }: { item: Merchant }) => {
    const benefit = parseFloat(item.customer_benefit || '0');
    const bonusRewards = parseFloat(item.customer_bonus_rewards || '0');

    return (
      <TouchableOpacity
        onPress={() => setSelectedMerchant(item)}
        className="bg-card rounded-2xl p-4 mb-4 border border-border"
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-foreground font-bold text-lg mb-1">{item.name}</Text>
            {item.short_description && (
              <Text className="text-muted text-sm">{item.short_description}</Text>
            )}
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.muted} />
        </View>

        {/* Benefits */}
        {(benefit > 0 || bonusRewards > 0) && (
          <View className="flex-row gap-2 mb-3">
            {benefit > 0 && (
              <View className="bg-primary/10 px-3 py-1 rounded-full">
                <Text className="text-primary text-xs font-semibold">
                  {benefit}% Benefit
                </Text>
              </View>
            )}
            {bonusRewards > 0 && (
              <View className="bg-green-500/10 px-3 py-1 rounded-full">
                <Text className="text-green-600 text-xs font-semibold">
                  {bonusRewards}% Bonus
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Denominations */}
        {item.denominations && item.denominations.length > 0 && (
          <View>
            <Text className="text-muted text-xs mb-2">Available Vouchers:</Text>
            <View className="flex-row flex-wrap gap-2">
              {item.denominations.slice(0, 5).map((denom) => (
                <View
                  key={denom.id}
                  className="bg-muted/10 px-3 py-1 rounded-lg"
                >
                  <Text className="text-foreground text-xs font-medium">
                    R{denom.name}
                  </Text>
                </View>
              ))}
              {item.denominations.length > 5 && (
                <View className="bg-muted/10 px-3 py-1 rounded-lg">
                  <Text className="text-muted text-xs font-medium">
                    +{item.denominations.length - 5} more
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMerchantDetails = () => {
    if (!selectedMerchant) return null;

    return (
      <View className="absolute inset-0 bg-background">
        <View className="px-6 pt-12 pb-6">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => setSelectedMerchant(null)}
              className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center mr-4"
            >
              <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-foreground">{selectedMerchant.name}</Text>
              <Text className="text-sm text-muted">Merchant Details</Text>
            </View>
          </View>

          <ScrollView className="flex-1">
            {/* Benefits Card */}
            <View className="bg-card rounded-2xl p-4 mb-4 border border-border">
              <Text className="text-foreground font-semibold mb-3">Benefits</Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted">Customer Benefit:</Text>
                <Text className="text-foreground font-semibold">
                  {selectedMerchant.customer_benefit}%
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Bonus Rewards:</Text>
                <Text className="text-foreground font-semibold">
                  {selectedMerchant.customer_bonus_rewards}%
                </Text>
              </View>
            </View>

            {/* Denominations */}
            {selectedMerchant.denominations && selectedMerchant.denominations.length > 0 && (
              <View className="bg-card rounded-2xl p-4 mb-4 border border-border">
                <Text className="text-foreground font-semibold mb-3">
                  Available Voucher Denominations
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {selectedMerchant.denominations.map((denom) => (
                    <TouchableOpacity
                      key={denom.id}
                      disabled={denom.status !== '1'}
                      className={`px-6 py-4 rounded-xl border ${
                        denom.status === '1'
                          ? 'bg-primary/10 border-primary'
                          : 'bg-muted/10 border-border opacity-50'
                      }`}
                    >
                      <Text
                        className={`font-semibold text-center ${
                          denom.status === '1' ? 'text-primary' : 'text-muted'
                        }`}
                      >
                        R{denom.name}
                      </Text>
                      <Text className="text-xs text-muted text-center mt-1">
                        {denom.available} available
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Info Card */}
            <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
              <View className="flex-row items-start">
                <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
                <View className="flex-1 ml-3">
                  <Text className="text-foreground font-semibold mb-1">How to Purchase</Text>
                  <Text className="text-muted text-xs">
                    1. Select a voucher denomination{'\n'}
                    2. Complete payment with your wallet{'\n'}
                    3. Receive voucher instantly{'\n'}
                    4. Earn benefits and rewards
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted mt-4">Loading merchants...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (selectedMerchant) {
    return <ScreenContainer>{renderMerchantDetails()}</ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <View className="flex-1">
        <View className="px-6 pt-12 pb-4">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center mr-4"
            >
              <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-foreground">Merchants</Text>
              <Text className="text-sm text-muted">Shop with your wallet</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={merchants}
          renderItem={renderMerchantCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <IconSymbol name="building.2.fill" size={64} color={colors.muted} />
              <Text className="text-muted mt-4">No merchants available</Text>
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
}
