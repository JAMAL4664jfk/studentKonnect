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
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { EmojiPicker } from "@/components/EmojiPicker";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ActionSheetIOS } from "react-native";
import { CallingModal } from "@/components/CallingModal";
import { UserProfileModal } from "@/components/UserProfileModal";
import { AttachmentPicker } from "@/components/AttachmentPicker";
import { UploadProgress } from "@/components/UploadProgress";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';

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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [showCallingModal, setShowCallingModal] = useState(false);
  const [callType, setCallType] = useState<"voice" | "video">("voice");
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadType, setUploadType] = useState<"image" | "video" | "file">("image");
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await safeGetUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Load current user's profile picture
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        
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

  const handleAttachmentPress = () => {
    setShowAttachmentPicker(true);
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await sendImageMessage(result.assets[0].uri);
    }
  };

  const handleTakeVideo = async () => {
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
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60, // 60 seconds max
    });

    if (!result.canceled && result.assets[0]) {
      await sendVideoMessage(result.assets[0].uri);
    }
  };

  const handleChooseMedia = async () => {
    // Using Android Photo Picker - no permissions required on Android 13+
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.type === 'video') {
        await sendVideoMessage(asset.uri);
      } else {
        await sendImageMessage(asset.uri);
      }
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
    setShowUploadProgress(true);
    setUploadProgress(0);
    setUploadFileName("Image");
    setUploadType("image");
    
    try {
      // Upload image to Supabase storage using FormData
      const fileName = `chat-images/${Date.now()}.jpg`;
      
      setUploadProgress(20);
      
      // Create FormData for React Native file upload
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: fileName.split('/').pop(),
      } as any);

      setUploadProgress(40);
      const { data, error } = await supabase.storage
        .from("chat-attachments")
        .upload(fileName, formData, {
          contentType: "image/jpeg",
        });

      if (error) {
        console.error('Image upload error:', error);
        Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2: error.message || "Could not upload image",
        });
        setSending(false);
        setShowUploadProgress(false);
        return;
      }

      setUploadProgress(70);
      const { data: urlData } = supabase.storage
        .from("chat-attachments")
        .getPublicUrl(fileName);

      console.log('Sending image message:', `[Image] ${urlData.publicUrl}`);
      await sendMessage(conversationId, `[Image] ${urlData.publicUrl}`, currentUserId);
      
      setUploadProgress(90);
      // Reload messages to show the attachment immediately
      await loadMessages(conversationId);
      
      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Toast.show({
        type: "success",
        text1: "Image sent",
      });
    } catch (error: any) {
      console.error('Error sending image:', error);
      Toast.show({
        type: "error",
        text1: "Failed to send image",
        text2: error.message || "Unknown error",
      });
    } finally {
      setSending(false);
      setShowUploadProgress(false);
      setUploadProgress(0);
    }
  };

  const sendVideoMessage = async (videoUri: string) => {
    if (!currentUserId) return;

    setSending(true);
    setShowUploadProgress(true);
    setUploadProgress(0);
    setUploadFileName("Video");
    setUploadType("video");
    
    try {
      // Check file size (50MB limit for videos)
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      const fileSizeMB = fileInfo.size ? fileInfo.size / (1024 * 1024) : 0;
      const maxSizeMB = 50;
      
      setUploadProgress(10);
      
      if (fileSizeMB > maxSizeMB) {
        Toast.show({
          type: "error",
          text1: "File Too Large",
          text2: `Video size is ${fileSizeMB.toFixed(1)}MB. Please upload a video smaller than ${maxSizeMB}MB.`,
          visibilityTime: 5000,
        });
        setSending(false);
        setShowUploadProgress(false);
        return;
      }
      
      setUploadProgress(20);
      
      // Upload video to Supabase storage using FormData
      const fileName = `chat-videos/${Date.now()}.mp4`;
      
      // Create FormData for React Native file upload
      const formData = new FormData();
      formData.append('file', {
        uri: videoUri,
        type: 'video/mp4',
        name: fileName.split('/').pop(),
      } as any);

      setUploadProgress(40);
      
      const { data, error } = await supabase.storage
        .from("chat-attachments")
        .upload(fileName, formData, {
          contentType: "video/mp4",
        });

      if (error) {
        console.error('Video upload error:', error);
        Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2: error.message || "Could not upload video",
        });
        setSending(false);
        setShowUploadProgress(false);
        return;
      }

      setUploadProgress(70);
      
      const { data: urlData } = supabase.storage
        .from("chat-attachments")
        .getPublicUrl(fileName);

      console.log('Sending video message:', `[Video] ${urlData.publicUrl}`);
      await sendMessage(conversationId, `[Video] ${urlData.publicUrl}`, currentUserId);
      
      setUploadProgress(90);
      
      // Reload messages to show the attachment immediately
      await loadMessages(conversationId);
      
      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Toast.show({
        type: "success",
        text1: "Video sent",
        text2: `${fileSizeMB.toFixed(1)}MB uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Error sending video:', error);
      Toast.show({
        type: "error",
        text1: "Failed to send video",
        text2: error.message || "Unknown error",
      });
    } finally {
      setSending(false);
      setShowUploadProgress(false);
      setUploadProgress(0);
    }
  };

  const sendFileMessage = async (fileUri: string, fileName: string) => {
    if (!currentUserId) return;

    setSending(true);
    setShowUploadProgress(true);
    setUploadProgress(0);
    setUploadFileName(fileName);
    setUploadType("file");
    
    try {
      // Check file size (25MB limit for documents)
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const fileSizeMB = fileInfo.size ? fileInfo.size / (1024 * 1024) : 0;
      const maxSizeMB = 25;
      
      setUploadProgress(10);
      
      if (fileSizeMB > maxSizeMB) {
        Toast.show({
          type: "error",
          text1: "File Too Large",
          text2: `File size is ${fileSizeMB.toFixed(1)}MB. Please upload a file smaller than ${maxSizeMB}MB.`,
          visibilityTime: 5000,
        });
        setSending(false);
        setShowUploadProgress(false);
        return;
      }
      
      const storageFileName = `chat-files/${Date.now()}-${fileName}`;
      
      setUploadProgress(20);
      
      // Get MIME type based on file extension
      const getFileType = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        const mimeTypes: { [key: string]: string } = {
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'ppt': 'application/vnd.ms-powerpoint',
          'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'txt': 'text/plain',
          'zip': 'application/zip',
        };
        return mimeTypes[ext || ''] || 'application/octet-stream';
      };
      
      const fileType = getFileType(fileName);
      
      // Create FormData for React Native file upload
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any);

      setUploadProgress(40);
      
      const { data, error } = await supabase.storage
        .from("chat-attachments")
        .upload(storageFileName, formData, {
          contentType: fileType,
        });

      if (error) {
        console.error('File upload error:', error);
        Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2: error.message || "Could not upload file",
        });
        setSending(false);
        setShowUploadProgress(false);
        return;
      }

      setUploadProgress(70);
      
      const { data: urlData } = supabase.storage
        .from("chat-attachments")
        .getPublicUrl(storageFileName);

      console.log('Sending file message:', `[File: ${fileName}] ${urlData.publicUrl}`);
      await sendMessage(conversationId, `[File: ${fileName}] ${urlData.publicUrl}`, currentUserId);
      
      setUploadProgress(90);
      
      // Reload messages to show the attachment immediately
      await loadMessages(conversationId);
      
      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Toast.show({
        type: "success",
        text1: "File sent",
        text2: `${fileName} (${fileSizeMB.toFixed(1)}MB)`,
      });
    } catch (error: any) {
      console.error('Error sending file:', error);
      Toast.show({
        type: "error",
        text1: "Failed to send file",
        text2: error.message || "Unknown error",
      });
    } finally {
      setSending(false);
      setShowUploadProgress(false);
      setUploadProgress(0);
    }
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

    // Check if message contains an image or file attachment
    const isImage = item.content.startsWith('[Image]');
    const isFile = item.content.startsWith('[File:');
    let attachmentUrl = '';
    let fileName = '';
    let displayText = item.content;

    if (isImage) {
      attachmentUrl = item.content.replace('[Image] ', '');
      displayText = '';
    } else if (isFile) {
      const match = item.content.match(/\[File: (.+?)\] (.+)/);
      if (match) {
        fileName = match[1];
        attachmentUrl = match[2];
        displayText = '';
      }
    }

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
            className={`rounded-2xl overflow-hidden ${
              isMe ? "bg-primary" : "bg-surface"
            }`}
          >
            {isImage && attachmentUrl ? (
              <TouchableOpacity
                onPress={() => {
                  // Open image in full screen or download
                  Alert.alert(
                    'Image Options',
                    'What would you like to do?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Open',
                        onPress: () => {
                          Linking.openURL(attachmentUrl);
                        },
                      },
                      {
                        text: 'Share',
                        onPress: async () => {
                          try {
                            // Use sharing instead of saving to gallery (no permissions required)
                            const fileUri = FileSystem.cacheDirectory + `image_${Date.now()}.jpg`;
                            const downloadResult = await FileSystem.downloadAsync(attachmentUrl, fileUri);
                            
                            if (await Sharing.isAvailableAsync()) {
                              await Sharing.shareAsync(downloadResult.uri);
                            } else {
                              Toast.show({
                                type: 'info',
                                text1: 'Sharing not available',
                                text2: 'Please use the Open option',
                              });
                            }
                          } catch (error) {
                            console.error('Share error:', error);
                            Toast.show({
                              type: 'error',
                              text1: 'Share failed',
                              text2: 'Could not share image',
                            });
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Image
                  source={{ uri: attachmentUrl }}
                  style={{ width: 200, height: 200, resizeMode: 'cover' }}
                />
              </TouchableOpacity>
            ) : isFile && fileName ? (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'File Options',
                    fileName,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Open',
                        onPress: () => {
                          Linking.openURL(attachmentUrl);
                        },
                      },
                      {
                        text: 'Download',
                        onPress: async () => {
                          try {
                            Toast.show({
                              type: 'info',
                              text1: 'Downloading...',
                            });

                            const fileUri = FileSystem.documentDirectory + fileName;
                            const downloadResult = await FileSystem.downloadAsync(attachmentUrl, fileUri);
                            
                            // Share/save the file
                            if (await Sharing.isAvailableAsync()) {
                              await Sharing.shareAsync(downloadResult.uri);
                            } else {
                              Toast.show({
                                type: 'success',
                                text1: 'File downloaded',
                                text2: 'File saved to app directory',
                              });
                            }
                          } catch (error) {
                            console.error('Download error:', error);
                            Toast.show({
                              type: 'error',
                              text1: 'Download failed',
                              text2: 'Could not download file',
                            });
                          }
                        },
                      },
                    ]
                  );
                }}
                className="px-4 py-3 flex-row items-center"
              >
                <IconSymbol name="doc.fill" size={24} color={isMe ? "#FFFFFF" : colors.foreground} />
                <Text className={`ml-2 ${isMe ? "text-white" : "text-foreground"}`}>
                  {fileName}
                </Text>
                <IconSymbol name="arrow.down.circle" size={20} color={isMe ? "#FFFFFF" : colors.primary} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            ) : (
              <View className="px-4 py-2">
                <Text className={`${isMe ? "text-white" : "text-foreground"}`}>
                  {displayText}
                </Text>
              </View>
            )}
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScreenContainer edges={["top", "left", "right", "bottom"]} className="flex-1">
      {/* Header with Gradient Background */}
      <View 
        className="border-b border-border"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}05 100%)`,
          backgroundColor: colors.primary + '08',
        }}
      >
        <View className="flex-row items-center p-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          
          {/* Centered User Info */}
          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center"
            onPress={() => setShowProfileModal(true)}
          >
            <View className="w-12 h-12 rounded-full mr-3 bg-muted/30 items-center justify-center overflow-hidden">
              {otherUserPhoto ? (
                <Image
                  source={{ uri: otherUserPhoto }}
                  className="w-full h-full"
                  style={{ resizeMode: 'cover' }}
                />
              ) : (
                <Text className="text-foreground font-bold text-xl">
                  {otherUserName?.charAt(0).toUpperCase() || '?'}
                </Text>
              )}
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-foreground">
                {otherUserName}
              </Text>
              <Text className="text-xs" style={{ color: colors.primary }}>
                {isOtherUserTyping ? "typing..." : "● Active now"}
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* Action Buttons */}
          <View className="flex-row">
            <TouchableOpacity
              className="w-9 h-9 rounded-full items-center justify-center mr-2"
              style={({ pressed }) => ({ 
                opacity: pressed ? 0.6 : 1,
                backgroundColor: colors.surface 
              })}
              onPress={() => {
                setCallType("voice");
                setShowCallingModal(true);
              }}
            >
              <IconSymbol name="phone.fill" size={18} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="w-9 h-9 rounded-full items-center justify-center mr-2"
              style={({ pressed }) => ({ 
                opacity: pressed ? 0.6 : 1,
                backgroundColor: colors.surface 
              })}
              onPress={() => {
                setCallType("video");
                setShowCallingModal(true);
              }}
            >
              <IconSymbol name="video.fill" size={18} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="w-9 h-9 rounded-full items-center justify-center"
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
                backgroundColor: colors.primary + '20'
              })}
              onPress={() => setShowSettingsMenu(true)}
            >
              <IconSymbol name="ellipsis.circle.fill" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Messages List */}
      <View className="flex-1">
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
              name="arrow.up.circle.fill"
              size={24}
              color={messageText.trim() && !sending ? "#FFFFFF" : colors.muted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calling Modal */}
      <CallingModal
        visible={showCallingModal}
        onClose={() => setShowCallingModal(false)}
        callType={callType}
        otherUserName={otherUserName}
        otherUserPhoto={otherUserPhoto}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={otherUserId}
      />

      {/* Attachment Picker */}
      <AttachmentPicker
        visible={showAttachmentPicker}
        onClose={() => setShowAttachmentPicker(false)}
        options={[
          {
            id: 'camera',
            title: 'Camera',
            icon: 'camera.fill',
            color: '#3b82f6',
            onPress: handleTakePhoto,
          },
          {
            id: 'video',
            title: 'Video',
            icon: 'video.fill',
            color: '#8b5cf6',
            onPress: handleTakeVideo,
          },
          {
            id: 'gallery',
            title: 'Gallery',
            icon: 'photo.fill',
            color: '#10b981',
            onPress: handleChooseMedia,
          },
          {
            id: 'document',
            title: 'Document',
            icon: 'doc.fill',
            color: '#f59e0b',
            onPress: handleChooseFile,
          },
        ]}
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
      <UploadProgress
        visible={showUploadProgress}
        progress={uploadProgress}
        fileName={uploadFileName}
        uploadType={uploadType}
      />
    </KeyboardAvoidingView>
  );
}
