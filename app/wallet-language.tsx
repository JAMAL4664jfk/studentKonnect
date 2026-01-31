import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/constants/Colors';
import Toast from 'react-native-toast-message';

const LANGUAGES = [
  { id: 'en', name: 'English', nativeName: 'English' },
  { id: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { id: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
  { id: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  { id: 'st', name: 'Sotho', nativeName: 'Sesotho' },
  { id: 'tn', name: 'Tswana', nativeName: 'Setswana' },
];

export default function WalletLanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleSave = () => {
    Toast.show({
      type: 'success',
      text1: 'Language Updated',
      text2: `Language changed to ${LANGUAGES.find(l => l.id === selectedLanguage)?.name}`,
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
              <Text className="text-2xl font-bold text-foreground">Language</Text>
              <Text className="text-sm text-muted">Select your preferred language</Text>
            </View>
          </View>

          {/* Languages List */}
          <View className="mb-6">
            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.id}
                onPress={() => setSelectedLanguage(language.id)}
                className="bg-card rounded-2xl p-4 mb-3 border border-border"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-foreground font-medium">{language.name}</Text>
                    <Text className="text-muted text-sm mt-1">{language.nativeName}</Text>
                  </View>
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      selectedLanguage === language.id
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}
                  >
                    {selectedLanguage === language.id && (
                      <IconSymbol name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
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
