import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { WalletAPI } from '@/lib/wallet-api';

export default function WalletSettingsScreen() {
  const colors = useColors();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const walletAPI = new WalletAPI();

  useEffect(() => {
    fetchCustomerSettings();
  }, []);

  const fetchCustomerSettings = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getCustomerSettings();
      console.log('Customer Settings:', response.data);
      setSettings(response.data);
      
      // Update state based on fetched settings if available
      if (response.data?.notifications !== undefined) {
        setNotificationsEnabled(response.data.notifications);
      }
      if (response.data?.biometrics !== undefined) {
        setBiometricsEnabled(response.data.biometrics);
      }
    } catch (error: any) {
      console.error('Failed to fetch customer settings:', error);
      // Continue with default values if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConsent = () => {
    Alert.alert(
      'Remove Consent',
      'Are you sure you want to remove your consent? This will delete your account data and you will need to register again.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await walletAPI.removeConsent();
              Alert.alert(
                'Consent Removed',
                'Your consent has been removed successfully. You will be logged out.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Logout and navigate to login
                      router.replace('/wallet-login');
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove consent');
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
              <Text className="text-2xl font-bold text-foreground">Settings</Text>
              <Text className="text-sm text-muted">
                {loading ? 'Loading settings...' : 'Manage your account'}
              </Text>
            </View>
          </View>

          {/* Profile Section */}
          <View className="bg-card rounded-2xl p-4 mb-6">
            <Text className="text-foreground font-semibold text-lg mb-4">Profile</Text>
            
            <TouchableOpacity
              onPress={() => router.push('/wallet-upload-profile-image')}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <IconSymbol name="person.circle" size={24} color={colors.primary} />
                <Text className="text-foreground ml-3">Change Profile Picture</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/wallet-edit-profile')}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <IconSymbol name="pencil" size={24} color={colors.primary} />
                <Text className="text-foreground ml-3">Edit Profile</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Security Section */}
          <View className="bg-card rounded-2xl p-4 mb-6">
            <Text className="text-foreground font-semibold text-lg mb-4">Security</Text>
            
            <TouchableOpacity
              onPress={() => router.push('/wallet-change-pin')}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <IconSymbol name="lock.fill" size={24} color={colors.primary} />
                <Text className="text-foreground ml-3">Change PIN</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <IconSymbol name="faceid" size={24} color={colors.primary} />
                <Text className="text-foreground ml-3">Biometric Login</Text>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={setBiometricsEnabled}
                trackColor={{ false: colors.muted, true: colors.primary }}
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push('/wallet-2fa')}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <IconSymbol name="key.fill" size={24} color={colors.primary} />
                <Text className="text-foreground ml-3">Two-Factor Authentication</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View className="bg-card rounded-2xl p-4 mb-6">
            <Text className="text-foreground font-semibold text-lg mb-4">Preferences</Text>
            
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <IconSymbol name="bell.fill" size={24} color={colors.primary} />
                <Text className="text-foreground ml-3">Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.muted, true: colors.primary }}
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push('/wallet-language')}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <IconSymbol name="globe" size={24} color={colors.primary} />
                <Text className="text-foreground ml-3">Language</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-muted mr-2">English</Text>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/wallet-theme')}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <IconSymbol name="paintbrush.fill" size={24} color={colors.primary} />
                <Text className="text-foreground ml-3">Theme</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-muted mr-2">System</Text>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View className="bg-card rounded-2xl p-4 mb-6">
            <Text className="text-foreground font-semibold text-lg mb-4">Support</Text>
            
            <TouchableOpacity
              onPress={() => router.push('/wallet-help')}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <IconSymbol name="questionmark.circle" size={24} color={colors.primary} />
                <Text className="text-foreground ml-3">Help Center</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <IconSymbol name="envelope.fill" size={24} color={colors.primary} />
                <Text className="text-foreground ml-3">Contact Support</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/wallet-terms')}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <IconSymbol name="doc.text" size={24} color={colors.primary} />
                <Text className="text-foreground ml-3">Terms & Conditions</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/wallet-privacy')}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <IconSymbol name="hand.raised.fill" size={24} color={colors.primary} />
                <Text className="text-foreground ml-3">Privacy Policy</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View className="bg-card rounded-2xl p-4 mb-6">
            <Text className="text-foreground font-semibold text-lg mb-4">About</Text>
            
            <View className="flex-row justify-between py-3">
              <Text className="text-muted">Version</Text>
              <Text className="text-foreground font-medium">1.0.0</Text>
            </View>

            <View className="flex-row justify-between py-3">
              <Text className="text-muted">Build</Text>
              <Text className="text-foreground font-medium">2026.01.31</Text>
            </View>
          </View>

          {/* Danger Zone */}
          <View className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
            <Text className="text-red-600 font-semibold text-lg mb-4">Danger Zone</Text>
            
            <TouchableOpacity
              onPress={handleRemoveConsent}
              className="bg-red-500 rounded-2xl p-4 flex-row items-center justify-center"
            >
              <IconSymbol name="trash.fill" size={20} color="#fff" />
              <Text className="text-white font-semibold text-lg ml-2">Remove Consent & Delete Account</Text>
            </TouchableOpacity>

            <Text className="text-red-600/70 text-xs mt-3 text-center">
              This action is permanent and cannot be undone. All your data will be deleted.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
