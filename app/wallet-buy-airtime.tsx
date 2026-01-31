import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/constants/Colors';

const NETWORKS = [
  { id: 'vodacom', name: 'Vodacom', color: '#E60000' },
  { id: 'mtn', name: 'MTN', color: '#FFCC00' },
  { id: 'cell_c', name: 'Cell C', color: '#0066CC' },
  { id: 'telkom', name: 'Telkom', color: '#00A9CE' },
];

const QUICK_AMOUNTS = ['10', '20', '50', '100', '200', '500'];

export default function WalletBuyAirtimeScreen() {
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');

  const handleBuyAirtime = () => {
    if (!selectedNetwork) {
      Alert.alert('Error', 'Please select a network');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Buy R${parseFloat(amount).toFixed(2)} ${NETWORKS.find(n => n.id === selectedNetwork)?.name} airtime for ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: () => {
            Alert.alert('Success', 'Airtime purchase feature coming soon! This will process your purchase.');
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
              <Text className="text-2xl font-bold text-foreground">Buy Airtime</Text>
              <Text className="text-sm text-muted">Instant airtime & data</Text>
            </View>
          </View>

          {/* Network Selection */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-3">Select Network</Text>
            <View className="flex-row flex-wrap gap-3">
              {NETWORKS.map((network) => (
                <TouchableOpacity
                  key={network.id}
                  onPress={() => setSelectedNetwork(network.id)}
                  className={`flex-1 min-w-[45%] bg-card rounded-2xl p-4 border ${
                    selectedNetwork === network.id ? 'border-primary' : 'border-border'
                  }`}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: `${network.color}20` }}
                  >
                    <IconSymbol name="antenna.radiowaves.left.and.right" size={24} color={network.color} />
                  </View>
                  <Text className="text-foreground font-medium">{network.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Phone Number */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-2">Phone Number</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <TextInput
                className="text-foreground py-4 px-4"
                placeholder="0XX XXX XXXX"
                placeholderTextColor={colors.muted}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
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

          {/* Quick Amounts */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-3">Quick Amounts</Text>
            <View className="flex-row flex-wrap gap-2">
              {QUICK_AMOUNTS.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  onPress={() => setAmount(quickAmount)}
                  className={`px-6 py-3 rounded-xl border ${
                    amount === quickAmount ? 'bg-primary border-primary' : 'bg-card border-border'
                  }`}
                >
                  <Text
                    className={`font-semibold ${amount === quickAmount ? 'text-white' : 'text-foreground'}`}
                  >
                    R{quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Instant Delivery</Text>
                <Text className="text-muted text-sm">
                  Airtime will be delivered instantly to the phone number. You'll receive a confirmation SMS.
                </Text>
              </View>
            </View>
          </View>

          {/* Buy Button */}
          <TouchableOpacity
            onPress={handleBuyAirtime}
            disabled={!selectedNetwork || !phoneNumber || !amount}
            className={`bg-primary rounded-2xl p-4 items-center ${
              !selectedNetwork || !phoneNumber || !amount ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-white font-semibold text-lg">Buy Airtime</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
