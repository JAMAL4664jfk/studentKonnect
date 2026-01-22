import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "transaction" | "system" | "chat" | "service";
  read: boolean;
  created_at: string;
  user_id: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        loadNotifications(user.id);
        subscribeToNotifications(user.id);
      }
    };

    getCurrentUser();

    return () => {
      // Cleanup subscription
    };
  }, []);

  const loadNotifications = async (userId: string) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setNotifications(data);
    }
  };

  const subscribeToNotifications = (userId: string) => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((current) => [newNotification, ...current]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications((current) =>
            current.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleRefresh = async () => {
    if (!currentUserId) return;
    setRefreshing(true);
    await loadNotifications(currentUserId);
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notification.id);
    }

    // Navigate to detail
    router.push({
      pathname: "/notification-detail",
      params: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        created_at: notification.created_at,
      },
    });
  };

  const markAllAsRead = async () => {
    if (!currentUserId) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", currentUserId)
      .eq("read", false);

    setNotifications((current) =>
      current.map((n) => ({ ...n, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "transaction":
        return "banknote.fill";
      case "chat":
        return "message.fill";
      case "service":
        return "bell.fill";
      default:
        return "bell.fill";
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

  const renderNotification = ({ item }: { item: Notification }) => {
    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        className={`p-4 border-b border-border ${
          !item.read ? "bg-primary/5" : "bg-background"
        }`}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <View className="flex-row items-start gap-3">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              !item.read ? "bg-primary/20" : "bg-surface"
            }`}
          >
            <IconSymbol
              name={getNotificationIcon(item.type) as any}
              size={20}
              color={!item.read ? colors.primary : colors.muted}
            />
          </View>

          <View className="flex-1">
            <Text
              className={`text-base ${
                !item.read ? "font-bold text-foreground" : "font-semibold text-foreground"
              }`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text className="text-sm text-muted mt-1" numberOfLines={2}>
              {item.message}
            </Text>
            <Text className="text-xs text-muted mt-2">
              {formatTime(item.created_at)}
            </Text>
          </View>

          {!item.read && (
            <View className="w-2 h-2 rounded-full bg-primary mt-2" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ScreenContainer edges={["top", "left", "right"]} className="flex-1">
      {/* Header */}
      <View className="p-4 border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">
              Notifications
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text className="text-primary text-sm font-semibold">
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {unreadCount > 0 && (
          <Text className="text-sm text-muted mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
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
              You're all caught up! Notifications will appear here
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
