import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/Colors';

const BILL_CATEGORIES = [
  { id: 'electricity', name: 'Electricity', icon: 'bolt.fill', color: '#F59E0B' },
  { id: 'water', name: 'Water', icon: 'drop.fill', color: '#3B82F6' },
  { id: 'internet', name: 'Internet', icon: 'wifi', color: '#8B5CF6' },
  { id: 'tv', name: 'TV Subscription', icon: 'tv.fill', color: '#EC4899' },
  { id: 'insurance', name: 'Insurance', icon: 'shield.fill', color: '#10B981' },
  { id: 'rates', name: 'Rates & Taxes', icon: 'building.2.fill', color: '#EF4444' },
];

export default function WalletPayBillsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');

  const handlePayBill = () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a bill category');
      return;
    }
    if (!accountNumber) {
      Alert.alert('Error', 'Please enter your account number');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Pay R${parseFloat(amount).toFixed(2)} for ${BILL_CATEGORIES.find(c => c.id === selectedCategory)?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: () => {
            Alert.alert('Success', 'Bill payment feature coming soon! This will process your payment.');
            router.back();
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
              <Text className="text-2xl font-bold text-foreground">Pay Bills</Text>
              <Text className="text-sm text-muted">Pay your utility bills</Text>
            </View>
          </View>

          {/* Bill Categories */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-3">Select Bill Type</Text>
            <View className="flex-row flex-wrap gap-3">
              {BILL_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`flex-1 min-w-[30%] bg-card rounded-2xl p-4 border ${
                    selectedCategory === category.id ? 'border-primary' : 'border-border'
                  }`}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <IconSymbol name={category.icon} size={24} color={category.color} />
                  </View>
                  <Text className="text-foreground font-medium text-sm">{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Account Number */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-2">Account Number</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <TextInput
                className="text-foreground py-4 px-4"
                placeholder="Enter your account number"
                placeholderTextColor={colors.muted}
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
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

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Instant Payment</Text>
                <Text className="text-muted text-sm">
                  Your bill payment will be processed instantly. You'll receive a confirmation once complete.
                </Text>
              </View>
            </View>
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            onPress={handlePayBill}
            disabled={!selectedCategory || !accountNumber || !amount}
            className={`bg-primary rounded-2xl p-4 items-center ${
              !selectedCategory || !accountNumber || !amount ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-white font-semibold text-lg">Pay Bill</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
