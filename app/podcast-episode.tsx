import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Share,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { PodcastPlayer } from "@/components/PodcastPlayer";

interface Episode {
  id: string;
  title: string;
  description: string | null;
  category: string;
  audio_url: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  media_type: "audio" | "video";
  host_name: string;
  release_date: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  favorites_count: number;
}

interface Comment {
  id: string;
  podcast_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  likes_count: number;
  created_at: string;
  user_liked: boolean;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

export default function PodcastEpisodeScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const episodeId = params.id as string;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  
  // User interactions
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Comments
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = ["😀", "😂", "😍", "🔥", "👍", "👏", "❤️", "🎉", "💯", "🙌", "😎", "🤔", "😢", "😱", "🎵", "🎧"];

  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchEpisode();
    fetchComments();
    recordView();
  }, [episodeId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await safeGetUser();
    setCurrentUser(user);
  };

  const fetchEpisode = async () => {
    try {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("id", episodeId)
        .maybeSingle();

      if (error) throw error;
      setEpisode(data);

      // Check if user liked/favorited
      if (currentUser) {
        const { data: likeData } = await supabase
          .from("podcast_likes")
          .select("id")
          .eq("podcast_id", episodeId)
          .eq("user_id", currentUser.id)
          .maybeSingle();
        setIsLiked(!!likeData);

        const { data: favData } = await supabase
          .from("podcast_favorites")
          .select("id")
          .eq("podcast_id", episodeId)
          .eq("user_id", currentUser.id)
          .maybeSingle();
        setIsFavorited(!!favData);
      }
    } catch (error: any) {
      console.error("Error fetching episode:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load episode",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchComments = async () => {
    try {
      if (!episodeId) return;

      // Step 1: fetch top-level comments (no PostgREST join to avoid schema cache issues)
      const { data: rawComments, error } = await supabase
        .from("podcast_comments")
        .select("id, podcast_id, user_id, content, parent_id, likes_count, created_at")
        .eq("podcast_id", episodeId)
        .is("parent_id", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
        return;
      }

      const topComments = rawComments || [];

      // Step 2: batch-fetch profiles for all comment authors
      const allUserIds = [...new Set(topComments.map((c: any) => c.user_id))];
      let profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", allUserIds);
        (profiles || []).forEach((p: any) => {
          profileMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }

      // Step 3: fetch replies and liked status for each comment
      const commentsWithReplies = await Promise.all(
        topComments.map(async (comment: any) => {
          const { data: rawReplies } = await supabase
            .from("podcast_comments")
            .select("id, podcast_id, user_id, content, parent_id, likes_count, created_at")
            .eq("parent_id", comment.id)
            .order("created_at", { ascending: true });

          // Enrich replies with profiles
          const replyUserIds = [...new Set((rawReplies || []).map((r: any) => r.user_id))];
          let replyProfileMap = { ...profileMap };
          const missingIds = replyUserIds.filter(id => !replyProfileMap[id]);
          if (missingIds.length > 0) {
            const { data: replyProfiles } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .in("id", missingIds);
            (replyProfiles || []).forEach((p: any) => {
              replyProfileMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
            });
          }

          const replies = (rawReplies || []).map((r: any) => ({
            ...r,
            user: replyProfileMap[r.user_id] || { full_name: "Student", avatar_url: null },
            user_liked: false,
            replies: [],
          }));

          // Check if current user liked this comment
          let userLiked = false;
          if (currentUser) {
            const { data: likeData } = await supabase
              .from("podcast_comment_likes")
              .select("id")
              .eq("comment_id", comment.id)
              .eq("user_id", currentUser.id)
              .maybeSingle();
            userLiked = !!likeData;
          }

          return {
            ...comment,
            user: profileMap[comment.user_id] || { full_name: "Student", avatar_url: null },
            user_liked: userLiked,
            replies,
          };
        })
      );

      setComments(commentsWithReplies);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      setComments([]);
    }
  };

  const recordView = async () => {
    try {
      const userId = currentUser?.id || null;
      await supabase.from("podcast_views").insert({
        podcast_id: episodeId,
        user_id: userId,
      });

      // Update views count
      await supabase.rpc("increment_podcast_views", { podcast_id: episodeId });
    } catch (error) {
      console.error("Error recording view:", error);
    }
  };

  const toggleLike = async () => {
    if (!currentUser) {
      Toast.show({
        type: "error",
        text1: "Please log in to like episodes",
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from("podcast_likes")
          .delete()
          .eq("podcast_id", episodeId)
          .eq("user_id", currentUser.id);
        setIsLiked(false);
      } else {
        await supabase.from("podcast_likes").insert({
          podcast_id: episodeId,
          user_id: currentUser.id,
        });
        setIsLiked(true);
      }
      fetchEpisode();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const result = await Share.share({
        message: `Check out this podcast episode: "${episode?.title}" by ${episode?.host_name}`,
        title: episode?.title,
      });
      
      if (result.action === Share.sharedAction) {
        Toast.show({
          type: "success",
          text1: "Shared successfully",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error sharing",
        text2: error.message,
      });
    } finally {
      setTimeout(() => setIsSharing(false), 500);
    }
  };

  const toggleFavorite = async () => {
    if (!currentUser) {
      Toast.show({
        type: "error",
        text1: "Please log in to save favorites",
      });
      return;
    }

    try {
      if (isFavorited) {
        await supabase
          .from("podcast_favorites")
          .delete()
          .eq("podcast_id", episodeId)
          .eq("user_id", currentUser.id);
        setIsFavorited(false);
        Toast.show({
          type: "success",
          text1: "Removed from favorites",
        });
      } else {
        await supabase.from("podcast_favorites").insert({
          podcast_id: episodeId,
          user_id: currentUser.id,
        });
        setIsFavorited(true);
        Toast.show({
          type: "success",
          text1: "Added to favorites",
        });
      }
      fetchEpisode();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    }
  };

  const handleReport = () => {
    if (!currentUser) {
      Toast.show({
        type: "error",
        text1: "Please log in to report",
      });
      return;
    }

    Alert.alert(
      "Report Episode",
      "Why are you reporting this episode?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Inappropriate Content",
          onPress: () => submitReport("inappropriate_content"),
        },
        { text: "Spam", onPress: () => submitReport("spam") },
        { text: "Misleading", onPress: () => submitReport("misleading") },
        { text: "Copyright", onPress: () => submitReport("copyright") },
        { text: "Other", onPress: () => submitReport("other") },
      ]
    );
  };

  const submitReport = async (reason: string) => {
    try {
      await supabase.from("podcast_reports").insert({
        podcast_id: episodeId,
        user_id: currentUser!.id,
        reason,
      });
      Toast.show({
        type: "success",
        text1: "Report submitted",
        text2: "Thank you for helping keep our community safe",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    }
  };

  const submitComment = async () => {
    if (!currentUser) {
      Toast.show({
        type: "error",
        text1: "Please log in to comment",
      });
      return;
    }

    if (!newComment.trim()) {
      Toast.show({
        type: "info",
        text1: "Comment is empty",
        text2: "Please write something before posting",
      });
      return;
    }

    setSubmittingComment(true);
    try {
      const { data, error } = await supabase.from("podcast_comments").insert({
        podcast_id: episodeId,
        user_id: currentUser.id,
        content: newComment.trim(),
        parent_id: replyingTo,
      }).select();

      if (error) {
        console.error("Error posting comment:", error);
        throw error;
      }

      setNewComment("");
      setReplyingTo(null);
      await fetchComments();
      await fetchEpisode();
      Toast.show({
        type: "success",
        text1: "Comment posted",
      });
    } catch (error: any) {
      console.error("Comment submission error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to post comment",
        text2: error.message || "Please try again",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!currentUser) return;

    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase
                .from("podcast_comments")
                .delete()
                .eq("id", commentId)
                .eq("user_id", currentUser.id);
              
              fetchComments();
              fetchEpisode();
              Toast.show({
                type: "success",
                text1: "Comment deleted",
              });
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: error.message,
              });
            }
          },
        },
      ]
    );
  };

  const toggleCommentLike = async (commentId: string) => {
    if (!currentUser) {
      Toast.show({
        type: "error",
        text1: "Please log in to like comments",
      });
      return;
    }

    try {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      if (comment.user_liked) {
        await supabase
          .from("podcast_comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", currentUser.id);
      } else {
        await supabase.from("podcast_comment_likes").insert({
          comment_id: commentId,
          user_id: currentUser.id,
        });
      }
      fetchComments();
    } catch (error: any) {
      console.error("Error toggling comment like:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  if (!episode) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-lg text-muted-foreground">Episode not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary px-6 py-3 rounded-xl mt-4"
          >
            <Text className="text-primary-foreground font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const mediaUrl = episode.media_type === "video" ? episode.video_url : episode.audio_url;

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchEpisode();
              fetchComments();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReport}>
            <IconSymbol name="exclamationmark.circle" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Thumbnail */}
        <View className="px-4 mb-4">
          {episode.thumbnail_url ? (
            <Image
              source={{ uri: episode.thumbnail_url }}
              className="w-full h-64 rounded-2xl"
              contentFit="cover"
            />
          ) : (
            <View className="w-full h-64 rounded-2xl bg-surface items-center justify-center">
              <IconSymbol
                name={episode.media_type === "video" ? "video.fill" : "music.note"}
                size={64}
                color={colors.muted}
              />
            </View>
          )}
        </View>

        {/* Episode Info */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="bg-primary/20 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-primary">{episode.category}</Text>
            </View>
            <Text className="text-xs text-muted-foreground">
              {formatDuration(episode.duration)}
            </Text>
          </View>

          <Text className="text-2xl font-bold text-foreground mb-2">{episode.title}</Text>
          <Text className="text-sm text-muted-foreground mb-4">By {episode.host_name}</Text>

          {episode.description && (
            <Text className="text-sm text-foreground leading-6 mb-4">
              {episode.description}
            </Text>
          )}

          {/* Stats */}
          <View className="flex-row items-center gap-4 mb-4">
            <View className="flex-row items-center gap-1">
              <IconSymbol name="eye.fill" size={16} color={colors.muted} />
              <Text className="text-sm text-muted-foreground">{episode.views_count}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <IconSymbol name="heart.fill" size={16} color={colors.muted} />
              <Text className="text-sm text-muted-foreground">{episode.likes_count}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <IconSymbol name="bubble.left.fill" size={16} color={colors.muted} />
              <Text className="text-sm text-muted-foreground">{episode.comments_count}</Text>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowPlayer(true)}
              className="flex-1 bg-primary py-3 rounded-xl items-center"
              disabled={!mediaUrl}
            >
              <View className="flex-row items-center gap-2">
                <IconSymbol name="play.fill" size={20} color={"white"} />
                <Text className="text-primary-foreground font-semibold">Play</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleLike}
              className={`px-4 py-3 rounded-xl flex-row items-center gap-2 ${
                isLiked ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <IconSymbol
                name={isLiked ? "heart.fill" : "heart"}
                size={20}
                color={isLiked ? "white" : colors.foreground}
              />
              <Text className={`text-sm font-semibold ${
                isLiked ? "text-primary-foreground" : "text-foreground"
              }`}>
                {episode.likes_count || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleFavorite}
              className={`px-4 py-3 rounded-xl items-center justify-center ${
                isFavorited ? "bg-primary" : "bg-surface"
              }`}
            >
              <IconSymbol
                name={isFavorited ? "bookmark.fill" : "bookmark"}
                size={20}
                color={isFavorited ? "white" : colors.foreground}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              className={`px-4 py-3 rounded-xl items-center justify-center ${
                isSharing ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <IconSymbol
                name="square.and.arrow.up"
                size={20}
                color={isSharing ? "white" : colors.foreground}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View className="px-4 py-6 border-t border-border">
          <Text className="text-lg font-bold text-foreground mb-4">
            Comments ({episode.comments_count})
          </Text>

          {/* Add Comment */}
          <View className="mb-6">
            {replyingTo && (
              <View className="flex-row items-center justify-between mb-2 bg-muted p-2 rounded-lg">
                <Text className="text-sm text-muted-foreground">Replying to comment...</Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <IconSymbol name="xmark" size={16} color={colors.muted} />
                </TouchableOpacity>
              </View>
            )}
            <View>
              <View className="flex-row gap-2 mb-2">
                <TextInput
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Add a comment..."
                  placeholderTextColor={colors.muted}
                  className="flex-1 bg-surface rounded-xl px-4 py-3 text-foreground"
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="px-4 py-3 rounded-xl bg-surface items-center justify-center"
                >
                  <Text className="text-xl">😀</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className={`px-4 py-3 rounded-xl items-center justify-center ${
                    newComment.trim() ? "bg-primary" : "bg-surface"
                  }`}
                >
                  {submittingComment ? (
                    <ActivityIndicator size="small" color={"white"} />
                  ) : (
                    <IconSymbol
                      name="paperplane.fill"
                      size={20}
                      color={newComment.trim() ? "white" : colors.muted}
                    />
                  )}
                </TouchableOpacity>
              </View>
              {showEmojiPicker && (
                <View className="bg-surface rounded-xl p-3 mb-2">
                  <View className="flex-row flex-wrap gap-2">
                    {emojis.map((emoji, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setNewComment(newComment + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="w-10 h-10 items-center justify-center"
                      >
                        <Text className="text-2xl">{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Comments List */}
          {comments.length === 0 ? (
            <View className="items-center py-8">
              <IconSymbol name="bubble.left" size={48} color={colors.muted} />
              <Text className="text-muted-foreground mt-2">No comments yet</Text>
              <Text className="text-sm text-muted-foreground">Be the first to comment!</Text>
            </View>
          ) : (
            <View className="gap-4">
              {comments.map((comment) => (
                <View key={comment.id} className="bg-surface rounded-xl p-4">
                  <View className="flex-row items-start gap-3">
                    <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                      <Text className="text-primary font-semibold">
                        {comment.user?.full_name?.[0] || "U"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="font-semibold text-foreground">
                          {comment.user?.full_name || "Anonymous"}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </Text>
                      </View>
                      <Text className="text-sm text-foreground mb-2">{comment.content}</Text>
                      <View className="flex-row items-center gap-4">
                        <TouchableOpacity
                          onPress={() => toggleCommentLike(comment.id)}
                          className="flex-row items-center gap-1"
                        >
                          <IconSymbol
                            name={comment.user_liked ? "heart.fill" : "heart"}
                            size={16}
                            color={comment.user_liked ? colors.primary : colors.muted}
                          />
                          <Text
                            className={`text-xs ${
                              comment.user_liked ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {comment.likes_count}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setReplyingTo(comment.id)}
                          className="flex-row items-center gap-1"
                        >
                          <IconSymbol name="arrowshape.turn.up.left" size={16} color={colors.muted} />
                          <Text className="text-xs text-muted-foreground">Reply</Text>
                        </TouchableOpacity>
                        {currentUser && comment.user_id === currentUser.id && (
                          <TouchableOpacity
                            onPress={() => deleteComment(comment.id)}
                            className="flex-row items-center gap-1"
                          >
                            <IconSymbol name="trash" size={16} color={colors.muted} />
                            <Text className="text-xs text-muted-foreground">Delete</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <View className="mt-3 ml-4 gap-3">
                          {comment.replies.map((reply) => (
                            <View key={reply.id} className="flex-row gap-2">
                              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                                <Text className="text-primary text-xs font-semibold">
                                  {reply.user?.full_name?.[0] || "U"}
                                </Text>
                              </View>
                              <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-1">
                                  <Text className="text-sm font-semibold text-foreground">
                                    {reply.user?.full_name || "Anonymous"}
                                  </Text>
                                  <Text className="text-xs text-muted-foreground">
                                    {formatDate(reply.created_at)}
                                  </Text>
                                </View>
                                <Text className="text-sm text-foreground">{reply.content}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Player Modal */}
      {showPlayer && mediaUrl && (
        <PodcastPlayer
          episodeId={episode.id}
          title={episode.title}
          hostName={episode.host_name}
          mediaType={episode.media_type}
          mediaUrl={mediaUrl}
          thumbnailUrl={episode.thumbnail_url || undefined}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </ScreenContainer>
  );
}
