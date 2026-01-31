import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { WalletAPI } from '@/lib/wallet-api';

export default function WalletEditProfileScreen() {
  const colors = useColors();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const walletAPI = new WalletAPI();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getProfile();
      
      if (response.data) {
        setFirstName(response.data.first_name || '');
        setLastName(response.data.last_name || '');
        setMiddleName(response.data.middle_name || '');
        setEmail(response.data.email || '');
        setPhoneNumber(response.data.msisdn || '');
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    if (email && !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setSaving(true);
      
      // Update profile using add_additional_info endpoint
      await walletAPI.addAdditionalInfo({
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        email: email,
      });

      Alert.alert(
        'Success',
        'Your profile has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Save profile error:', error);
      Alert.alert(
        'Failed',
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted mt-4">Loading profile...</Text>
        </View>
      </ScreenContainer>
    );
  }

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
              <Text className="text-2xl font-bold text-foreground">Edit Profile</Text>
              <Text className="text-sm text-muted">Update your information</Text>
            </View>
          </View>

          {/* Profile Picture Section */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-3">
              <IconSymbol name="person.fill" size={48} color={colors.primary} />
            </View>
            <TouchableOpacity
              onPress={() => router.push('/wallet-upload-profile-image')}
              className="flex-row items-center"
            >
              <IconSymbol name="camera.fill" size={16} color={colors.primary} />
              <Text className="text-primary font-medium ml-2">Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* First Name */}
          <View className="mb-4">
            <Text className="text-foreground font-medium mb-2">First Name *</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <View className="flex-row items-center px-4">
                <IconSymbol name="person.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-foreground py-4 px-3"
                  placeholder="Enter first name"
                  placeholderTextColor={colors.muted}
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!saving}
                />
              </View>
            </View>
          </View>

          {/* Middle Name */}
          <View className="mb-4">
            <Text className="text-foreground font-medium mb-2">Middle Name</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <View className="flex-row items-center px-4">
                <IconSymbol name="person.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-foreground py-4 px-3"
                  placeholder="Enter middle name (optional)"
                  placeholderTextColor={colors.muted}
                  value={middleName}
                  onChangeText={setMiddleName}
                  editable={!saving}
                />
              </View>
            </View>
          </View>

          {/* Last Name */}
          <View className="mb-4">
            <Text className="text-foreground font-medium mb-2">Last Name *</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <View className="flex-row items-center px-4">
                <IconSymbol name="person.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-foreground py-4 px-3"
                  placeholder="Enter last name"
                  placeholderTextColor={colors.muted}
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!saving}
                />
              </View>
            </View>
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-foreground font-medium mb-2">Email Address</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <View className="flex-row items-center px-4">
                <IconSymbol name="envelope.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-foreground py-4 px-3"
                  placeholder="your.email@example.com"
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!saving}
                />
              </View>
            </View>
          </View>

          {/* Phone Number (Read-only) */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-2">Phone Number</Text>
            <View className="bg-muted/10 rounded-2xl border border-border overflow-hidden">
              <View className="flex-row items-center px-4">
                <IconSymbol name="phone.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-muted py-4 px-3"
                  value={phoneNumber}
                  editable={false}
                />
                <View className="bg-muted/20 px-3 py-1 rounded-full">
                  <Text className="text-muted text-xs">Verified</Text>
                </View>
              </View>
            </View>
            <Text className="text-muted text-xs mt-2">
              Phone number cannot be changed. Contact support if needed.
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSaveProfile}
            disabled={saving || !firstName.trim() || !lastName.trim()}
            className={`bg-primary rounded-2xl p-4 items-center mb-4 ${
              saving || !firstName.trim() || !lastName.trim() ? 'opacity-50' : ''
            }`}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center">
                <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
                <Text className="text-white font-semibold text-lg ml-2">Save Changes</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={saving}
            className="items-center py-3"
          >
            <Text className="text-muted font-medium">Cancel</Text>
          </TouchableOpacity>

          {/* Additional Options */}
          <View className="mt-6 space-y-3">
            <TouchableOpacity
              onPress={() => router.push('/wallet-add-address')}
              className="bg-card rounded-2xl p-4 border border-border flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <IconSymbol name="house.fill" size={20} color={colors.primary} />
                <Text className="text-foreground ml-3">Update Address</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/wallet-additional-info')}
              className="bg-card rounded-2xl p-4 border border-border flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <IconSymbol name="doc.text.fill" size={20} color={colors.primary} />
                <Text className="text-foreground ml-3">Update Additional Info</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
