import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/constants/Colors';

export default function WalletTermsScreen() {
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
              <Text className="text-2xl font-bold text-foreground">Terms & Conditions</Text>
              <Text className="text-sm text-muted">Last updated: January 2026</Text>
            </View>
          </View>

          {/* Content */}
          <View className="bg-card rounded-2xl p-6 border border-border">
            <Text className="text-foreground font-semibold text-lg mb-4">1. Acceptance of Terms</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              By accessing and using StudentKonnect Wallet, you accept and agree to be bound by the terms and provision of this agreement.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">2. Use of Service</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              You must be at least 18 years old to use this service. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">3. Account Security</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              You are responsible for maintaining the confidentiality of your PIN and account. You agree to immediately notify us of any unauthorized use of your account.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">4. Transactions</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              All transactions are subject to verification and approval. We reserve the right to refuse or cancel any transaction for any reason, including suspected fraud or violation of these terms.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">5. Fees and Charges</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              Certain services may be subject to fees. All applicable fees will be disclosed before you complete a transaction. Fees are non-refundable unless otherwise stated.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">6. Prohibited Activities</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              You may not use the service for any illegal or unauthorized purpose. You must not, in the use of the service, violate any laws in your jurisdiction.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">7. Limitation of Liability</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              StudentKonnect shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use or inability to use the service.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">8. Changes to Terms</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              We reserve the right to modify these terms at any time. We will notify users of any changes by posting the new terms on this page.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">9. Contact Information</Text>
            <Text className="text-muted text-sm leading-6">
              If you have any questions about these Terms, please contact us at support@studentkonnect.com
            </Text>
          </View>

          {/* Accept Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary rounded-2xl p-4 items-center mt-6"
          >
            <Text className="text-white font-semibold text-lg">I Understand</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
