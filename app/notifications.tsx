import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useNotifications } from "@/contexts/NotificationsContext";

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useColors();
  const {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [filter, setFilter] = useState<string>("all");

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications.filter((n) => n.type === filter);

  const typeFilters = [
    { key: "all", label: "All", icon: "bell.fill" },
    { key: "unread", label: "Unread", icon: "bell.badge.fill" },
    { key: "message", label: "Chats", icon: "message.fill" },
    { key: "friend_request", label: "Connections", icon: "person.badge.plus" },
    { key: "transaction", label: "Wallet", icon: "creditcard.fill" },
    { key: "system", label: "System", icon: "gear" },
  ];

  const handleNotificationPress = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url as any);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message": return "message.fill";
      case "transaction": return "creditcard.fill";
      case "friend_request": return "person.badge.plus";
      case "system": return "gear";
      case "marketplace": return "cart.fill";
      case "accommodation": return "house.fill";
      case "hookup": return "heart.fill";
      case "chat": return "message.fill";
      case "group": return "person.3.fill";
      case "connection": return "person.badge.plus";
      case "wellness": return "heart.text.square.fill";
      case "event": return "calendar";
      default: return "bell.fill";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "message":
      case "chat": return "#8b5cf6";
      case "transaction": return "#10b981";
      case "friend_request":
      case "connection": return "#06b6d4";
      case "marketplace": return "#f59e0b";
      case "accommodation": return "#3b82f6";
      case "hookup": return "#ec4899";
      case "group": return "#f97316";
      case "wellness": return "#14b8a6";
      case "event": return "#f97316";
      default: return colors.primary;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
      className="p-4 border-b border-border"
      style={{
        backgroundColor: !item.is_read ? colors.surface : "transparent",
      }}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: getNotificationColor(item.type) + "20",
          }}
        >
          <IconSymbol
            name={getNotificationIcon(item.type) as any}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>

        <View className="flex-1">
          <Text
            className={`text-base ${
              !item.is_read
                ? "font-bold text-foreground"
                : "font-semibold text-foreground"
            }`}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text className="text-sm text-muted mt-1" numberOfLines={2}>
            {item.body || item.message}
          </Text>
          <Text className="text-xs text-muted mt-2">
            {formatTime(item.created_at)}
          </Text>
        </View>

        <View className="flex-col items-end gap-2">
          {!item.is_read && (
            <View className="w-2 h-2 rounded-full bg-primary" />
          )}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => deleteNotification(item.id)}
          >
            <IconSymbol
              name="xmark.circle.fill"
              size={20}
              color={colors.muted}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]} className="flex-1">
      {/* Header */}
      <View className="p-4 border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <IconSymbol
                name="arrow.left"
                size={24}
                color={colors.foreground}
              />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-xs font-bold text-white">
                  {unreadCount}
                </Text>
              </View>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity activeOpacity={0.7} onPress={markAllAsRead}>
              <Text className="text-primary text-sm font-semibold">
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-border"
        style={{ flexGrow: 0 }}
      >
        <View className="flex-row px-4 py-2 gap-2">
          {typeFilters.map((typeFilter) => (
            <TouchableOpacity
              key={typeFilter.key}
              activeOpacity={0.7}
              onPress={() => setFilter(typeFilter.key)}
              className="px-3 py-1.5 rounded-full flex-row items-center gap-1"
              style={{
                backgroundColor:
                  filter === typeFilter.key ? colors.primary : colors.surface,
              }}
            >
              <IconSymbol
                name={typeFilter.icon as any}
                size={14}
                color={
                  filter === typeFilter.key ? "#fff" : colors.foreground
                }
              />
              <Text
                className="text-sm font-medium"
                style={{
                  color:
                    filter === typeFilter.key ? "#fff" : colors.foreground,
                }}
              >
                {typeFilter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Notifications list */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadNotifications}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <IconSymbol name="bell.fill" size={64} color={colors.muted} />
            <Text className="text-xl font-bold text-foreground mt-4">
              No Notifications
            </Text>
            <Text className="text-sm text-muted text-center mt-2 px-8">
              You're all caught up! Notifications will appear here.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
