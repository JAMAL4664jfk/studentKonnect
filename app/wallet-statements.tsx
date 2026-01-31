import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/constants/Colors';

const STATEMENT_PERIODS = [
  { id: 'current', name: 'Current Month', description: 'January 2026' },
  { id: 'last_month', name: 'Last Month', description: 'December 2025' },
  { id: 'last_3_months', name: 'Last 3 Months', description: 'Nov 2025 - Jan 2026' },
  { id: 'last_6_months', name: 'Last 6 Months', description: 'Aug 2025 - Jan 2026' },
  { id: 'last_year', name: 'Last Year', description: '2025' },
  { id: 'custom', name: 'Custom Period', description: 'Select date range' },
];

export default function WalletStatementsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const handleDownload = () => {
    if (!selectedPeriod) {
      Alert.alert('Error', 'Please select a statement period');
      return;
    }

    const period = STATEMENT_PERIODS.find(p => p.id === selectedPeriod);
    Alert.alert(
      'Download Statement',
      `Download statement for ${period?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download PDF',
          onPress: () => {
            Alert.alert('Success', 'Statement download feature coming soon! Your statement will be saved to Downloads.');
          },
        },
      ]
    );
  };

  const handleEmail = () => {
    if (!selectedPeriod) {
      Alert.alert('Error', 'Please select a statement period');
      return;
    }

    Alert.alert(
      'Email Statement',
      'Send statement to your registered email address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            Alert.alert('Success', 'Statement has been sent to your email address.');
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
              <Text className="text-2xl font-bold text-foreground">Statements</Text>
              <Text className="text-sm text-muted">Download account statements</Text>
            </View>
          </View>

          {/* Statement Periods */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-3">Select Period</Text>
            <View className="gap-3">
              {STATEMENT_PERIODS.map((period) => (
                <TouchableOpacity
                  key={period.id}
                  onPress={() => setSelectedPeriod(period.id)}
                  className={`bg-card rounded-2xl p-4 border ${
                    selectedPeriod === period.id ? 'border-primary' : 'border-border'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-foreground font-medium">{period.name}</Text>
                      <Text className="text-muted text-sm mt-1">{period.description}</Text>
                    </View>
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        selectedPeriod === period.id
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}
                    >
                      {selectedPeriod === period.id && (
                        <IconSymbol name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Download Options */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-3">Download Options</Text>
            
            <TouchableOpacity
              onPress={handleDownload}
              disabled={!selectedPeriod}
              className={`bg-primary rounded-2xl p-4 mb-3 ${!selectedPeriod ? 'opacity-50' : ''}`}
            >
              <View className="flex-row items-center justify-center">
                <IconSymbol name="arrow.down.doc.fill" size={20} color="#fff" />
                <Text className="text-white font-semibold text-lg ml-2">Download PDF</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEmail}
              disabled={!selectedPeriod}
              className={`bg-card border border-border rounded-2xl p-4 ${!selectedPeriod ? 'opacity-50' : ''}`}
            >
              <View className="flex-row items-center justify-center">
                <IconSymbol name="envelope.fill" size={20} color={colors.primary} />
                <Text className="text-primary font-semibold text-lg ml-2">Email Statement</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Recent Statements */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Recent Statements</Text>
            <View className="bg-card rounded-2xl p-6 border border-border items-center">
              <IconSymbol name="doc.text.fill" size={48} color={colors.muted} />
              <Text className="text-foreground font-medium mt-3">No Statements Yet</Text>
              <Text className="text-muted text-sm text-center mt-2">
                Downloaded statements will appear here
              </Text>
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Statement Information</Text>
                <Text className="text-muted text-sm">
                  • Statements include all transactions for the selected period{'\n'}
                  • PDF format compatible with all devices{'\n'}
                  • Statements are available for the past 12 months{'\n'}
                  • Email delivery takes 1-2 minutes
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
