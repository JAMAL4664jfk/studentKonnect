import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/constants/Colors';

export default function WalletPrivacyScreen() {
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
              <Text className="text-2xl font-bold text-foreground">Privacy Policy</Text>
              <Text className="text-sm text-muted">Last updated: January 2026</Text>
            </View>
          </View>

          {/* Content */}
          <View className="bg-card rounded-2xl p-6 border border-border">
            <Text className="text-foreground font-semibold text-lg mb-4">1. Information We Collect</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              We collect information you provide directly to us, including your name, email address, phone number, identification documents, and transaction history.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">2. How We Use Your Information</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">3. Information Sharing</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              We do not share your personal information with third parties except as described in this policy. We may share information with service providers who perform services on our behalf, such as payment processing.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">4. Data Security</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. We use encryption and secure servers to protect your data.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">5. Your Rights</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              You have the right to access, update, or delete your personal information at any time. You can also object to processing of your personal information, ask us to restrict processing, or request portability of your data.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">6. Data Retention</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">7. Cookies and Tracking</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve and analyze our service.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">8. Children's Privacy</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              Our service is not intended for children under 18. We do not knowingly collect personal information from children under 18.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">9. Changes to Privacy Policy</Text>
            <Text className="text-muted text-sm mb-6 leading-6">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </Text>

            <Text className="text-foreground font-semibold text-lg mb-4">10. Contact Us</Text>
            <Text className="text-muted text-sm leading-6">
              If you have any questions about this Privacy Policy, please contact us at privacy@studentkonnect.com
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
