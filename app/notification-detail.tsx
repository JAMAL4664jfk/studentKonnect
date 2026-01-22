import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function NotificationDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();

  const title = params.title as string;
  const message = params.message as string;
  const type = params.type as string;
  const created_at = params.created_at as string;

  const getNotificationIcon = (notifType: string) => {
    switch (notifType) {
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

  const getNotificationColor = (notifType: string) => {
    switch (notifType) {
      case "transaction":
        return colors.primary;
      case "chat":
        return "hsl(220, 70%, 60%)";
      case "service":
        return "hsl(280, 65%, 55%)";
      default:
        return colors.primary;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} className="flex-1">
      {/* Header */}
      <View className="p-4 border-b border-border">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">
            Notification Details
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-6">
        <View className="items-center mb-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: getNotificationColor(type) + "20" }}
          >
            <IconSymbol
              name={getNotificationIcon(type) as any}
              size={40}
              color={getNotificationColor(type)}
            />
          </View>
          <View
            className="px-4 py-1 rounded-full mb-2"
            style={{ backgroundColor: getNotificationColor(type) + "20" }}
          >
            <Text
              className="text-xs font-semibold capitalize"
              style={{ color: getNotificationColor(type) }}
            >
              {type}
            </Text>
          </View>
        </View>

        <View className="bg-surface rounded-2xl p-6 border border-border mb-4">
          <Text className="text-2xl font-bold text-foreground mb-4">
            {title}
          </Text>
          <Text className="text-base text-foreground leading-relaxed">
            {message}
          </Text>
        </View>

        <View className="bg-surface rounded-2xl p-4 border border-border">
          <View className="flex-row items-center gap-2">
            <IconSymbol name="clock.fill" size={16} color={colors.muted} />
            <Text className="text-sm text-muted">
              {formatDateTime(created_at)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
