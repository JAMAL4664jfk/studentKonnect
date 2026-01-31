import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/Colors';
import Toast from 'react-native-toast-message';

export default function Wallet2FAScreen() {
  const [enabled, setEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const handleToggle2FA = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Enable 2FA',
        'Two-factor authentication adds an extra layer of security to your account. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setEnabled(true);
              Toast.show({
                type: 'success',
                text1: '2FA Enabled',
                text2: 'Your account is now more secure',
              });
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Disable 2FA',
        'This will make your account less secure. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              setEnabled(false);
              Toast.show({
                type: 'info',
                text1: '2FA Disabled',
                text2: 'Two-factor authentication has been turned off',
              });
            },
          },
        ]
      );
    }
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
              <Text className="text-2xl font-bold text-foreground">Two-Factor Authentication</Text>
              <Text className="text-sm text-muted">Secure your account</Text>
            </View>
          </View>

          {/* 2FA Toggle */}
          <View className="bg-card rounded-2xl p-4 mb-6 border border-border">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-foreground font-semibold mb-1">Enable 2FA</Text>
                <Text className="text-muted text-sm">
                  Require a verification code in addition to your PIN
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={handleToggle2FA}
                trackColor={{ false: colors.muted, true: colors.primary }}
              />
            </View>
          </View>

          {/* Verification Methods */}
          {enabled && (
            <View className="mb-6">
              <Text className="text-foreground font-medium mb-3">Verification Methods</Text>
              
              <View className="bg-card rounded-2xl p-4 mb-3 border border-border">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                      <IconSymbol name="message.fill" size={20} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-medium">SMS Verification</Text>
                      <Text className="text-muted text-sm">Send code via SMS</Text>
                    </View>
                  </View>
                  <Switch
                    value={smsEnabled}
                    onValueChange={setSmsEnabled}
                    trackColor={{ false: colors.muted, true: colors.primary }}
                  />
                </View>
              </View>

              <View className="bg-card rounded-2xl p-4 border border-border">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                      <IconSymbol name="envelope.fill" size={20} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-medium">Email Verification</Text>
                      <Text className="text-muted text-sm">Send code via email</Text>
                    </View>
                  </View>
                  <Switch
                    value={emailEnabled}
                    onValueChange={setEmailEnabled}
                    trackColor={{ false: colors.muted, true: colors.primary }}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <IconSymbol name="shield.checkered" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">How 2FA Works</Text>
                <Text className="text-muted text-sm">
                  • Enter your PIN as usual{'\n'}
                  • Receive a verification code via SMS or email{'\n'}
                  • Enter the code to complete login{'\n'}
                  • Your account is protected even if someone knows your PIN
                </Text>
              </View>
            </View>
          </View>

          {/* Security Notice */}
          <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
            <View className="flex-row items-start">
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#EAB308" />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Important</Text>
                <Text className="text-muted text-sm">
                  Make sure your phone number and email are up to date to receive verification codes.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
