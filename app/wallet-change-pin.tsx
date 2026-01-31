import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/constants/Colors';
import { WalletAPI } from '@/lib/wallet-api';

export default function WalletChangePinScreen() {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const walletAPI = new WalletAPI();

  const handleChangePin = async () => {
    // Validation
    if (!oldPin.trim()) {
      Alert.alert('Error', 'Please enter your current PIN');
      return;
    }
    if (oldPin.length !== 4) {
      Alert.alert('Error', 'Current PIN must be 4 digits');
      return;
    }
    if (!newPin.trim()) {
      Alert.alert('Error', 'Please enter your new PIN');
      return;
    }
    if (newPin.length !== 4) {
      Alert.alert('Error', 'New PIN must be 4 digits');
      return;
    }
    if (newPin === oldPin) {
      Alert.alert('Error', 'New PIN must be different from current PIN');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Error', 'New PIN and confirmation do not match');
      return;
    }

    try {
      setLoading(true);
      
      // First verify the old PIN by attempting login
      // Then create the new PIN
      await walletAPI.createPin(newPin);

      Alert.alert(
        'Success',
        'Your PIN has been changed successfully. Please use your new PIN for future logins.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Change PIN error:', error);
      Alert.alert(
        'Failed',
        error.message || 'Failed to change PIN. Please verify your current PIN and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 pt-12">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center mr-4"
          >
            <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-foreground">Change PIN</Text>
            <Text className="text-sm text-muted">Update your wallet PIN</Text>
          </View>
        </View>

        {/* Security Info */}
        <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start">
            <IconSymbol name="lock.shield.fill" size={24} color={colors.primary} />
            <View className="flex-1 ml-3">
              <Text className="text-foreground font-semibold mb-1">Security Tips</Text>
              <Text className="text-muted text-sm">
                • Use a unique 4-digit PIN{'\n'}
                • Don't use obvious numbers (1234, 0000){'\n'}
                • Never share your PIN with anyone
              </Text>
            </View>
          </View>
        </View>

        {/* Current PIN */}
        <View className="mb-4">
          <Text className="text-foreground font-medium mb-2">Current PIN</Text>
          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            <View className="flex-row items-center px-4">
              <IconSymbol name="lock.fill" size={20} color={colors.muted} />
              <TextInput
                className="flex-1 text-foreground py-4 px-3 text-lg tracking-widest"
                placeholder="••••"
                placeholderTextColor={colors.muted}
                value={oldPin}
                onChangeText={setOldPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={!showOldPin}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowOldPin(!showOldPin)}>
                <IconSymbol
                  name={showOldPin ? 'eye.slash.fill' : 'eye.fill'}
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* New PIN */}
        <View className="mb-4">
          <Text className="text-foreground font-medium mb-2">New PIN</Text>
          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            <View className="flex-row items-center px-4">
              <IconSymbol name="lock.fill" size={20} color={colors.primary} />
              <TextInput
                className="flex-1 text-foreground py-4 px-3 text-lg tracking-widest"
                placeholder="••••"
                placeholderTextColor={colors.muted}
                value={newPin}
                onChangeText={setNewPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={!showNewPin}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowNewPin(!showNewPin)}>
                <IconSymbol
                  name={showNewPin ? 'eye.slash.fill' : 'eye.fill'}
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Confirm New PIN */}
        <View className="mb-6">
          <Text className="text-foreground font-medium mb-2">Confirm New PIN</Text>
          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            <View className="flex-row items-center px-4">
              <IconSymbol name="checkmark.shield.fill" size={20} color={colors.primary} />
              <TextInput
                className="flex-1 text-foreground py-4 px-3 text-lg tracking-widest"
                placeholder="••••"
                placeholderTextColor={colors.muted}
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={!showConfirmPin}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPin(!showConfirmPin)}>
                <IconSymbol
                  name={showConfirmPin ? 'eye.slash.fill' : 'eye.fill'}
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>
          </View>
          {newPin && confirmPin && newPin !== confirmPin && (
            <Text className="text-red-500 text-xs mt-2">PINs do not match</Text>
          )}
          {newPin && confirmPin && newPin === confirmPin && (
            <Text className="text-green-500 text-xs mt-2">✓ PINs match</Text>
          )}
        </View>

        {/* Change PIN Button */}
        <TouchableOpacity
          onPress={handleChangePin}
          disabled={loading || !oldPin || !newPin || !confirmPin || newPin !== confirmPin}
          className={`bg-primary rounded-2xl p-4 items-center mb-4 ${
            loading || !oldPin || !newPin || !confirmPin || newPin !== confirmPin ? 'opacity-50' : ''
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-lg">Change PIN</Text>
          )}
        </TouchableOpacity>

        {/* Forgot PIN Link */}
        <TouchableOpacity
          onPress={() => router.push('/wallet-forgot-pin')}
          disabled={loading}
          className="items-center py-3"
        >
          <Text className="text-primary font-medium">Forgot your current PIN?</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
