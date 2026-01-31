import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/constants/Colors';

const VOUCHER_TYPES = [
  { id: 'gift', name: 'Gift Vouchers', icon: 'gift.fill', color: '#EC4899' },
  { id: 'shopping', name: 'Shopping', icon: 'cart.fill', color: '#F59E0B' },
  { id: 'food', name: 'Food & Dining', icon: 'fork.knife', color: '#EF4444' },
  { id: 'entertainment', name: 'Entertainment', icon: 'ticket.fill', color: '#8B5CF6' },
];

export default function WalletVouchersScreen() {
  const [voucherCode, setVoucherCode] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const handleRedeemVoucher = () => {
    if (!voucherCode) {
      Alert.alert('Error', 'Please enter a voucher code');
      return;
    }

    Alert.alert(
      'Redeem Voucher',
      `Redeem voucher code: ${voucherCode}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => {
            Alert.alert('Success', 'Voucher redemption feature coming soon! This will redeem your voucher.');
            setVoucherCode('');
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
              <Text className="text-2xl font-bold text-foreground">Vouchers</Text>
              <Text className="text-sm text-muted">Redeem & manage vouchers</Text>
            </View>
          </View>

          {/* Voucher Code Input */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-2">Voucher Code</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <TextInput
                className="text-foreground py-4 px-4 text-center text-lg font-bold tracking-wider"
                placeholder="XXXX-XXXX-XXXX"
                placeholderTextColor={colors.muted}
                value={voucherCode}
                onChangeText={(text) => setVoucherCode(text.toUpperCase())}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Redeem Button */}
          <TouchableOpacity
            onPress={handleRedeemVoucher}
            disabled={!voucherCode}
            className={`bg-primary rounded-2xl p-4 items-center mb-6 ${!voucherCode ? 'opacity-50' : ''}`}
          >
            <Text className="text-white font-semibold text-lg">Redeem Voucher</Text>
          </TouchableOpacity>

          {/* Browse Vouchers */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Browse Vouchers</Text>
            <View className="flex-row flex-wrap gap-3">
              {VOUCHER_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setSelectedType(type.id)}
                  className="flex-1 min-w-[45%] bg-card rounded-2xl p-4 border border-border"
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: `${type.color}20` }}
                  >
                    <IconSymbol name={type.icon} size={24} color={type.color} />
                  </View>
                  <Text className="text-foreground font-medium">{type.name}</Text>
                  <Text className="text-muted text-xs mt-1">Coming soon</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* My Vouchers */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">My Vouchers</Text>
            <View className="bg-card rounded-2xl p-6 border border-border items-center">
              <IconSymbol name="ticket.fill" size={48} color={colors.muted} />
              <Text className="text-foreground font-medium mt-3">No Vouchers Yet</Text>
              <Text className="text-muted text-sm text-center mt-2">
                Redeemed vouchers will appear here
              </Text>
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">How to Use</Text>
                <Text className="text-muted text-sm">
                  • Enter your voucher code above{'\n'}
                  • Tap "Redeem Voucher"{'\n'}
                  • Voucher value will be added to your wallet{'\n'}
                  • Check "My Vouchers" for active vouchers
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
