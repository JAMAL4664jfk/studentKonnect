import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface OtherUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_online: boolean;
}

export default function ChatScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const otherUserId = params.userId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser && otherUserId) {
      fetchOtherUser();
      fetchMessages();
      
      // Subscribe to new messages
      const subscription = supabase
        .channel(`chat:${currentUser.id}:${otherUserId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "direct_messages",
            filter: `sender_id=eq.${otherUserId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUser, otherUserId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const fetchOtherUser = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", otherUserId)
        .single();

      if (error) throw error;

      // Get online status
      const { data: onlineData } = await supabase
        .from("user_online_status")
        .select("is_online")
        .eq("user_id", otherUserId)
        .single();

      setOtherUser({
        ...data,
        is_online: onlineData?.is_online || false,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error loading user",
        text2: error.message,
      });
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUser!.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUser!.id})`)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data || []);
      
      // Mark messages as read
      await supabase
        .from("direct_messages")
        .update({ is_read: true })
        .eq("sender_id", otherUserId)
        .eq("receiver_id", currentUser!.id)
        .eq("is_read", false);

      scrollToBottom();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error loading messages",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .insert({
          sender_id: currentUser.id,
          receiver_id: otherUserId,
          content: newMessage.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data]);
      setNewMessage("");
      scrollToBottom();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error sending message",
        text2: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === currentUser?.id;

    return (
      <View
        className={`flex-row mb-3 ${isMe ? "justify-end" : "justify-start"}`}
      >
        {!isMe && otherUser?.avatar_url && (
          <Image
            source={{ uri: otherUser.avatar_url }}
            className="w-8 h-8 rounded-full mr-2"
            contentFit="cover"
          />
        )}
        <View
          className={`max-w-[70%] px-4 py-3 rounded-2xl ${
            isMe
              ? "bg-primary rounded-br-sm"
              : "bg-surface rounded-bl-sm"
          }`}
        >
          <Text
            className={`text-sm ${
              isMe ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            {item.content}
          </Text>
          <Text
            className={`text-xs mt-1 ${
              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            
            <View className="relative mr-3">
              {otherUser?.avatar_url ? (
                <Image
                  source={{ uri: otherUser.avatar_url }}
                  className="w-10 h-10 rounded-full"
                  contentFit="cover"
                />
              ) : (
                <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                  <Text className="text-lg font-bold text-primary">
                    {otherUser?.full_name?.[0] || "U"}
                  </Text>
                </View>
              )}
              {otherUser?.is_online && (
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </View>

            <View className="flex-1">
              <Text className="text-lg font-bold text-foreground">
                {otherUser?.full_name || "User"}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {otherUser?.is_online ? "Online" : "Offline"}
              </Text>
            </View>
          </View>

          {/* Call Buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push(`/voice-call?userId=${otherUserId}&userName=${otherUser?.full_name}` as any)}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <IconSymbol name="phone.fill" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/video-call?userId=${otherUserId}&userName=${otherUser?.full_name}` as any)}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <IconSymbol name="video.fill" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <IconSymbol name="bubble.left.and.bubble.right" size={64} color={colors.mutedForeground} />
              <Text className="text-muted-foreground mt-4">No messages yet</Text>
              <Text className="text-sm text-muted-foreground">Start the conversation!</Text>
            </View>
          }
        />

        {/* Input */}
        <View className="flex-row items-center p-4 border-t border-border bg-background">
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            className="flex-1 bg-surface rounded-full px-4 py-3 text-foreground mr-2"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              newMessage.trim() ? "bg-primary" : "bg-surface"
            }`}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <IconSymbol
                name="paperplane.fill"
                size={20}
                color={newMessage.trim() ? colors.primaryForeground : colors.mutedForeground}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
