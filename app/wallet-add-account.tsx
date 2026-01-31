import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/Colors';
import { WalletAPI } from '@/lib/wallet-api';

const ACCOUNT_TYPES = [
  { value: 'savings', label: 'Savings Account' },
  { value: 'current', label: 'Current Account' },
  { value: 'cheque', label: 'Cheque Account' },
];

const BANKS = [
  'ABSA', 'Standard Bank', 'FNB', 'Nedbank', 'Capitec',
  'African Bank', 'Investec', 'Discovery Bank', 'TymeBank', 'Other'
];

export default function WalletAddAccountScreen() {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [branchCode, setBranchCode] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const walletAPI = new WalletAPI();

  const handleAddAccount = async () => {
    // Validation
    if (!bankName.trim()) {
      Alert.alert('Error', 'Please select your bank');
      return;
    }
    if (!accountNumber.trim()) {
      Alert.alert('Error', 'Please enter your account number');
      return;
    }
    if (!accountHolder.trim()) {
      Alert.alert('Error', 'Please enter the account holder name');
      return;
    }
    if (!branchCode.trim()) {
      Alert.alert('Error', 'Please enter the branch code');
      return;
    }

    try {
      setLoading(true);
      await walletAPI.addAccount({
        bank_name: bankName,
        account_number: accountNumber,
        account_type: accountType,
        branch_code: branchCode,
        account_holder: accountHolder,
      });

      Alert.alert(
        'Success',
        'Bank account added successfully! You can now use it for withdrawals and transfers.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Add account error:', error);
      Alert.alert(
        'Failed',
        error.message || 'Failed to add bank account. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
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
              <Text className="text-2xl font-bold text-foreground">Add Bank Account</Text>
              <Text className="text-sm text-muted">Link your bank account</Text>
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Secure Banking</Text>
                <Text className="text-muted text-sm">
                  Your bank details are encrypted and secure. Link your account to enable withdrawals and transfers.
                </Text>
              </View>
            </View>
          </View>

          {/* Bank Selection */}
          <View className="mb-4">
            <Text className="text-foreground font-medium mb-2">Bank Name *</Text>
            <TouchableOpacity
              onPress={() => setShowBankPicker(!showBankPicker)}
              className="bg-card rounded-2xl border border-border p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <IconSymbol name="building.columns.fill" size={20} color={colors.muted} />
                <Text className={`ml-3 ${bankName ? 'text-foreground' : 'text-muted'}`}>
                  {bankName || 'Select your bank'}
                </Text>
              </View>
              <IconSymbol name="chevron.down" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Bank Picker */}
          {showBankPicker && (
            <View className="bg-card rounded-2xl border border-border mb-4 overflow-hidden">
              {BANKS.map((bank, index) => (
                <TouchableOpacity
                  key={bank}
                  onPress={() => {
                    setBankName(bank);
                    setShowBankPicker(false);
                  }}
                  className={`p-4 ${index < BANKS.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <Text className="text-foreground">{bank}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Account Holder Name */}
          <View className="mb-4">
            <Text className="text-foreground font-medium mb-2">Account Holder Name *</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <View className="flex-row items-center px-4">
                <IconSymbol name="person.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-foreground py-4 px-3"
                  placeholder="Full name as per bank records"
                  placeholderTextColor={colors.muted}
                  value={accountHolder}
                  onChangeText={setAccountHolder}
                  editable={!loading}
                />
              </View>
            </View>
          </View>

          {/* Account Number */}
          <View className="mb-4">
            <Text className="text-foreground font-medium mb-2">Account Number *</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <View className="flex-row items-center px-4">
                <IconSymbol name="number" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-foreground py-4 px-3"
                  placeholder="Enter account number"
                  placeholderTextColor={colors.muted}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>
            </View>
          </View>

          {/* Account Type */}
          <View className="mb-4">
            <Text className="text-foreground font-medium mb-2">Account Type *</Text>
            <View className="flex-row gap-3">
              {ACCOUNT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setAccountType(type.value)}
                  className={`flex-1 rounded-2xl p-4 border ${
                    accountType === type.value
                      ? 'bg-primary border-primary'
                      : 'bg-card border-border'
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      accountType === type.value ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Branch Code */}
          <View className="mb-6">
            <Text className="text-foreground font-medium mb-2">Branch Code *</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <View className="flex-row items-center px-4">
                <IconSymbol name="mappin.circle.fill" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-foreground py-4 px-3"
                  placeholder="6-digit branch code"
                  placeholderTextColor={colors.muted}
                  value={branchCode}
                  onChangeText={setBranchCode}
                  keyboardType="numeric"
                  maxLength={6}
                  editable={!loading}
                />
              </View>
            </View>
            <Text className="text-muted text-xs mt-2">
              Universal branch code: 250655 (for most banks)
            </Text>
          </View>

          {/* Add Account Button */}
          <TouchableOpacity
            onPress={handleAddAccount}
            disabled={loading}
            className={`bg-primary rounded-2xl p-4 items-center mb-4 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center">
                <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
                <Text className="text-white font-semibold text-lg ml-2">Add Bank Account</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Security Notice */}
          <View className="bg-card rounded-2xl p-4 border border-border">
            <View className="flex-row items-start">
              <IconSymbol name="lock.shield.fill" size={20} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Your Security Matters</Text>
                <Text className="text-muted text-xs">
                  We use bank-level encryption to protect your financial information. Your details are never shared with third parties.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
