import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/Colors';
import { WalletAPI } from '@/lib/wallet-api';

export default function WalletTransactionDetailsScreen() {
  const params = useLocalSearchParams();
  const transactionId = params.transactionId as string;
  
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);
  const walletAPI = new WalletAPI();

  useEffect(() => {
    if (transactionId) {
      fetchTransactionDetails();
    }
  }, [transactionId]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getTransactionDetails(transactionId);
      setTransaction(response.data);
    } catch (error: any) {
      console.error('Error fetching transaction details:', error);
      Alert.alert('Error', error.message || 'Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted mt-4">Loading transaction details...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!transaction) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <IconSymbol name="exclamationmark.triangle" size={64} color={colors.muted} />
          <Text className="text-foreground text-lg font-semibold mt-4">Transaction Not Found</Text>
          <Text className="text-muted text-center mt-2">
            Unable to load transaction details
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary rounded-2xl px-6 py-3 mt-6"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const isCredit = transaction.type === 'credit' || transaction.amount > 0;

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
            <Text className="text-2xl font-bold text-foreground">Transaction Details</Text>
          </View>

          {/* Amount Card */}
          <View className={`rounded-3xl p-6 mb-6 ${isCredit ? 'bg-green-500' : 'bg-red-500'}`}>
            <Text className="text-white/70 text-sm mb-2">
              {isCredit ? 'Received' : 'Sent'}
            </Text>
            <Text className="text-white text-4xl font-bold">
              {isCredit ? '+' : '-'}R {Math.abs(transaction.amount || 0).toFixed(2)}
            </Text>
            <View className="flex-row items-center mt-4">
              <View className={`w-2 h-2 rounded-full mr-2 ${transaction.status === 'completed' ? 'bg-white' : 'bg-white/50'}`} />
              <Text className="text-white capitalize">
                {transaction.status || 'Pending'}
              </Text>
            </View>
          </View>

          {/* Transaction Info */}
          <View className="bg-card rounded-2xl p-4 space-y-4 mb-6">
            <View className="flex-row justify-between">
              <Text className="text-muted">Transaction ID</Text>
              <Text className="text-foreground font-medium">{transaction.id || transactionId}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-muted">Type</Text>
              <Text className="text-foreground font-medium capitalize">
                {transaction.type || 'N/A'}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted">Description</Text>
              <Text className="text-foreground font-medium text-right flex-1 ml-4">
                {transaction.description || 'No description'}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted">Date</Text>
              <Text className="text-foreground font-medium">
                {transaction.date || new Date().toLocaleDateString()}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted">Time</Text>
              <Text className="text-foreground font-medium">
                {transaction.time || new Date().toLocaleTimeString()}
              </Text>
            </View>

            {transaction.reference && (
              <View className="flex-row justify-between">
                <Text className="text-muted">Reference</Text>
                <Text className="text-foreground font-medium">{transaction.reference}</Text>
              </View>
            )}

            {transaction.fee && (
              <View className="flex-row justify-between">
                <Text className="text-muted">Fee</Text>
                <Text className="text-foreground font-medium">R {transaction.fee.toFixed(2)}</Text>
              </View>
            )}
          </View>

          {/* Recipient/Sender Info */}
          {(transaction.recipient || transaction.sender) && (
            <View className="bg-card rounded-2xl p-4 space-y-4 mb-6">
              <Text className="text-foreground font-semibold text-lg">
                {isCredit ? 'From' : 'To'}
              </Text>
              
              {transaction.recipient_name || transaction.sender_name ? (
                <View className="flex-row justify-between">
                  <Text className="text-muted">Name</Text>
                  <Text className="text-foreground font-medium">
                    {transaction.recipient_name || transaction.sender_name}
                  </Text>
                </View>
              ) : null}

              {transaction.recipient_account || transaction.sender_account ? (
                <View className="flex-row justify-between">
                  <Text className="text-muted">Account</Text>
                  <Text className="text-foreground font-medium">
                    {transaction.recipient_account || transaction.sender_account}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Actions */}
          <View className="space-y-3">
            <TouchableOpacity
              className="bg-primary rounded-2xl p-4 flex-row items-center justify-center"
            >
              <IconSymbol name="square.and.arrow.down" size={20} color="#fff" />
              <Text className="text-white font-semibold text-lg ml-2">Download Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-muted/20 rounded-2xl p-4 flex-row items-center justify-center"
            >
              <IconSymbol name="square.and.arrow.up" size={20} color={colors.foreground} />
              <Text className="text-foreground font-semibold text-lg ml-2">Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
