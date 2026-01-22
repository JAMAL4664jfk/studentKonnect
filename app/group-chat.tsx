import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import * as Haptics from "expo-haptics";

interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  content: string;
  created_at: string;
}

interface GroupMember {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string;
  is_admin: boolean;
  joined_at: string;
}

export default function GroupChatScreen() {
  const { groupId, groupName, memberCount } = useLocalSearchParams();
  const colors = useColors();
  const { user } = useAuth();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (groupId && user?.id) {
      loadMessages();
      loadMembers();
      subscribeToMessages();
    }
  }, [groupId, user?.id]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("group_messages")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      } else {
        // Sample messages for testing
        setMessages([
          {
            id: "1",
            group_id: groupId as string,
            sender_id: "sample-1",
            sender_name: "Thabo Mokoena",
            sender_avatar: "https://i.pravatar.cc/150?img=12",
            content: "Hey everyone! Welcome to the group 👋",
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "2",
            group_id: groupId as string,
            sender_id: "sample-2",
            sender_name: "Nomsa Dlamini",
            sender_avatar: "https://i.pravatar.cc/150?img=45",
            content: "Thanks for creating this group!",
            created_at: new Date(Date.now() - 1800000).toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          id,
          user_id,
          is_admin,
          joined_at,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq("group_id", groupId);

      if (!error && data && data.length > 0) {
        const formattedMembers = data.map((member: any) => ({
          id: member.id,
          user_id: member.user_id,
          full_name: member.profiles?.full_name || "Unknown",
          avatar_url: member.profiles?.avatar_url || "",
          is_admin: member.is_admin,
          joined_at: member.joined_at,
        }));
        setMembers(formattedMembers);
      } else {
        // Sample members for testing
        setMembers([
          {
            id: "1",
            user_id: "sample-1",
            full_name: "Thabo Mokoena",
            avatar_url: "https://i.pravatar.cc/150?img=12",
            is_admin: true,
            joined_at: new Date().toISOString(),
          },
          {
            id: "2",
            user_id: "sample-2",
            full_name: "Nomsa Dlamini",
            avatar_url: "https://i.pravatar.cc/150?img=45",
            is_admin: false,
            joined_at: new Date().toISOString(),
          },
          {
            id: "3",
            user_id: "sample-3",
            full_name: "Sipho Ndlovu",
            avatar_url: "https://i.pravatar.cc/150?img=33",
            is_admin: false,
            joined_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading members:", error);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`group:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as GroupMessage]);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const message: GroupMessage = {
      id: Date.now().toString(),
      group_id: groupId as string,
      sender_id: user.id,
      sender_name: user.email?.split("@")[0] || "You",
      sender_avatar: "",
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("group_messages").insert({
        group_id: groupId,
        sender_id: user.id,
        sender_name: message.sender_name,
        sender_avatar: message.sender_avatar,
        content: message.content,
      });

      if (error) {
        // Add locally if Supabase fails
        setMessages((prev) => [...prev, message]);
      }
    } catch (error) {
      // Add locally if Supabase fails
      setMessages((prev) => [...prev, message]);
    }

    setNewMessage("");
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderMessage = ({ item }: { item: GroupMessage }) => {
    const isMe = item.sender_id === user?.id;

    return (
      <View className={`px-4 py-2 ${isMe ? "items-end" : "items-start"}`}>
        <View className={`flex-row ${isMe ? "flex-row-reverse" : ""} items-end max-w-[80%]`}>
          {!isMe && (
            <Image
              source={{ uri: item.sender_avatar || "https://via.placeholder.com/40" }}
              className="w-8 h-8 rounded-full mr-2"
            />
          )}
          <View>
            {!isMe && (
              <Text className="text-xs font-semibold text-foreground mb-1 ml-1">
                {item.sender_name}
              </Text>
            )}
            <View
              className="rounded-2xl px-4 py-2"
              style={{
                backgroundColor: isMe ? colors.primary : colors.surface,
              }}
            >
              <Text
                className="text-base"
                style={{ color: isMe ? "#fff" : colors.foreground }}
              >
                {item.content}
              </Text>
            </View>
            <Text className="text-xs text-muted mt-1 ml-1">
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowMembers(true)}
          className="flex-1 flex-row items-center"
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <IconSymbol name="person.3.fill" size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">{groupName}</Text>
            <Text className="text-sm text-muted">{memberCount} members</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowMembers(true)}>
          <IconSymbol name="info.circle" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 8 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <View
        className="flex-row items-center px-4 py-3 border-t"
        style={{ borderTopColor: colors.border }}
      >
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.muted}
          className="flex-1 rounded-full px-4 py-2 mr-2"
          style={{
            backgroundColor: colors.surface,
            color: colors.foreground,
          }}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: newMessage.trim() ? colors.primary : colors.surface,
          }}
        >
          <IconSymbol
            name="paperplane.fill"
            size={20}
            color={newMessage.trim() ? "#fff" : colors.muted}
          />
        </TouchableOpacity>
      </View>

      {/* Members Modal */}
      <Modal
        visible={showMembers}
        animationType="slide"
        transparent
        onRequestClose={() => setShowMembers(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            className="rounded-t-3xl"
            style={{
              backgroundColor: colors.background,
              maxHeight: "80%",
            }}
          >
            <View className="flex-row items-center justify-between px-6 py-4 border-b" style={{ borderBottomColor: colors.border }}>
              <Text className="text-xl font-bold text-foreground">Group Members</Text>
              <TouchableOpacity onPress={() => setShowMembers(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-6 py-4">
              {members.map((member) => (
                <View
                  key={member.id}
                  className="flex-row items-center py-3 border-b"
                  style={{ borderBottomColor: colors.border }}
                >
                  <Image
                    source={{ uri: member.avatar_url || "https://via.placeholder.com/50" }}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {member.full_name}
                    </Text>
                    {member.is_admin && (
                      <Text className="text-sm" style={{ color: colors.primary }}>
                        Admin
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setShowMembers(false);
                      router.push({
                        pathname: "/chat-detail",
                        params: {
                          userId: member.user_id,
                          userName: member.full_name,
                          userAvatar: member.avatar_url,
                        },
                      });
                    }}
                    className="px-4 py-2 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-white font-semibold text-sm">Message</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
