import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";

type BlockedUser = {
  id: string;
  blocked_id: string;
  blocked_user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    institution_name: string | null;
  };
  created_at: string;
};

export default function BlockedUsersScreen() {
  const router = useRouter();
  const colors = useColors();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (!user) return;

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          id,
          blocked_id,
          created_at,
          blocked_user:profiles!blocked_users_blocked_id_fkey(
            id,
            full_name,
            email,
            avatar_url,
            institution_name
          )
        `)
        .eq('blocker_id', user.id);

      if (error) {
        console.error('Error loading blocked users:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to load blocked users',
        });
        return;
      }

      setBlockedUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = (blockId: string, userName: string) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              // Immediately remove from UI
              setBlockedUsers(prev => prev.filter(u => u.id !== blockId));

              // Delete from database
              await supabase
                .from('blocked_users')
                .delete()
                .eq('id', blockId);

              Toast.show({
                type: 'success',
                text1: 'User unblocked',
                text2: `${userName} has been unblocked`,
              });
            } catch (error) {
              // Reload on error
              loadBlockedUsers();
              Toast.show({
                type: 'error',
                text1: 'Failed to unblock user',
              });
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground flex-1">Blocked Users</Text>
      </View>

      {/* Blocked Users List */}
      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-surface rounded-xl p-4 mb-3 border border-border">
            <Image
              source={{
                uri: item.blocked_user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.blocked_user.full_name)}&background=random&size=128`,
              }}
              className="w-12 h-12 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                {item.blocked_user.full_name}
              </Text>
              <Text className="text-sm text-muted">
                {item.blocked_user.institution_name || item.blocked_user.email}
              </Text>
              <Text className="text-xs text-muted mt-1">
                Blocked on {formatDate(item.created_at)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleUnblock(item.id, item.blocked_user.full_name)}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-semibold">Unblock</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <IconSymbol name="person.crop.circle.badge.xmark" size={64} color={colors.muted} />
            <Text className="text-muted text-center mt-4 text-lg">No blocked users</Text>
            <Text className="text-muted text-center text-sm mt-2 px-8">
              Users you block will appear here. You can unblock them anytime.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
