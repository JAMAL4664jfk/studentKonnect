import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";

interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  institution_name: string | null;
  course_program: string | null;
  bio: string | null;
  is_online: boolean;
  connection_status: "none" | "pending" | "connected" | "blocked";
}

export default function DiscoverUsersScreen() {
  const colors = useColors();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, searchQuery]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await safeGetUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Build query
      let query = supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          institution_name,
          course_program,
          bio,
          created_at
        `)
        .neq("id", currentUser!.id)
        .order("created_at", { ascending: false })
        .limit(50);

      // Add search filter
      if (searchQuery.trim()) {
        query = query.or(`full_name.ilike.%${searchQuery}%,institution_name.ilike.%${searchQuery}%,course_program.ilike.%${searchQuery}%`);
      }

      const { data: usersData, error } = await query;

      if (error) throw error;

      // Get online status
      const { data: onlineData } = await supabase
        .from("user_online_status")
        .select("user_id, is_online")
        .in("user_id", usersData.map(u => u.id));

      // Get connection status
      const { data: connectionsData } = await supabase
        .from("user_connections")
        .select("requester_id, addressee_id, status")
        .or(`requester_id.eq.${currentUser!.id},addressee_id.eq.${currentUser!.id}`);

      // Merge data
      const enrichedUsers: User[] = usersData.map(user => {
        const onlineStatus = onlineData?.find(o => o.user_id === user.id);
        const connection = connectionsData?.find(
          c => (c.requester_id === user.id && c.addressee_id === currentUser!.id) ||
               (c.addressee_id === user.id && c.requester_id === currentUser!.id)
        );

        let connectionStatus: User["connection_status"] = "none";
        if (connection) {
          if (connection.status === "accepted") connectionStatus = "connected";
          else if (connection.status === "blocked") connectionStatus = "blocked";
          else connectionStatus = "pending";
        }

        return {
          ...user,
          is_online: onlineStatus?.is_online || false,
          connection_status: connectionStatus,
        };
      });

      setUsers(enrichedUsers);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error loading users",
        text2: error.message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleConnect = async (userId: string) => {
    if (!currentUser) return;

    try {
      await supabase.from("user_connections").insert({
        requester_id: currentUser.id,
        addressee_id: userId,
        status: "pending",
      });

      Toast.show({
        type: "success",
        text1: "Connection request sent",
      });

      fetchUsers();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    }
  };

  const handleStartChat = (userId: string) => {
    router.push(`/chat?userId=${userId}` as any);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Discover Users</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-surface rounded-xl px-4 py-3">
            <IconSymbol name="magnifyingglass" size={20} color={colors.mutedForeground} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, institution, or program..."
              placeholderTextColor={colors.mutedForeground}
              className="flex-1 ml-2 text-foreground"
            />
          </View>
        </View>

        {/* Users List */}
        {loading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : users.length === 0 ? (
          <View className="items-center justify-center py-12">
            <IconSymbol name="person.2" size={64} color={colors.mutedForeground} />
            <Text className="text-muted-foreground mt-4">No users found</Text>
          </View>
        ) : (
          <View className="px-4 gap-3">
            {users.map((user) => (
              <View
                key={user.id}
                className="bg-surface rounded-2xl p-4 border border-border"
              >
                <View className="flex-row items-start gap-3">
                  {/* Avatar */}
                  <View className="relative">
                    {user.avatar_url ? (
                      <Image
                        source={{ uri: user.avatar_url }}
                        className="w-16 h-16 rounded-full"
                        contentFit="cover"
                      />
                    ) : (
                      <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center">
                        <Text className="text-2xl font-bold text-primary">
                          {user.full_name?.[0] || "U"}
                        </Text>
                      </View>
                    )}
                    {user.is_online && (
                      <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-surface" />
                    )}
                  </View>

                  {/* User Info */}
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground mb-1">
                      {user.full_name || "Anonymous"}
                    </Text>
                    {user.institution_name && (
                      <Text className="text-sm text-muted-foreground mb-1">
                        📚 {user.institution_name}
                      </Text>
                    )}
                    {user.course_program && (
                      <Text className="text-sm text-muted-foreground mb-1">
                        🎓 {user.course_program}
                      </Text>
                    )}
                    {user.bio && (
                      <Text className="text-sm text-foreground mt-2" numberOfLines={2}>
                        {user.bio}
                      </Text>
                    )}

                    {/* Actions */}
                    <View className="flex-row gap-2 mt-3">
                      {user.connection_status === "none" && (
                        <TouchableOpacity
                          onPress={() => handleConnect(user.id)}
                          className="flex-1 bg-primary py-2 rounded-xl items-center"
                        >
                          <Text className="text-primary-foreground font-semibold text-sm">
                            Connect
                          </Text>
                        </TouchableOpacity>
                      )}
                      {user.connection_status === "pending" && (
                        <View className="flex-1 bg-muted py-2 rounded-xl items-center">
                          <Text className="text-muted-foreground font-semibold text-sm">
                            Pending
                          </Text>
                        </View>
                      )}
                      {user.connection_status === "connected" && (
                        <>
                          <TouchableOpacity
                            onPress={() => handleStartChat(user.id)}
                            className="flex-1 bg-primary py-2 rounded-xl items-center"
                          >
                            <Text className="text-primary-foreground font-semibold text-sm">
                              Message
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="px-4 py-2 rounded-xl bg-surface border border-border items-center justify-center"
                          >
                            <IconSymbol name="person.fill.checkmark" size={18} color={colors.primary} />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
