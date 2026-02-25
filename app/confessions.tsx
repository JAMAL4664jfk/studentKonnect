import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Share,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Confession {
  id: string;
  user_id: string;
  content: string;
  emoji: string;
  likes_count: number;
  comments_count: number;
  media_url: string | null;
  media_type: string | null;
  is_flagged: boolean;
  flag_count: number;
  created_at: string;
}

interface ConfessionComment {
  id: string;
  confession_id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

// ─── Emoji options ─────────────────────────────────────────────────────────────

const EMOJIS = ["🤫", "😳", "💀", "🫣", "😈", "🥵", "😭", "😂", "🤡", "💔", "🔥", "✨", "👀", "🤭", "😬"];

const FLAG_REASONS = [
  "Harassment or bullying",
  "Hate speech",
  "Spam or misleading",
  "Explicit content",
  "Personal information shared",
  "Other",
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ConfessionsScreen() {
  const colors = useColors();

  // State
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Post form
  const [newConfession, setNewConfession] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🤫");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Comments
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<ConfessionComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentAnonymous, setCommentAnonymous] = useState(true);
  const [postingComment, setPostingComment] = useState(false);

  // Likes
  const [likedConfessions, setLikedConfessions] = useState<Set<string>>(new Set());

  // Flag modal
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagTarget, setFlagTarget] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagDetails, setFlagDetails] = useState("");
  const [submittingFlag, setSubmittingFlag] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  // ─── Init ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      await loadLikedConfessions(user.id);
    }
    await loadConfessions();
  };

  // ─── Load confessions ─────────────────────────────────────────────────────

  const loadConfessions = async () => {
    try {
      const { data, error } = await supabase
        .from("anonymous_confessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setConfessions(data || []);
    } catch (err: any) {
      console.error("Error loading confessions:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConfessions();
  };

  // ─── Load liked confessions ───────────────────────────────────────────────

  const loadLikedConfessions = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("confession_likes")
        .select("confession_id")
        .eq("user_id", userId);
      if (data) {
        setLikedConfessions(new Set(data.map((l) => l.confession_id)));
      }
    } catch (err) {
      console.error("Error loading liked confessions:", err);
    }
  };

  // ─── Toggle like ──────────────────────────────────────────────────────────

  const toggleLike = async (confessionId: string) => {
    if (!currentUserId) {
      Alert.alert("Sign in required", "Please sign in to like confessions.");
      return;
    }
    const isLiked = likedConfessions.has(confessionId);

    // Optimistic update
    setLikedConfessions((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(confessionId); else next.add(confessionId);
      return next;
    });
    setConfessions((prev) =>
      prev.map((c) =>
        c.id === confessionId
          ? { ...c, likes_count: c.likes_count + (isLiked ? -1 : 1) }
          : c
      )
    );

    try {
      if (isLiked) {
        await supabase
          .from("confession_likes")
          .delete()
          .eq("confession_id", confessionId)
          .eq("user_id", currentUserId);
      } else {
        await supabase
          .from("confession_likes")
          .insert({ confession_id: confessionId, user_id: currentUserId });
        // Notify confession owner
        const confession = confessions.find((c) => c.id === confessionId);
        if (confession && confession.user_id !== currentUserId) {
          await supabase.from("notifications").insert({
            user_id: confession.user_id,
            type: "confession_like",
            title: "Your Confession Got a ❤️",
            body: "Someone liked your anonymous confession!",
            data: { confession_id: confessionId },
          });
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      // Revert optimistic update
      setLikedConfessions((prev) => {
        const next = new Set(prev);
        if (isLiked) next.add(confessionId); else next.delete(confessionId);
        return next;
      });
      setConfessions((prev) =>
        prev.map((c) =>
          c.id === confessionId
            ? { ...c, likes_count: c.likes_count + (isLiked ? 1 : -1) }
            : c
        )
      );
    }
  };

  // ─── Media picker ─────────────────────────────────────────────────────────

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setMediaUri(asset.uri);
      setMediaType(asset.type === "video" ? "video" : "image");
    }
  };

  // ─── Upload media ─────────────────────────────────────────────────────────

  const uploadMedia = async (): Promise<{ url: string; type: string } | null> => {
    if (!mediaUri || !currentUserId) return null;
    setUploading(true);
    try {
      const ext = mediaUri.split(".").pop() || (mediaType === "video" ? "mp4" : "jpg");
      const fileName = `${currentUserId}/${Date.now()}.${ext}`;
      const mimeType = mediaType === "video" ? `video/${ext}` : `image/${ext}`;

      const formData = new FormData();
      formData.append("file", { uri: mediaUri, type: mimeType, name: fileName } as any);

      const { error } = await supabase.storage
        .from("confession-media")
        .upload(fileName, formData as any, { contentType: mimeType });

      if (error) {
        console.error("Media upload error:", error.message);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("confession-media")
        .getPublicUrl(fileName);

      return { url: publicUrl, type: mediaType! };
    } finally {
      setUploading(false);
    }
  };

  // ─── Post confession ──────────────────────────────────────────────────────

  const postConfession = async () => {
    if (!currentUserId) {
      Alert.alert("Sign in required", "Please sign in to post a confession.");
      return;
    }
    if (!newConfession.trim() && !mediaUri) {
      Alert.alert("Empty confession", "Please write something or add media.");
      return;
    }

    setPosting(true);
    try {
      let mediaData: { url: string; type: string } | null = null;
      if (mediaUri) {
        mediaData = await uploadMedia();
      }

      const { error } = await supabase.from("anonymous_confessions").insert({
        user_id: currentUserId,
        content: newConfession.trim() || "📷",
        emoji: selectedEmoji,
        media_url: mediaData?.url || null,
        media_type: mediaData?.type || null,
      });

      if (error) throw error;

      setNewConfession("");
      setMediaUri(null);
      setMediaType(null);
      setSelectedEmoji("🤫");
      setShowComposer(false);
      await loadConfessions();
      Alert.alert("Posted! 🤫", "Your confession has been posted anonymously.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to post confession.");
    } finally {
      setPosting(false);
    }
  };

  // ─── Delete own confession ────────────────────────────────────────────────

  const deleteConfession = async (confessionId: string) => {
    Alert.alert("Delete Confession", "Are you sure you want to delete this confession?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("anonymous_confessions")
            .delete()
            .eq("id", confessionId);
          if (!error) {
            setConfessions((prev) => prev.filter((c) => c.id !== confessionId));
          }
        },
      },
    ]);
  };

  // ─── Comments ─────────────────────────────────────────────────────────────

  const toggleComments = async (confessionId: string) => {
    if (expandedComments === confessionId) {
      setExpandedComments(null);
      setComments([]);
      return;
    }
    setExpandedComments(confessionId);
    await loadComments(confessionId);
  };

  const loadComments = async (confessionId: string) => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("confession_comments")
        .select("*")
        .eq("confession_id", confessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Enrich non-anonymous comments with profile data
      const enriched: ConfessionComment[] = [];
      for (const comment of data || []) {
        if (!comment.is_anonymous) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", comment.user_id)
            .maybeSingle();
          enriched.push({
            ...comment,
            author_name: profile?.full_name || "Student",
            author_avatar: profile?.avatar_url || null,
          });
        } else {
          enriched.push({ ...comment, author_name: "Anonymous 🤫" });
        }
      }
      setComments(enriched);
    } catch (err) {
      console.error("Error loading comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const postComment = async (confessionId: string) => {
    if (!currentUserId) {
      Alert.alert("Sign in required", "Please sign in to comment.");
      return;
    }
    if (!newComment.trim()) return;

    setPostingComment(true);
    try {
      const { error } = await supabase.from("confession_comments").insert({
        confession_id: confessionId,
        user_id: currentUserId,
        content: newComment.trim(),
        is_anonymous: commentAnonymous,
      });
      if (error) throw error;

      // Notify confession owner
      const confession = confessions.find((c) => c.id === confessionId);
      if (confession && confession.user_id !== currentUserId) {
        await supabase.from("notifications").insert({
          user_id: confession.user_id,
          type: "confession_comment",
          title: "New Comment on Your Confession",
          body: commentAnonymous
            ? "Someone commented on your confession anonymously 🤫"
            : "Someone commented on your confession",
          data: { confession_id: confessionId },
        });
      }

      setNewComment("");
      await loadComments(confessionId);
      setConfessions((prev) =>
        prev.map((c) =>
          c.id === confessionId ? { ...c, comments_count: c.comments_count + 1 } : c
        )
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  // ─── Flag ─────────────────────────────────────────────────────────────────

  const openFlagModal = (confessionId: string) => {
    setFlagTarget(confessionId);
    setFlagReason("");
    setFlagDetails("");
    setShowFlagModal(true);
  };

  const submitFlag = async () => {
    if (!currentUserId || !flagTarget || !flagReason) return;
    setSubmittingFlag(true);
    try {
      const { error } = await supabase.from("content_flags").insert({
        content_type: "confession",
        content_id: flagTarget,
        reporter_id: currentUserId,
        reason: flagReason,
        details: flagDetails || null,
      });
      if (error?.code === "23505") {
        Alert.alert("Already Reported", "You've already reported this confession.");
      } else if (error) {
        throw error;
      } else {
        // Increment flag count
        await supabase.rpc("increment_flag_count", { confession_id: flagTarget }).maybeSingle();
        Alert.alert("Reported", "Thank you for helping keep the community safe.");
      }
      setShowFlagModal(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit report.");
    } finally {
      setSubmittingFlag(false);
    }
  };

  // ─── Share ────────────────────────────────────────────────────────────────

  const shareConfession = async (confession: Confession) => {
    try {
      await Share.share({
        message: `${confession.emoji} Anonymous confession on StudentKonnect:\n\n"${confession.content}"`,
      });
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  // ─── Time formatting ──────────────────────────────────────────────────────

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // ─── Render confession card ───────────────────────────────────────────────

  const renderConfession = ({ item: confession }: { item: Confession }) => {
    const isLiked = likedConfessions.has(confession.id);
    const isOwn = confession.user_id === currentUserId;
    const isExpanded = expandedComments === confession.id;

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          marginBottom: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16, paddingBottom: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.primary + "20",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 22 }}>{confession.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 14 }}>
              Anonymous 🤫
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 1 }}>
              {formatTime(confession.created_at)}
            </Text>
          </View>
          {isOwn && (
            <TouchableOpacity
              onPress={() => deleteConfession(confession.id)}
              style={{ padding: 4 }}
            >
              <IconSymbol name="trash" size={18} color={colors.error} />
            </TouchableOpacity>
          )}
          {!isOwn && (
            <TouchableOpacity
              onPress={() => openFlagModal(confession.id)}
              style={{ padding: 4 }}
            >
              <IconSymbol name="flag" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {confession.content && confession.content !== "📷" && (
          <Text
            style={{
              color: colors.foreground,
              fontSize: 15,
              lineHeight: 22,
              paddingHorizontal: 16,
              paddingBottom: confession.media_url ? 12 : 16,
            }}
          >
            {confession.content}
          </Text>
        )}

        {/* Media */}
        {confession.media_url && confession.media_type === "image" && (
          <Image
            source={{ uri: confession.media_url }}
            style={{ width: "100%", height: 240 }}
            resizeMode="cover"
          />
        )}

        {/* Actions */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            gap: 4,
          }}
        >
          {/* Like */}
          <TouchableOpacity
            onPress={() => toggleLike(confession.id)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}
          >
            <IconSymbol
              name={isLiked ? "heart.fill" : "heart"}
              size={20}
              color={isLiked ? colors.love : colors.muted}
            />
            <Text style={{ color: isLiked ? colors.love : colors.muted, fontSize: 13, fontWeight: "600" }}>
              {confession.likes_count}
            </Text>
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity
            onPress={() => toggleComments(confession.id)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}
          >
            <IconSymbol
              name={isExpanded ? "bubble.left.fill" : "bubble.left"}
              size={20}
              color={isExpanded ? colors.primary : colors.muted}
            />
            <Text style={{ color: isExpanded ? colors.primary : colors.muted, fontSize: 13, fontWeight: "600" }}>
              {confession.comments_count}
            </Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            onPress={() => shareConfession(confession)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}
          >
            <IconSymbol name="square.and.arrow.up" size={20} color={colors.muted} />
            <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comments section */}
        {isExpanded && (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            {loadingComments ? (
              <ActivityIndicator color={colors.primary} style={{ padding: 16 }} />
            ) : (
              <>
                {comments.length === 0 && (
                  <Text style={{ color: colors.muted, textAlign: "center", padding: 16, fontSize: 13 }}>
                    No comments yet. Be the first!
                  </Text>
                )}
                {comments.map((comment) => (
                  <View
                    key={comment.id}
                    style={{
                      flexDirection: "row",
                      padding: 12,
                      paddingHorizontal: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: comment.is_anonymous ? colors.muted + "30" : colors.primary + "20",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {comment.author_avatar && !comment.is_anonymous ? (
                        <Image
                          source={{ uri: comment.author_avatar }}
                          style={{ width: 32, height: 32, borderRadius: 16 }}
                        />
                      ) : (
                        <Text style={{ fontSize: 14 }}>{comment.is_anonymous ? "🤫" : "👤"}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 13 }}>
                        {comment.author_name}
                      </Text>
                      <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 2, lineHeight: 18 }}>
                        {comment.content}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>
                        {formatTime(comment.created_at)}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Add comment */}
                <View style={{ padding: 12, paddingHorizontal: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <TouchableOpacity
                      onPress={() => setCommentAnonymous(!commentAnonymous)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor: commentAnonymous ? colors.primary + "20" : colors.muted + "20",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ fontSize: 12 }}>{commentAnonymous ? "🤫" : "👤"}</Text>
                      <Text
                        style={{
                          color: commentAnonymous ? colors.primary : colors.muted,
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        {commentAnonymous ? "Anonymous" : "Show name"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        color: colors.foreground,
                        fontSize: 14,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                      placeholder="Write a comment..."
                      placeholderTextColor={colors.muted}
                      value={newComment}
                      onChangeText={setNewComment}
                      multiline
                    />
                    <TouchableOpacity
                      onPress={() => postComment(confession.id)}
                      disabled={postingComment || !newComment.trim()}
                      style={{
                        backgroundColor: newComment.trim() ? colors.primary : colors.muted + "40",
                        borderRadius: 12,
                        width: 44,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {postingComment ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <IconSymbol name="paperplane.fill" size={18} color="white" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Post a confession box */}
        <View
          style={{
            backgroundColor: colors.surface,
            margin: 16,
            marginBottom: 8,
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {/* Title row — always visible, tapping toggles composer */}
          <TouchableOpacity
            onPress={() => setShowComposer(!showComposer)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: showComposer ? 12 : 0 }}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.love + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 18 }}>🤫</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 15 }}>
                Confess Anonymously
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                {showComposer ? "Tap to collapse" : "Tap to write a confession..."}
              </Text>
            </View>
            <IconSymbol
              name={showComposer ? "chevron.up" : "chevron.down"}
              size={18}
              color={colors.muted}
            />
          </TouchableOpacity>

          {showComposer && (
            <View>
              {/* Emoji picker row */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 10 }}
              >
                {EMOJIS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => setSelectedEmoji(emoji)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      marginRight: 6,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        selectedEmoji === emoji ? colors.primary + "25" : colors.background,
                      borderWidth: selectedEmoji === emoji ? 2 : 1,
                      borderColor: selectedEmoji === emoji ? colors.primary : colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Text input */}
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.foreground,
                  fontSize: 14,
                  minHeight: 80,
                  textAlignVertical: "top",
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 10,
                }}
                placeholder="What's your confession? 🤫 No one will know it's you..."
                placeholderTextColor={colors.muted}
                value={newConfession}
                onChangeText={setNewConfession}
                multiline
                maxLength={500}
                autoFocus
              />

              {/* Character count */}
              <Text style={{ color: colors.muted, fontSize: 11, textAlign: "right", marginBottom: 8 }}>
                {newConfession.length}/500
              </Text>

              {/* Media preview */}
              {mediaUri && (
                <View style={{ marginBottom: 10, position: "relative" }}>
                  <Image
                    source={{ uri: mediaUri }}
                    style={{ width: "100%", height: 160, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => { setMediaUri(null); setMediaType(null); }}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderRadius: 12,
                      padding: 4,
                    }}
                  >
                    <IconSymbol name="xmark" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Action row */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={pickMedia}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flex: 1,
                  }}
                >
                  <IconSymbol name="photo" size={18} color={colors.muted} />
                  <Text style={{ color: colors.muted, fontSize: 13 }}>Add Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={postConfession}
                  disabled={posting || uploading || (!newConfession.trim() && !mediaUri)}
                  style={{
                    backgroundColor:
                      posting || uploading || (!newConfession.trim() && !mediaUri)
                        ? colors.muted + "40"
                        : colors.love,
                    borderRadius: 12,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                  }}
                >
                  {posting || uploading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
                      Confess 🤫
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Feed */}
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} size="large" />
        ) : (
          <FlatList
            data={confessions}
            keyExtractor={(item) => item.id}
            renderItem={renderConfession}
            contentContainerStyle={{ padding: 16, paddingTop: 8 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🤫</Text>
                <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
                  No confessions yet
                </Text>
                <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center" }}>
                  Be the first to confess anonymously!
                </Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>

      {/* Flag Modal */}
      <Modal visible={showFlagModal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: "80%",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700" }}>
                Report Confession
              </Text>
              <TouchableOpacity onPress={() => setShowFlagModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={26} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 16 }}>
              Why are you reporting this confession?
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {FLAG_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setFlagReason(reason)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 8,
                    backgroundColor:
                      flagReason === reason ? colors.primary + "15" : colors.background,
                    borderWidth: 1,
                    borderColor: flagReason === reason ? colors.primary : colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: flagReason === reason ? colors.primary : colors.muted,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {flagReason === reason && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: colors.primary,
                        }}
                      />
                    )}
                  </View>
                  <Text style={{ color: colors.foreground, fontSize: 14 }}>{reason}</Text>
                </TouchableOpacity>
              ))}

              <TextInput
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.foreground,
                  fontSize: 14,
                  minHeight: 80,
                  textAlignVertical: "top",
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginTop: 8,
                  marginBottom: 16,
                }}
                placeholder="Additional details (optional)"
                placeholderTextColor={colors.muted}
                value={flagDetails}
                onChangeText={setFlagDetails}
                multiline
              />

              <TouchableOpacity
                onPress={submitFlag}
                disabled={submittingFlag || !flagReason}
                style={{
                  backgroundColor: !flagReason ? colors.muted + "40" : colors.error,
                  borderRadius: 14,
                  padding: 16,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                {submittingFlag ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>
                    Submit Report
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
