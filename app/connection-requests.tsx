import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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

interface ConnectionRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "rejected" | "blocked";
  created_at: string;
  requester?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    institution_name: string | null;
    course_program: string | null;
  };
  addressee?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    institution_name: string | null;
    course_program: string | null;
  };
}

export default function ConnectionRequestsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchRequests();
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await safeGetUser();
    if (user) {
      setCurrentUser({ id: user.id });
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);

      // Fetch incoming requests (where current user is the addressee)
      const { data: incoming, error: incomingError } = await supabase
        .from("user_connections")
        .select(`
          id,
          requester_id,
          addressee_id,
          status,
          created_at,
          requester:profiles!user_connections_requester_id_fkey(
            id,
            full_name,
            avatar_url,
            institution_name,
            course_program
          )
        `)
        .eq("addressee_id", currentUser!.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (incomingError) throw incomingError;

      // Fetch outgoing requests (where current user is the requester)
      const { data: outgoing, error: outgoingError } = await supabase
        .from("user_connections")
        .select(`
          id,
          requester_id,
          addressee_id,
          status,
          created_at,
          addressee:profiles!user_connections_addressee_id_fkey(
            id,
            full_name,
            avatar_url,
            institution_name,
            course_program
          )
        `)
        .eq("requester_id", currentUser!.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (outgoingError) throw outgoingError;

      setIncomingRequests(incoming || []);
      setOutgoingRequests(outgoing || []);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error loading requests",
        text2: error.message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("user_connections")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Connection accepted",
      });

      fetchRequests();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("user_connections")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Connection rejected",
      });

      fetchRequests();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("user_connections")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Request cancelled",
      });

      fetchRequests();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const renderUserCard = (request: ConnectionRequest, type: "incoming" | "outgoing") => {
    const user = type === "incoming" ? request.requester : request.addressee;
    if (!user) return null;

    return (
      <View
        key={request.id}
        className="bg-surface rounded-2xl p-4 border border-border mb-3"
      >
        <View className="flex-row items-start gap-3">
          {/* Avatar */}
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
            <Text className="text-xs text-muted-foreground mt-1">
              {new Date(request.created_at).toLocaleDateString()}
            </Text>

            {/* Actions */}
            {type === "incoming" ? (
              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  onPress={() => handleAccept(request.id)}
                  className="flex-1 bg-primary py-2 rounded-xl items-center"
                >
                  <Text className="text-primary-foreground font-semibold text-sm">
                    Accept
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleReject(request.id)}
                  className="flex-1 bg-destructive/10 py-2 rounded-xl items-center"
                >
                  <Text className="text-destructive font-semibold text-sm">
                    Decline
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleCancelRequest(request.id)}
                className="mt-3 bg-muted py-2 rounded-xl items-center"
              >
                <Text className="text-muted-foreground font-semibold text-sm">
                  Cancel Request
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
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
          <Text className="text-xl font-bold text-foreground">Connection Requests</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <View className="flex-row px-4 mb-4 gap-2">
          <TouchableOpacity
            onPress={() => setActiveTab("incoming")}
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "incoming" ? "bg-primary" : "bg-surface"
            }`}
          >
            <Text
              className={`font-semibold ${
                activeTab === "incoming" ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Incoming ({incomingRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("outgoing")}
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "outgoing" ? "bg-primary" : "bg-surface"
            }`}
          >
            <Text
              className={`font-semibold ${
                activeTab === "outgoing" ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Sent ({outgoingRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : activeTab === "incoming" ? (
          <View className="px-4">
            {incomingRequests.length === 0 ? (
              <View className="items-center justify-center py-12">
                <IconSymbol name="tray" size={64} color={colors.mutedForeground} />
                <Text className="text-muted-foreground mt-4">No incoming requests</Text>
              </View>
            ) : (
              incomingRequests.map((request) => renderUserCard(request, "incoming"))
            )}
          </View>
        ) : (
          <View className="px-4">
            {outgoingRequests.length === 0 ? (
              <View className="items-center justify-center py-12">
                <IconSymbol name="paperplane" size={64} color={colors.mutedForeground} />
                <Text className="text-muted-foreground mt-4">No sent requests</Text>
              </View>
            ) : (
              outgoingRequests.map((request) => renderUserCard(request, "outgoing"))
            )}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
