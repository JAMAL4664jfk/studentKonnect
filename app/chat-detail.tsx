import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useChat } from "@/contexts/ChatContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { EmojiPicker } from "@/components/EmojiPicker";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ActionSheetIOS } from "react-native";
import { CallingModal } from "@/components/CallingModal";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export default function ChatDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const conversationId = params.conversationId as string;
  const otherUserName = params.otherUserName as string;
  const otherUserPhoto = params.otherUserPhoto as string;
  const otherUserId = params.otherUserId as string;

  const { messages, typingUsers, loadMessages, sendMessage, markAsRead, subscribeToMessages, unsubscribeFromMessages, sendTypingIndicator } = useChat();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCallingModal, setShowCallingModal] = useState(false);
  const [callType, setCallType] = useState<"voice" | "video">("voice");
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Load current user's profile picture
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setCurrentUserPhoto(profile.avatar_url);
        }
        
        loadMessages(conversationId);
        markAsRead(conversationId, user.id);
        subscribeToMessages(conversationId);
      }
    };

    getCurrentUser();

    return () => {
      unsubscribeFromMessages();
    };
  }, [conversationId]);

  const conversationMessages = messages[conversationId] || [];
  const isOtherUserTyping = (typingUsers[conversationId] || []).includes(otherUserId);

  const handleTextChange = (text: string) => {
    setMessageText(text);
    
    if (!currentUserId) return;
    
    // Send typing indicator
    sendTypingIndicator(conversationId, currentUserId, true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(conversationId, currentUserId, false);
    }, 2000);
  };

  const handleAttachmentPress = async () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library", "Choose File"],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleTakePhoto();
          } else if (buttonIndex === 2) {
            await handleChoosePhoto();
          } else if (buttonIndex === 3) {
            await handleChooseFile();
          }
        }
      );
    } else {
      // Android: Show alert with options
      Alert.alert(
        "Add Attachment",
        "Choose an option",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Take Photo", onPress: handleTakePhoto },
          { text: "Choose from Library", onPress: handleChoosePhoto },
          { text: "Choose File", onPress: handleChooseFile },
        ],
        { cancelable: true }
      );
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Denied",
        text2: "Camera permission is required",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await sendImageMessage(result.assets[0].uri);
    }
  };

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Denied",
        text2: "Media library permission is required",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await sendImageMessage(result.assets[0].uri);
    }
  };

  const handleChooseFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      await sendFileMessage(result.assets[0].uri, result.assets[0].name);
    }
  };

  const sendImageMessage = async (imageUri: string) => {
    if (!currentUserId) return;

    setSending(true);
    // Upload image to Supabase storage
    const fileName = `chat-images/${Date.now()}.jpg`;
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from("chat-attachments")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
      });

    if (error) {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: "Could not upload image",
      });
      setSending(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("chat-attachments")
      .getPublicUrl(fileName);

    await sendMessage(conversationId, `[Image] ${urlData.publicUrl}`, currentUserId);
    setSending(false);
  };

  const sendFileMessage = async (fileUri: string, fileName: string) => {
    if (!currentUserId) return;

    setSending(true);
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const storageFileName = `chat-files/${Date.now()}-${fileName}`;
    const { data, error } = await supabase.storage
      .from("chat-attachments")
      .upload(storageFileName, blob);

    if (error) {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: "Could not upload file",
      });
      setSending(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("chat-attachments")
      .getPublicUrl(storageFileName);

    await sendMessage(conversationId, `[File: ${fileName}] ${urlData.publicUrl}`, currentUserId);
    setSending(false);
  };

  const handleBlockUser = async () => {
    if (!currentUserId) return;

    Alert.alert(
      "Block User",
      `Are you sure you want to block ${otherUserName}? You won't receive messages from them.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.from("blocked_users").insert({
                blocker_id: currentUserId,
                blocked_id: otherUserId,
              });

              Toast.show({
                type: "success",
                text1: "User blocked",
                text2: `${otherUserName} has been blocked`,
              });

              setShowSettingsMenu(false);
              router.back();
            } catch (error) {
              console.error("Error blocking user:", error);
              Toast.show({
                type: "error",
                text1: "Failed to block user",
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteChat = async () => {
    if (!currentUserId) return;

    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.from("deleted_chats").insert({
                conversation_id: conversationId,
                user_id: currentUserId,
              });

              Toast.show({
                type: "success",
                text1: "Chat deleted",
              });

              setShowSettingsMenu(false);
              router.back();
            } catch (error) {
              console.error("Error deleting chat:", error);
              Toast.show({
                type: "error",
                text1: "Failed to delete chat",
              });
            }
          },
        },
      ]
    );
  };

  const handleSend = async () => {
    if (!messageText.trim() || !currentUserId || sending) return;

    setSending(true);
    const content = messageText.trim();
    setMessageText("");

    await sendMessage(conversationId, content, currentUserId);
    setSending(false);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === currentUserId;
    const messageTime = new Date(item.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View
        className={`flex-row mb-3 ${isMe ? "justify-end" : "justify-start"}`}
      >
        {!isMe && (
          <View className="w-8 h-8 rounded-full mr-2 bg-muted/30 items-center justify-center overflow-hidden">
            {otherUserPhoto ? (
              <Image
                source={{ uri: otherUserPhoto }}
                className="w-full h-full"
                style={{ resizeMode: 'cover' }}
              />
            ) : (
              <Text className="text-foreground font-bold text-sm">
                {otherUserName?.charAt(0).toUpperCase() || '?'}
              </Text>
            )}
          </View>
        )}
        <View className={`max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
          <View
            className={`px-4 py-2 rounded-2xl ${
              isMe ? "bg-primary" : "bg-surface"
            }`}
          >
            <Text className={`${isMe ? "text-white" : "text-foreground"}`}>
              {item.content}
            </Text>
          </View>
          <Text className="text-xs text-muted mt-1">{messageTime}</Text>
        </View>
        {isMe && (
          <View className="w-8 h-8 rounded-full ml-2 bg-primary/30 items-center justify-center overflow-hidden">
            {currentUserPhoto ? (
              <Image
                source={{ uri: currentUserPhoto }}
                className="w-full h-full"
                style={{ resizeMode: 'cover' }}
              />
            ) : (
              <Text className="text-white font-bold text-sm">Me</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} className="flex-1">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View className="w-10 h-10 rounded-full mr-3 bg-muted/30 items-center justify-center overflow-hidden">
          {otherUserPhoto ? (
            <Image
              source={{ uri: otherUserPhoto }}
              className="w-full h-full"
              style={{ resizeMode: 'cover' }}
            />
          ) : (
            <Text className="text-foreground font-bold text-lg">
              {otherUserName?.charAt(0).toUpperCase() || '?'}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">
            {otherUserName}
          </Text>
          <Text className="text-xs text-muted">
            {isOtherUserTyping ? "typing..." : "Active now"}
          </Text>
        </View>
        
        {/* Call Buttons */}
        <TouchableOpacity
          className="w-9 h-9 rounded-full items-center justify-center mr-2"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          onPress={() => {
            setCallType("voice");
            setShowCallingModal(true);
          }}
        >
          <IconSymbol name="phone.fill" size={20} color={colors.foreground} />
        </TouchableOpacity>
        
        <TouchableOpacity
          className="w-9 h-9 rounded-full items-center justify-center mr-2"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          onPress={() => {
            setCallType("video");
            setShowCallingModal(true);
          }}
        >
          <IconSymbol name="video.fill" size={20} color={colors.foreground} />
        </TouchableOpacity>
        
        <TouchableOpacity
          className="w-9 h-9 rounded-full items-center justify-center bg-muted/20"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          onPress={() => setShowSettingsMenu(true)}
        >
          <IconSymbol name="ellipsis.circle.fill" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={conversationMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <IconSymbol
                name="message.fill"
                size={48}
                color={colors.muted}
              />
              <Text className="text-muted text-center mt-4">
                No messages yet. Start the conversation!
              </Text>
            </View>
          }
        />

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <EmojiPicker
            onEmojiSelect={(emoji) => {
              setMessageText((prev) => prev + emoji);
            }}
          />
        )}

        {/* Input Area */}
        <View className="flex-row items-center p-4 border-t border-border bg-background">
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center mr-2"
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            onPress={handleAttachmentPress}
          >
            <IconSymbol name="plus.circle.fill" size={28} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center mr-2"
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Text className="text-2xl">{showEmojiPicker ? "⌨️" : "😀"}</Text>
          </TouchableOpacity>
          
                <TextInput
                  value={messageText}
                  onChangeText={handleTextChange}
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            className="flex-1 bg-surface rounded-full px-4 py-3 text-foreground mr-3"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            onFocus={() => setShowEmojiPicker(false)}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              messageText.trim() && !sending ? "bg-primary" : "bg-muted"
            }`}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <IconSymbol
              name="paperplane.fill"
              size={20}
              color={messageText.trim() && !sending ? "#FFFFFF" : colors.muted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Calling Modal */}
      <CallingModal
        visible={showCallingModal}
        onClose={() => setShowCallingModal(false)}
        callType={callType}
        otherUserName={otherUserName}
        otherUserPhoto={otherUserPhoto}
      />

      {/* Settings Menu Modal */}
      <Modal visible={showSettingsMenu} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-foreground">Chat Settings</Text>
              <TouchableOpacity onPress={() => setShowSettingsMenu(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <View className="flex-row items-center p-4 bg-surface rounded-xl mb-4">
              <Image
                source={{ uri: otherUserPhoto || "https://via.placeholder.com/50" }}
                className="w-14 h-14 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">{otherUserName}</Text>
                <Text className="text-sm text-muted">Active now</Text>
              </View>
            </View>

            {/* Settings Options */}
            <View className="gap-2">
              <TouchableOpacity
                onPress={() => {
                  setShowSettingsMenu(false);
                  // Navigate to user profile
                }}
                className="flex-row items-center p-4 bg-surface rounded-xl"
              >
                <IconSymbol name="person.circle" size={24} color={colors.primary} />
                <Text className="text-base font-semibold text-foreground ml-3">View Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteChat}
                className="flex-row items-center p-4 bg-surface rounded-xl"
              >
                <IconSymbol name="trash" size={24} color={colors.destructive} />
                <Text className="text-base font-semibold ml-3" style={{ color: colors.destructive }}>
                  Delete Chat
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBlockUser}
                className="flex-row items-center p-4 bg-surface rounded-xl"
              >
                <IconSymbol name="hand.raised.fill" size={24} color={colors.destructive} />
                <Text className="text-base font-semibold ml-3" style={{ color: colors.destructive }}>
                  Block User
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </ScreenContainer>
  );
}
