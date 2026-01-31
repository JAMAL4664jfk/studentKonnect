import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/Colors';

const FAQ_ITEMS = [
  {
    question: 'How do I deposit money?',
    answer: 'Go to Dashboard → Tap Deposit → Choose payment method (PayFast, Ozow, or PayShap) → Enter amount → Complete payment',
  },
  {
    question: 'How do I withdraw money?',
    answer: 'Go to Dashboard → Tap Withdraw → Enter amount → Review fees → Enter PIN → Confirm withdrawal. Funds arrive in 1-3 business days.',
  },
  {
    question: 'What are the withdrawal fees?',
    answer: 'R50-R1000: R17.50 | R1001-R2000: R30 | R2001-R3000: R40 | R3001-R4000: R47.50',
  },
  {
    question: 'How do I reset my PIN?',
    answer: 'Go to Login → Tap "Forgot PIN?" → Enter phone number → Verify OTP → Create new PIN',
  },
  {
    question: 'Is my money safe?',
    answer: 'Yes! We use bank-level encryption and security. Your funds are protected and insured.',
  },
];

export default function WalletHelpScreen() {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@studentkonnect.com');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+27123456789');
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
              <Text className="text-2xl font-bold text-foreground">Help Center</Text>
              <Text className="text-sm text-muted">Get help & support</Text>
            </View>
          </View>

          {/* Contact Options */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-3">Contact Us</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleContactSupport}
                className="flex-1 bg-primary rounded-2xl p-4"
              >
                <View className="items-center">
                  <IconSymbol name="envelope.fill" size={32} color="#fff" />
                  <Text className="text-white font-semibold mt-2">Email</Text>
                  <Text className="text-white/70 text-xs mt-1">support@studentkonnect.com</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCallSupport}
                className="flex-1 bg-card border border-border rounded-2xl p-4"
              >
                <View className="items-center">
                  <IconSymbol name="phone.fill" size={32} color={colors.primary} />
                  <Text className="text-foreground font-semibold mt-2">Call</Text>
                  <Text className="text-muted text-xs mt-1">+27 12 345 6789</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Frequently Asked Questions</Text>
            {FAQ_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="bg-card rounded-2xl p-4 mb-3 border border-border"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground font-medium flex-1 mr-2">{item.question}</Text>
                  <IconSymbol
                    name={expandedIndex === index ? 'chevron.up' : 'chevron.down'}
                    size={20}
                    color={colors.muted}
                  />
                </View>
                {expandedIndex === index && (
                  <Text className="text-muted text-sm mt-3 leading-5">{item.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Links */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Quick Links</Text>
            
            <TouchableOpacity
              onPress={() => router.push('/wallet-settings')}
              className="bg-card rounded-2xl p-4 mb-3 border border-border flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <IconSymbol name="gearshape.fill" size={24} color={colors.primary} />
                <Text className="text-foreground font-medium ml-3">Account Settings</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/wallet-transaction-summary')}
              className="bg-card rounded-2xl p-4 mb-3 border border-border flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <IconSymbol name="list.bullet" size={24} color={colors.primary} />
                <Text className="text-foreground font-medium ml-3">Transaction History</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
