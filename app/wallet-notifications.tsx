import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { WalletAPI } from '@/lib/wallet-api';
import Toast from 'react-native-toast-message';

export default function WalletNotificationsScreen() {
  const colors = useColors();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const walletAPI = new WalletAPI();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getNotifications();
      
      if (response.data && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else if (response.data && response.data.messages) {
        setNotifications(response.data.messages);
      } else if (response.data && response.data.notifications) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load',
        text2: error.message || 'Unable to fetch notifications',
      });
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getNotificationIcon = (type: string) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('payment') || typeLower.includes('transaction')) return 'dollarsign.circle.fill';
    if (typeLower.includes('deposit') || typeLower.includes('fund')) return 'arrow.down.circle.fill';
    if (typeLower.includes('withdraw') || typeLower.includes('cashout')) return 'arrow.up.circle.fill';
    if (typeLower.includes('alert') || typeLower.includes('warning')) return 'exclamationmark.triangle.fill';
    if (typeLower.includes('success')) return 'checkmark.circle.fill';
    return 'bell.fill';
  };

  const getNotificationColor = (type: string) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('success') || typeLower.includes('deposit')) return colors.success;
    if (typeLower.includes('alert') || typeLower.includes('warning')) return colors.warning;
    if (typeLower.includes('error') || typeLower.includes('failed')) return colors.destructive;
    return colors.primary;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-ZA', {
        day: '2-digit',
        month: 'short',
      });
    } catch {
      return dateString;
    }
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
              <Text className="text-2xl font-bold text-foreground">Notifications</Text>
              <Text className="text-sm text-muted">Your activity updates</Text>
            </View>
          </View>

          {/* Loading State */}
          {loading && !refreshing && (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted mt-4">Loading notifications...</Text>
            </View>
          )}

          {/* Empty State */}
          {!loading && notifications.length === 0 && (
            <View className="py-12 items-center">
              <View className="w-20 h-20 rounded-full bg-muted/20 items-center justify-center mb-4">
                <IconSymbol name="bell.slash" size={40} color={colors.muted} />
              </View>
              <Text className="text-foreground font-semibold text-lg mb-2">No Notifications</Text>
              <Text className="text-muted text-center px-8">
                You're all caught up! You'll receive notifications here when there's activity on your wallet.
              </Text>
            </View>
          )}

          {/* Notifications List */}
          {!loading && notifications.length > 0 && (
            <View className="space-y-3">
              {notifications.map((notification, index) => {
                const notifType = notification.type || notification.category || 'general';
                const isUnread = notification.read === false || notification.is_read === false;
                
                return (
                  <TouchableOpacity
                    key={notification.id || index}
                    className={`bg-card border rounded-2xl p-4 ${
                      isUnread ? 'border-primary' : 'border-border'
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-start">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${getNotificationColor(notifType)}20` }}
                      >
                        <IconSymbol
                          name={getNotificationIcon(notifType)}
                          size={24}
                          color={getNotificationColor(notifType)}
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-start justify-between mb-1">
                          <Text className="text-foreground font-semibold text-base flex-1">
                            {notification.title || notification.subject || 'Notification'}
                          </Text>
                          {isUnread && (
                            <View className="w-2 h-2 rounded-full bg-primary ml-2 mt-1" />
                          )}
                        </View>
                        <Text className="text-muted text-sm mb-2">
                          {notification.message || notification.body || notification.description || 'No details available'}
                        </Text>
                        <Text className="text-muted text-xs">
                          {formatDate(notification.created_at || notification.date || notification.timestamp || '')}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Info Card */}
          <View className="bg-muted/10 border border-muted/30 rounded-2xl p-4 mt-6">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">About Notifications</Text>
                <Text className="text-muted text-sm">
                  • Get alerts for all wallet activities{'\n'}
                  • Transaction confirmations and updates{'\n'}
                  • Security and account alerts{'\n'}
                  • Enable push notifications for instant updates
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
