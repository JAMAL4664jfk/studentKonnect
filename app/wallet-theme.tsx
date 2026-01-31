import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/Colors';
import Toast from 'react-native-toast-message';

const THEMES = [
  { id: 'system', name: 'System Default', description: 'Follow device settings', icon: 'gearshape.fill' },
  { id: 'light', name: 'Light Mode', description: 'Always use light theme', icon: 'sun.max.fill' },
  { id: 'dark', name: 'Dark Mode', description: 'Always use dark theme', icon: 'moon.fill' },
];

export default function WalletThemeScreen() {
  const [selectedTheme, setSelectedTheme] = useState('system');

  const handleSave = () => {
    Toast.show({
      type: 'success',
      text1: 'Theme Updated',
      text2: `Theme changed to ${THEMES.find(t => t.id === selectedTheme)?.name}`,
    });
    router.back();
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
              <Text className="text-2xl font-bold text-foreground">Theme</Text>
              <Text className="text-sm text-muted">Customize your appearance</Text>
            </View>
          </View>

          {/* Themes List */}
          <View className="mb-6">
            {THEMES.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                onPress={() => setSelectedTheme(theme.id)}
                className="bg-card rounded-2xl p-4 mb-3 border border-border"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                      <IconSymbol name={theme.icon} size={24} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-medium">{theme.name}</Text>
                      <Text className="text-muted text-sm mt-1">{theme.description}</Text>
                    </View>
                  </View>
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      selectedTheme === theme.id
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}
                  >
                    {selectedTheme === theme.id && (
                      <IconSymbol name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">About Themes</Text>
                <Text className="text-muted text-sm">
                  System Default will automatically switch between light and dark mode based on your device settings.
                </Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            className="bg-primary rounded-2xl p-4 items-center"
          >
            <Text className="text-white font-semibold text-lg">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
