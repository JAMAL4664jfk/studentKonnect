import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { WalletAPI } from '@/lib/wallet-api';
import Toast from 'react-native-toast-message';

export default function WalletBankAccountsScreen() {
  const colors = useColors();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const walletAPI = new WalletAPI();

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getBankAccounts();
      
      if (response.data && Array.isArray(response.data)) {
        setAccounts(response.data);
      } else if (response.data && response.data.accounts) {
        setAccounts(response.data.accounts);
      } else {
        setAccounts([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch bank accounts:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load',
        text2: error.message || 'Unable to fetch bank accounts',
      });
      setAccounts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBankAccounts();
  };

  const handleDeleteAccount = (account: any) => {
    Alert.alert(
      'Remove Bank Account',
      `Are you sure you want to remove ${account.bank_name || 'this account'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => confirmDeleteAccount(account),
        },
      ]
    );
  };

  const confirmDeleteAccount = async (account: any) => {
    try {
      setDeletingId(account.id || account.account_id);
      await walletAPI.removeBankAccount(account.id || account.account_id);
      
      Toast.show({
        type: 'success',
        text1: 'Account Removed',
        text2: 'Bank account has been removed successfully',
      });
      
      // Refresh the list
      fetchBankAccounts();
    } catch (error: any) {
      console.error('Failed to remove account:', error);
      Alert.alert(
        'Failed',
        error.message || 'Failed to remove bank account. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getBankIcon = (bankName: string) => {
    const name = bankName?.toLowerCase() || '';
    if (name.includes('fnb')) return 'building.columns.fill';
    if (name.includes('standard')) return 'building.columns.fill';
    if (name.includes('absa')) return 'building.columns.fill';
    if (name.includes('nedbank')) return 'building.columns.fill';
    if (name.includes('capitec')) return 'building.columns.fill';
    return 'creditcard.fill';
  };

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="px-6 pt-12 pb-8">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center mr-4"
            >
              <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Bank Accounts</Text>
              <Text className="text-sm text-muted">Manage your linked accounts</Text>
            </View>
          </View>

          {/* Add Account Button */}
          <TouchableOpacity
            onPress={() => router.push('/wallet-add-account')}
            className="bg-primary rounded-2xl p-4 mb-6 flex-row items-center justify-center"
          >
            <IconSymbol name="plus.circle.fill" size={24} color="#FFFFFF" />
            <Text className="text-white font-semibold text-base ml-2">Add Bank Account</Text>
          </TouchableOpacity>

          {/* Loading State */}
          {loading && !refreshing && (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted mt-4">Loading accounts...</Text>
            </View>
          )}

          {/* Empty State */}
          {!loading && accounts.length === 0 && (
            <View className="py-12 items-center">
              <View className="w-20 h-20 rounded-full bg-muted/20 items-center justify-center mb-4">
                <IconSymbol name="building.columns" size={40} color={colors.muted} />
              </View>
              <Text className="text-foreground font-semibold text-lg mb-2">No Bank Accounts</Text>
              <Text className="text-muted text-center px-8">
                You haven't linked any bank accounts yet. Add one to withdraw funds.
              </Text>
            </View>
          )}

          {/* Accounts List */}
          {!loading && accounts.length > 0 && (
            <View className="space-y-4">
              {accounts.map((account, index) => (
                <View
                  key={account.id || account.account_id || index}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <View className="flex-row items-start">
                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                      <IconSymbol
                        name={getBankIcon(account.bank_name)}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold text-base mb-1">
                        {account.bank_name || 'Bank Account'}
                      </Text>
                      <Text className="text-muted text-sm mb-1">
                        {account.account_type || 'Savings'} Account
                      </Text>
                      <Text className="text-muted text-sm">
                        ****{account.account_number?.slice(-4) || '****'}
                      </Text>
                      {account.branch_code && (
                        <Text className="text-muted text-xs mt-1">
                          Branch: {account.branch_code}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteAccount(account)}
                      disabled={deletingId === (account.id || account.account_id)}
                      className="w-10 h-10 rounded-full bg-destructive/10 items-center justify-center"
                    >
                      {deletingId === (account.id || account.account_id) ? (
                        <ActivityIndicator size="small" color={colors.destructive} />
                      ) : (
                        <IconSymbol name="trash.fill" size={20} color={colors.destructive} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Info Card */}
          <View className="bg-muted/10 border border-muted/30 rounded-2xl p-4 mt-6">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">About Bank Accounts</Text>
                <Text className="text-muted text-sm">
                  • Link accounts for withdrawals{'\n'}
                  • Verify account details carefully{'\n'}
                  • Withdrawals take 1-3 business days{'\n'}
                  • Keep at least one account active
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
