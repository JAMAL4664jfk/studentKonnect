import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  Pressable,
  RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";

type Podcast = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  audio_url: string;
  thumbnail_url: string | null;
  duration: string | null;
  release_date: string;
  featured: boolean;
  host_name: string;
  user_id: string;
  series_id: string | null;
  episode_number: number | null;
  season_number: number | null;
};

type Series = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  user_id: string;
  created_at: string;
  episode_count?: number;
};

type Rating = {
  id: string;
  podcast_id: string;
  user_id: string;
  rating: number;
  created_at: string;
  user?: {
    full_name: string | null;
  };
};

type Comment = {
  id: string;
  podcast_id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  parent_id: string | null;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
};

const CATEGORIES = ["All Episodes", "Education", "Career", "Mental Health", "Technology", "Campus Life"];

export default function PodcastsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Episodes");
  const [activeView, setActiveView] = useState<"episodes" | "series" | "myseries">("episodes");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  // Create Series Modal
  const [showCreateSeries, setShowCreateSeries] = useState(false);
  const [newSeries, setNewSeries] = useState({
    title: "",
    description: "",
    category: "Education",
  });
  const [seriesThumbnail, setSeriesThumbnail] = useState<string | null>(null);
  const [creatingSeries, setCreatingSeries] = useState(false);

  // Upload Episode Modal
  const [showUploadEpisode, setShowUploadEpisode] = useState(false);
  const [uploadType, setUploadType] = useState<"standalone" | "series">("standalone");
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");
  const [newEpisode, setNewEpisode] = useState({
    title: "",
    description: "",
    host: "",
    category: "Education",
    duration: "",
    episodeNumber: "",
    seasonNumber: "",
  });
  const [mediaType, setMediaType] = useState<"audio" | "video">("audio");
  const [audioFile, setAudioFile] = useState<{ uri: string; name: string } | null>(null);
  const [videoFile, setVideoFile] = useState<{ uri: string; name: string } | null>(null);
  const [episodeThumbnail, setEpisodeThumbnail] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Series Detail Modal
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [seriesEpisodes, setSeriesEpisodes] = useState<Podcast[]>([]);
  const [showSeriesDetail, setShowSeriesDetail] = useState(false);

  // Episode Detail Modal (for ratings and comments)
  const [selectedEpisode, setSelectedEpisode] = useState<Podcast | null>(null);
  const [showEpisodeDetail, setShowEpisodeDetail] = useState(false);
  const [episodeRatings, setEpisodeRatings] = useState<Rating[]>([]);
  const [episodeComments, setEpisodeComments] = useState<Comment[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkAuth();
    fetchPodcasts();
    fetchSeries();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchPodcasts = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .order("featured", { ascending: false })
        .order("release_date", { ascending: false });

      if (error) throw error;
      setPodcasts(data || []);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load podcasts",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSeries = async () => {
    try {
      const { data, error } = await supabase
        .from("podcast_series")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get episode counts for each series
      const seriesWithCounts = await Promise.all(
        (data || []).map(async (s) => {
          const { count } = await supabase
            .from("podcasts")
            .select("*", { count: "exact", head: true })
            .eq("series_id", s.id);
          return { ...s, episode_count: count || 0 };
        })
      );

      setSeries(seriesWithCounts);
    } catch (error: any) {
      console.error("Error fetching series:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPodcasts(false);
    await fetchSeries();
  };

  const playPodcast = async (podcast: Podcast) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      if (playingId === podcast.id && isPlaying) {
        setIsPlaying(false);
        setPlayingId(null);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: podcast.audio_url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setPlayingId(podcast.id);
      setIsPlaying(true);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to play podcast",
      });
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setPlayingId(null);
        setIsPlaying(false);
      }
    }
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setAudioFile({
          uri: result.assets[0].uri,
          name: result.assets[0].name,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick audio file",
      });
    }
  };

  const pickVideoFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setVideoFile({
          uri: result.assets[0].uri,
          name: result.assets[0].name,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick video file",
      });
    }
  };

  const pickThumbnail = async (type: "series" | "episode") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (type === "series") {
          setSeriesThumbnail(result.assets[0].uri);
        } else {
          setEpisodeThumbnail(result.assets[0].uri);
        }
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick image",
      });
    }
  };

  const handleCreateSeries = async () => {
    if (!currentUser) {
      Toast.show({
        type: "info",
        text1: "Sign In Required",
        text2: "Please sign in to create series",
      });
      return;
    }

    if (!newSeries.title) {
      Toast.show({
        type: "error",
        text1: "Missing Title",
        text2: "Please enter a series title",
      });
      return;
    }

    setCreatingSeries(true);
    try {
      let thumbnailUrl = null;

      // Upload thumbnail if provided
      if (seriesThumbnail) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const response = await fetch(seriesThumbnail);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from("podcasts")
          .upload(`thumbnails/${fileName}`, blob);

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("podcasts").getPublicUrl(`thumbnails/${fileName}`);
          thumbnailUrl = publicUrl;
        }
      }

      // Create series
      const { error } = await supabase.from("podcast_series").insert({
        title: newSeries.title,
        description: newSeries.description || null,
        category: newSeries.category,
        thumbnail_url: thumbnailUrl,
        user_id: currentUser.id,
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Series created successfully",
      });

      // Reset form
      setNewSeries({ title: "", description: "", category: "Education" });
      setSeriesThumbnail(null);
      setShowCreateSeries(false);
      await fetchSeries();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to create series",
      });
    } finally {
      setCreatingSeries(false);
    }
  };

  const handleUploadEpisode = async () => {
    if (!currentUser) {
      Toast.show({
        type: "info",
        text1: "Sign In Required",
        text2: "Please sign in to upload episodes",
      });
      return;
    }

    if (!newEpisode.title || (mediaType === "audio" && !audioFile) || (mediaType === "video" && !videoFile)) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: `Please provide title and ${mediaType} file`,
      });
      return;
    }

    if (uploadType === "series" && !selectedSeriesId) {
      Toast.show({
        type: "error",
        text1: "No Series Selected",
        text2: "Please select a series",
      });
      return;
    }

    setUploading(true);
    try {
      let audioUrl = null;
      let videoUrl = null;

      // Upload media file based on type
      if (mediaType === "audio" && audioFile) {
        const audioFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
        const audioResponse = await fetch(audioFile.uri);
        const audioBlob = await audioResponse.blob();

        const { error: audioUploadError } = await supabase.storage
          .from("podcasts")
          .upload(`audio/${audioFileName}`, audioBlob);

        if (audioUploadError) throw audioUploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("podcasts").getPublicUrl(`audio/${audioFileName}`);
        audioUrl = publicUrl;
      } else if (mediaType === "video" && videoFile) {
        const videoFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`;
        const videoResponse = await fetch(videoFile.uri);
        const videoBlob = await videoResponse.blob();

        const { error: videoUploadError } = await supabase.storage
          .from("podcasts")
          .upload(`videos/${videoFileName}`, videoBlob);

        if (videoUploadError) throw videoUploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("podcasts").getPublicUrl(`videos/${videoFileName}`);
        videoUrl = publicUrl;
      }

      // Upload thumbnail if provided, or use video URL as thumbnail for videos
      let thumbnailUrl = null;
      if (episodeThumbnail) {
        const thumbFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const thumbResponse = await fetch(episodeThumbnail);
        const thumbBlob = await thumbResponse.blob();

        const { error: thumbUploadError } = await supabase.storage
          .from("podcasts")
          .upload(`thumbnails/${thumbFileName}`, thumbBlob);

        if (!thumbUploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("podcasts").getPublicUrl(`thumbnails/${thumbFileName}`);
          thumbnailUrl = publicUrl;
        }
      } else if (mediaType === "video" && videoUrl) {
        // For videos without custom thumbnail, use video URL (player will show first frame)
        thumbnailUrl = videoUrl;
      }

      // Create podcast episode
      const { error } = await supabase.from("podcasts").insert({
        title: newEpisode.title,
        description: newEpisode.description || null,
        host_name: newEpisode.host || "Anonymous",
        category: newEpisode.category,
        duration: newEpisode.duration ? parseInt(newEpisode.duration) : null,
        media_type: mediaType,
        audio_url: audioUrl,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        user_id: currentUser.id,
        series_id: uploadType === "series" ? selectedSeriesId : null,
        episode_number: newEpisode.episodeNumber ? parseInt(newEpisode.episodeNumber) : null,
        season_number: newEpisode.seasonNumber ? parseInt(newEpisode.seasonNumber) : null,
        release_date: new Date().toISOString(),
        featured: false,
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Episode uploaded successfully",
      });

      // Reset form
      setNewEpisode({
        title: "",
        description: "",
        host: "",
        category: "Education",
        duration: "",
        episodeNumber: "",
        seasonNumber: "",
      });
      setMediaType("audio");
      setAudioFile(null);
      setVideoFile(null);
      setEpisodeThumbnail(null);
      setShowUploadEpisode(false);
      await fetchPodcasts(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to upload episode",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSeriesPress = async (seriesItem: Series) => {
    setSelectedSeries(seriesItem);
    try {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("series_id", seriesItem.id)
        .order("season_number", { ascending: true })
        .order("episode_number", { ascending: true });

      if (error) throw error;
      setSeriesEpisodes(data || []);
      setShowSeriesDetail(true);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load series episodes",
      });
    }
  };

  const handleEpisodePress = async (episode: Podcast) => {
    setSelectedEpisode(episode);
    await fetchEpisodeRatings(episode.id);
    await fetchEpisodeComments(episode.id);
    await fetchUserRating(episode.id);
    setShowEpisodeDetail(true);
  };

  const fetchEpisodeRatings = async (podcastId: string) => {
    try {
      const { data, error } = await supabase
        .from("podcast_ratings")
        .select("*, user:profiles(full_name)")
        .eq("podcast_id", podcastId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEpisodeRatings(data || []);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const fetchEpisodeComments = async (podcastId: string) => {
    try {
      const { data, error } = await supabase
        .from("podcast_comments")
        .select("*, user:profiles(full_name, avatar_url)")
        .eq("podcast_id", podcastId)
        .is("parent_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from("podcast_comments")
            .select("*, user:profiles(full_name, avatar_url)")
            .eq("parent_id", comment.id)
            .order("created_at", { ascending: true });
          return { ...comment, replies: replies || [] };
        })
      );

      setEpisodeComments(commentsWithReplies);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchUserRating = async (podcastId: string) => {
    if (!currentUser) return;
    try {
      const { data } = await supabase
        .from("podcast_ratings")
        .select("rating")
        .eq("podcast_id", podcastId)
        .eq("user_id", currentUser.id)
        .single();

      setUserRating(data?.rating || 0);
    } catch (error) {
      setUserRating(0);
    }
  };

  const handleRating = async (rating: number) => {
    if (!currentUser) {
      Toast.show({
        type: "info",
        text1: "Sign In Required",
        text2: "Please sign in to rate episodes",
      });
      return;
    }

    if (!selectedEpisode) return;

    try {
      const { error } = await supabase.from("podcast_ratings").upsert({
        podcast_id: selectedEpisode.id,
        user_id: currentUser.id,
        rating,
      });

      if (error) throw error;

      setUserRating(rating);
      await fetchEpisodeRatings(selectedEpisode.id);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Rating submitted",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to submit rating",
      });
    }
  };

  const handlePostComment = async () => {
    if (!currentUser) {
      Toast.show({
        type: "info",
        text1: "Sign In Required",
        text2: "Please sign in to comment",
      });
      return;
    }

    if (!selectedEpisode || !newComment.trim()) return;

    try {
      const { error } = await supabase.from("podcast_comments").insert({
        podcast_id: selectedEpisode.id,
        user_id: currentUser.id,
        content: newComment.trim(),
        parent_id: replyingTo,
      });

      if (error) throw error;

      setNewComment("");
      setReplyingTo(null);
      await fetchEpisodeComments(selectedEpisode.id);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Comment posted",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to post comment",
      });
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) {
      Toast.show({
        type: "info",
        text1: "Sign In Required",
        text2: "Please sign in to like comments",
      });
      return;
    }

    const isLiked = likedComments.has(commentId);

    try {
      if (isLiked) {
        await supabase
          .from("podcast_comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", currentUser.id);

        setLikedComments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      } else {
        await supabase.from("podcast_comment_likes").insert({
          comment_id: commentId,
          user_id: currentUser.id,
        });

        setLikedComments((prev) => new Set(prev).add(commentId));
      }

      if (selectedEpisode) {
        await fetchEpisodeComments(selectedEpisode.id);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update like",
      });
    }
  };

  const filteredPodcasts = podcasts.filter((podcast) => {
    const matchesSearch =
      podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.host_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All Episodes" || podcast.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredSeries = series.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myPodcasts = podcasts.filter((p) => p.user_id === currentUser?.id && !p.series_id);
  const mySeries = series.filter((s) => s.user_id === currentUser?.id);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const renderPodcast = ({ item }: { item: Podcast }) => {
    const isCurrentlyPlaying = playingId === item.id && isPlaying;

    return (
      <TouchableOpacity
        className="bg-surface rounded-2xl p-4 mb-4 border border-border"
        onPress={() => router.push(`/podcast-episode?id=${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View className="flex-row">
          {item.thumbnail_url ? (
            <Image
              source={{ uri: item.thumbnail_url }}
              className="w-20 h-20 rounded-xl mr-4"
              contentFit="cover"
            />
          ) : (
            <View className="w-20 h-20 rounded-xl mr-4 bg-primary/20 items-center justify-center">
              <IconSymbol name="mic.fill" size={32} color={colors.primary} />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground mb-1" numberOfLines={2}>
              {item.title}
            </Text>
            <Text className="text-sm text-muted mb-2">{item.host_name}</Text>
            <View className="flex-row items-center gap-3 mb-2">
              <View
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <Text className="text-xs font-medium" style={{ color: colors.primary }}>
                  {item.category}
                </Text>
              </View>
              {item.duration && (
                <Text className="text-xs text-muted">{item.duration}</Text>
              )}
              {item.episode_number && (
                <Text className="text-xs text-muted">Ep. {item.episode_number}</Text>
              )}
            </View>
            {/* Engagement Stats */}
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1">
                <IconSymbol name="eye.fill" size={14} color={colors.muted} />
                <Text className="text-xs text-muted">{item.views_count || 0}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <IconSymbol name="heart.fill" size={14} color={colors.muted} />
                <Text className="text-xs text-muted">{item.likes_count || 0}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <IconSymbol name="bubble.left.fill" size={14} color={colors.muted} />
                <Text className="text-xs text-muted">{item.comments_count || 0}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => playPodcast(item)}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <IconSymbol
              name={isCurrentlyPlaying ? "pause.fill" : "play.fill"}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
        {isCurrentlyPlaying && duration > 0 && (
          <View className="mt-3">
            <View className="h-1 bg-border rounded-full overflow-hidden">
              <View
                className="h-full bg-primary"
                style={{ width: `${(currentPosition / duration) * 100}%` }}
              />
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-xs text-muted">{formatDuration(currentPosition)}</Text>
              <Text className="text-xs text-muted">{formatDuration(duration)}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSeries = ({ item }: { item: Series }) => (
    <TouchableOpacity
      className="bg-surface rounded-2xl p-4 mb-4 border border-border"
      onPress={() => handleSeriesPress(item)}
      activeOpacity={0.7}
    >
      <View className="flex-row">
        {item.thumbnail_url ? (
          <Image
            source={{ uri: item.thumbnail_url }}
            className="w-24 h-24 rounded-xl mr-4"
            contentFit="cover"
          />
        ) : (
          <View className="w-24 h-24 rounded-xl mr-4 bg-primary/20 items-center justify-center">
            <IconSymbol name="music.note.list" size={40} color={colors.primary} />
          </View>
        )}
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground mb-1" numberOfLines={2}>
            {item.title}
          </Text>
          {item.description && (
            <Text className="text-sm text-muted mb-2" numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View className="flex-row items-center gap-3">
            <View
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <Text className="text-xs font-medium" style={{ color: colors.primary }}>
                {item.category}
              </Text>
            </View>
            <Text className="text-xs text-muted">{item.episode_count || 0} episodes</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1 ml-4">
              <Text className="text-2xl font-bold text-foreground">Student Podcasts</Text>
              <Text className="text-sm text-muted">Listen & share knowledge</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowUploadEpisode(true)}
              className="bg-primary px-4 py-2 rounded-full"
            >
              <Text className="text-white text-sm font-semibold">Upload</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="flex-row items-center gap-3 rounded-2xl px-4 py-3 bg-surface border border-border mb-3">
            <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search podcasts or series..."
              placeholderTextColor={colors.muted}
              className="flex-1 text-foreground text-base"
            />
          </View>
        </View>

        {/* View Tabs */}
        <View className="border-b border-border">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            {[
              { key: "episodes" as const, label: "Episodes" },
              { key: "series" as const, label: "Series" },
              { key: "myseries" as const, label: "My Content" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveView(tab.key)}
                className="mr-6 pb-3"
                style={{
                  borderBottomWidth: 2,
                  borderBottomColor: activeView === tab.key ? colors.primary : "transparent",
                }}
              >
                <Text
                  className="font-semibold text-base"
                  style={{ color: activeView === tab.key ? colors.primary : colors.muted }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        {activeView === "episodes" && (
          <View className="py-3">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full ${
                    activeCategory === category ? "bg-primary" : "bg-surface"
                  }`}
                  style={{
                    borderWidth: 1,
                    borderColor: activeCategory === category ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    className={`text-sm font-medium ${
                      activeCategory === category ? "text-white" : "text-foreground"
                    }`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Content */}
        <View className="flex-1">
          {activeView === "episodes" && (
            <FlatList
              data={filteredPodcasts}
              renderItem={renderPodcast}
              keyExtractor={(item) => item.id}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={
                <View className="items-center justify-center py-12">
                  <IconSymbol name="mic.fill" size={48} color={colors.muted} />
                  <Text className="text-muted text-center mt-4">
                    {loading ? "Loading podcasts..." : "No podcasts found"}
                  </Text>
                </View>
              }
              contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            />
          )}

          {activeView === "series" && (
            <View className="flex-1">
              <View className="px-4 py-3 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">All Series</Text>
                <TouchableOpacity
                  onPress={() => setShowCreateSeries(true)}
                  className="bg-primary px-4 py-2 rounded-full"
                >
                  <Text className="text-white text-sm font-semibold">Create Series</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={filteredSeries}
                renderItem={renderSeries}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                  <View className="items-center justify-center py-12">
                    <IconSymbol name="music.note.list" size={48} color={colors.muted} />
                    <Text className="text-muted text-center mt-4">No series found</Text>
                  </View>
                }
                contentContainerStyle={{ padding: 16, flexGrow: 1 }}
              />
            </View>
          )}

          {activeView === "myseries" && (
            <ScrollView
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              contentContainerStyle={{ padding: 16 }}
            >
              <View className="mb-6">
                <Text className="text-lg font-semibold text-foreground mb-3">My Series</Text>
                {mySeries.length > 0 ? (
                  mySeries.map((item) => (
                    <View key={item.id} className="mb-4">
                      {renderSeries({ item })}
                    </View>
                  ))
                ) : (
                  <View className="bg-surface rounded-2xl p-6 items-center border border-border">
                    <IconSymbol name="music.note.list" size={40} color={colors.muted} />
                    <Text className="text-muted text-center mt-2">No series yet</Text>
                    <TouchableOpacity
                      onPress={() => setShowCreateSeries(true)}
                      className="bg-primary px-4 py-2 rounded-full mt-4"
                    >
                      <Text className="text-white text-sm font-semibold">Create Series</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View>
                <Text className="text-lg font-semibold text-foreground mb-3">
                  My Standalone Episodes
                </Text>
                {myPodcasts.length > 0 ? (
                  myPodcasts.map((item) => (
                    <View key={item.id} className="mb-4">
                      {renderPodcast({ item })}
                    </View>
                  ))
                ) : (
                  <View className="bg-surface rounded-2xl p-6 items-center border border-border">
                    <IconSymbol name="mic.fill" size={40} color={colors.muted} />
                    <Text className="text-muted text-center mt-2">No episodes yet</Text>
                    <TouchableOpacity
                      onPress={() => setShowUploadEpisode(true)}
                      className="bg-primary px-4 py-2 rounded-full mt-4"
                    >
                      <Text className="text-white text-sm font-semibold">Upload Episode</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>

      {/* Create Series Modal */}
      <Modal
        visible={showCreateSeries}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateSeries(false)}
      >
        <ScreenContainer>
          <View className="flex-1 p-4">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">Create Series</Text>
              <TouchableOpacity onPress={() => setShowCreateSeries(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Series Title *</Text>
                  <TextInput
                    value={newSeries.title}
                    onChangeText={(text) => setNewSeries({ ...newSeries, title: text })}
                    placeholder="e.g., Tech Talks with Students"
                    placeholderTextColor={colors.muted}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Description</Text>
                  <TextInput
                    value={newSeries.description}
                    onChangeText={(text) => setNewSeries({ ...newSeries, description: text })}
                    placeholder="Describe your series..."
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                    {CATEGORIES.filter((c) => c !== "All Episodes").map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setNewSeries({ ...newSeries, category: cat })}
                        className={`px-4 py-2 rounded-full ${
                          newSeries.category === cat ? "bg-primary" : "bg-surface"
                        }`}
                        style={{ borderWidth: 1, borderColor: colors.border }}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            newSeries.category === cat ? "text-white" : "text-foreground"
                          }`}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Thumbnail</Text>
                  <TouchableOpacity
                    onPress={() => pickThumbnail("series")}
                    className="bg-surface border border-border rounded-xl p-4 items-center justify-center"
                    style={{ minHeight: 100 }}
                  >
                    {seriesThumbnail ? (
                      <Image
                        source={{ uri: seriesThumbnail }}
                        className="w-full h-32 rounded-xl"
                        contentFit="cover"
                      />
                    ) : (
                      <>
                        <IconSymbol name="photo.fill" size={32} color={colors.primary} />
                        <Text className="text-sm text-primary mt-2">Tap to select thumbnail (optional)</Text>
                        {mediaType === "video" && (
                          <Text className="text-xs text-muted mt-1">Video thumbnail will be used if not provided</Text>
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleCreateSeries}
              disabled={creatingSeries}
              className="bg-primary rounded-xl py-4 items-center mt-4"
              style={{ opacity: creatingSeries ? 0.5 : 1 }}
            >
              <Text className="text-white font-semibold text-base">
                {creatingSeries ? "Creating..." : "Create Series"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScreenContainer>
      </Modal>

      {/* Upload Episode Modal */}
      <Modal
        visible={showUploadEpisode}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUploadEpisode(false)}
      >
        <ScreenContainer>
          <View className="flex-1 p-4">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">Upload Episode</Text>
              <TouchableOpacity onPress={() => setShowUploadEpisode(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                {/* Upload Type */}
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Episode Type</Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => setUploadType("standalone")}
                      className={`flex-1 px-4 py-3 rounded-xl ${
                        uploadType === "standalone" ? "bg-primary" : "bg-surface"
                      }`}
                      style={{ borderWidth: 1, borderColor: colors.border }}
                    >
                      <Text
                        className={`text-center font-medium ${
                          uploadType === "standalone" ? "text-white" : "text-foreground"
                        }`}
                      >
                        Standalone
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setUploadType("series")}
                      className={`flex-1 px-4 py-3 rounded-xl ${
                        uploadType === "series" ? "bg-primary" : "bg-surface"
                      }`}
                      style={{ borderWidth: 1, borderColor: colors.border }}
                    >
                      <Text
                        className={`text-center font-medium ${
                          uploadType === "series" ? "text-white" : "text-foreground"
                        }`}
                      >
                        Series Episode
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Series Selection */}
                {uploadType === "series" && (
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">Select Series *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                      {mySeries.map((s) => (
                        <TouchableOpacity
                          key={s.id}
                          onPress={() => setSelectedSeriesId(s.id)}
                          className={`px-4 py-2 rounded-full ${
                            selectedSeriesId === s.id ? "bg-primary" : "bg-surface"
                          }`}
                          style={{ borderWidth: 1, borderColor: colors.border }}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              selectedSeriesId === s.id ? "text-white" : "text-foreground"
                            }`}
                          >
                            {s.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    {mySeries.length === 0 && (
                      <Text className="text-sm text-muted mt-2">
                        No series yet. Create one first!
                      </Text>
                    )}
                  </View>
                )}

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Episode Title *</Text>
                  <TextInput
                    value={newEpisode.title}
                    onChangeText={(text) => setNewEpisode({ ...newEpisode, title: text })}
                    placeholder="e.g., Introduction to React Native"
                    placeholderTextColor={colors.muted}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Host Name</Text>
                  <TextInput
                    value={newEpisode.host}
                    onChangeText={(text) => setNewEpisode({ ...newEpisode, host: text })}
                    placeholder="Your name"
                    placeholderTextColor={colors.muted}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Description</Text>
                  <TextInput
                    value={newEpisode.description}
                    onChangeText={(text) => setNewEpisode({ ...newEpisode, description: text })}
                    placeholder="Describe your episode..."
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                    {CATEGORIES.filter((c) => c !== "All Episodes").map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setNewEpisode({ ...newEpisode, category: cat })}
                        className={`px-4 py-2 rounded-full ${
                          newEpisode.category === cat ? "bg-primary" : "bg-surface"
                        }`}
                        style={{ borderWidth: 1, borderColor: colors.border }}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            newEpisode.category === cat ? "text-white" : "text-foreground"
                          }`}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground mb-2">Duration</Text>
                    <TextInput
                      value={newEpisode.duration}
                      onChangeText={(text) => setNewEpisode({ ...newEpisode, duration: text })}
                      placeholder="e.g., 45:30"
                      placeholderTextColor={colors.muted}
                      className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                    />
                  </View>
                  {uploadType === "series" && (
                    <>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground mb-2">Episode #</Text>
                        <TextInput
                          value={newEpisode.episodeNumber}
                          onChangeText={(text) =>
                            setNewEpisode({ ...newEpisode, episodeNumber: text })
                          }
                          placeholder="1"
                          keyboardType="numeric"
                          placeholderTextColor={colors.muted}
                          className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground mb-2">Season #</Text>
                        <TextInput
                          value={newEpisode.seasonNumber}
                          onChangeText={(text) =>
                            setNewEpisode({ ...newEpisode, seasonNumber: text })
                          }
                          placeholder="1"
                          keyboardType="numeric"
                          placeholderTextColor={colors.muted}
                          className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                        />
                      </View>
                    </>
                  )}
                </View>

                {/* Media Type Selection */}
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Media Type *</Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => {
                        setMediaType("audio");
                        setVideoFile(null);
                      }}
                      className={`flex-1 px-4 py-3 rounded-xl ${
                        mediaType === "audio" ? "bg-primary" : "bg-surface"
                      }`}
                      style={{ borderWidth: 1, borderColor: colors.border }}
                    >
                      <View className="items-center">
                        <IconSymbol name="waveform" size={24} color={mediaType === "audio" ? "white" : colors.foreground} />
                        <Text
                          className={`text-center font-medium mt-1 ${
                            mediaType === "audio" ? "text-white" : "text-foreground"
                          }`}
                        >
                          Audio
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setMediaType("video");
                        setAudioFile(null);
                      }}
                      className={`flex-1 px-4 py-3 rounded-xl ${
                        mediaType === "video" ? "bg-primary" : "bg-surface"
                      }`}
                      style={{ borderWidth: 1, borderColor: colors.border }}
                    >
                      <View className="items-center">
                        <IconSymbol name="video.fill" size={24} color={mediaType === "video" ? "white" : colors.foreground} />
                        <Text
                          className={`text-center font-medium mt-1 ${
                            mediaType === "video" ? "text-white" : "text-foreground"
                          }`}
                        >
                          Video
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Media File Picker */}
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    {mediaType === "audio" ? "Audio" : "Video"} File *
                  </Text>
                  <TouchableOpacity
                    onPress={mediaType === "audio" ? pickAudio : pickVideoFile}
                    className="bg-surface border border-border rounded-xl p-4 items-center justify-center"
                    style={{ minHeight: 80 }}
                  >
                    <IconSymbol 
                      name={mediaType === "audio" ? "waveform" : "video.fill"} 
                      size={32} 
                      color={colors.primary} 
                    />
                    <Text className="text-sm text-primary mt-2">
                      {mediaType === "audio" 
                        ? (audioFile ? audioFile.name : "Tap to select audio file")
                        : (videoFile ? videoFile.name : "Tap to select video file")
                      }
                    </Text>
                  </TouchableOpacity>
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Thumbnail</Text>
                  <TouchableOpacity
                    onPress={() => pickThumbnail("episode")}
                    className="bg-surface border border-border rounded-xl p-4 items-center justify-center"
                    style={{ minHeight: 100 }}
                  >
                    {episodeThumbnail ? (
                      <Image
                        source={{ uri: episodeThumbnail }}
                        className="w-full h-32 rounded-xl"
                        contentFit="cover"
                      />
                    ) : (
                      <>
                        <IconSymbol name="photo.fill" size={32} color={colors.primary} />
                        <Text className="text-sm text-primary mt-2">Tap to select thumbnail (optional)</Text>
                        {mediaType === "video" && (
                          <Text className="text-xs text-muted mt-1">Video thumbnail will be used if not provided</Text>
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleUploadEpisode}
              disabled={uploading}
              className="bg-primary rounded-xl py-4 items-center mt-4"
              style={{ opacity: uploading ? 0.5 : 1 }}
            >
              <Text className="text-white font-semibold text-base">
                {uploading ? "Uploading..." : "Upload Episode"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScreenContainer>
      </Modal>

      {/* Series Detail Modal */}
      <Modal
        visible={showSeriesDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSeriesDetail(false)}
      >
        {selectedSeries && (
          <ScreenContainer>
            <View className="flex-1">
              <View className="flex-row items-center justify-between p-4 border-b border-border">
                <TouchableOpacity onPress={() => setShowSeriesDetail(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-foreground">Series Details</Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView className="flex-1">
                {/* Series Header */}
                <View className="p-4">
                  {selectedSeries.thumbnail_url ? (
                    <Image
                      source={{ uri: selectedSeries.thumbnail_url }}
                      className="w-full h-48 rounded-2xl mb-4"
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-full h-48 rounded-2xl mb-4 bg-primary/20 items-center justify-center">
                      <IconSymbol name="music.note.list" size={64} color={colors.primary} />
                    </View>
                  )}
                  <Text className="text-2xl font-bold text-foreground mb-2">
                    {selectedSeries.title}
                  </Text>
                  {selectedSeries.description && (
                    <Text className="text-base text-muted mb-3">{selectedSeries.description}</Text>
                  )}
                  <View className="flex-row items-center gap-3">
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                        {selectedSeries.category}
                      </Text>
                    </View>
                    <Text className="text-sm text-muted">
                      {seriesEpisodes.length} episode{seriesEpisodes.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>

                {/* Episodes */}
                <View className="px-4 pb-4">
                  <Text className="text-lg font-semibold text-foreground mb-3">Episodes</Text>
                  {seriesEpisodes.length > 0 ? (
                    seriesEpisodes.map((episode) => (
                      <View key={episode.id} className="mb-4">
                        {renderPodcast({ item: episode })}
                      </View>
                    ))
                  ) : (
                    <View className="bg-surface rounded-2xl p-6 items-center border border-border">
                      <IconSymbol name="mic.fill" size={40} color={colors.muted} />
                      <Text className="text-muted text-center mt-2">No episodes yet</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </ScreenContainer>
        )}
      </Modal>

      {/* Episode Detail Modal */}
      <Modal
        visible={showEpisodeDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEpisodeDetail(false)}
      >
        {selectedEpisode && (
          <ScreenContainer>
            <View className="flex-1">
              <View className="flex-row items-center justify-between p-4 border-b border-border">
                <TouchableOpacity onPress={() => setShowEpisodeDetail(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-foreground">Episode Details</Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView className="flex-1">
                {/* Episode Header */}
                <View className="p-4 border-b border-border">
                  {selectedEpisode.thumbnail_url ? (
                    <Image
                      source={{ uri: selectedEpisode.thumbnail_url }}
                      className="w-full h-48 rounded-2xl mb-4"
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-full h-48 rounded-2xl mb-4 bg-primary/20 items-center justify-center">
                      <IconSymbol name="mic.fill" size={64} color={colors.primary} />
                    </View>
                  )}
                  <Text className="text-2xl font-bold text-foreground mb-2">
                    {selectedEpisode.title}
                  </Text>
                  <Text className="text-base text-muted mb-3">{selectedEpisode.host_name}</Text>
                  {selectedEpisode.description && (
                    <Text className="text-sm text-foreground leading-relaxed">
                      {selectedEpisode.description}
                    </Text>
                  )}
                </View>

                {/* Ratings Section */}
                <View className="p-4 border-b border-border">
                  <Text className="text-lg font-semibold text-foreground mb-3">Ratings</Text>
                  
                  {/* Average Rating */}
                  {episodeRatings.length > 0 && (
                    <View className="flex-row items-center mb-4">
                      <Text className="text-4xl font-bold text-foreground mr-2">
                        {(episodeRatings.reduce((sum, r) => sum + r.rating, 0) / episodeRatings.length).toFixed(1)}
                      </Text>
                      <View>
                        <View className="flex-row">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <IconSymbol
                              key={star}
                              name="star.fill"
                              size={16}
                              color={star <= (episodeRatings.reduce((sum, r) => sum + r.rating, 0) / episodeRatings.length) ? "#FFD700" : colors.border}
                            />
                          ))}
                        </View>
                        <Text className="text-xs text-muted mt-1">
                          {episodeRatings.length} {episodeRatings.length === 1 ? "rating" : "ratings"}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Your Rating */}
                  <Text className="text-sm font-medium text-foreground mb-2">Your Rating</Text>
                  <View className="flex-row gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                        <IconSymbol
                          name="star.fill"
                          size={32}
                          color={star <= userRating ? "#FFD700" : colors.border}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* All Ratings */}
                  {episodeRatings.length > 0 && (
                    <View>
                      <Text className="text-sm font-medium text-foreground mb-2">All Ratings</Text>
                      {episodeRatings.slice(0, 5).map((rating) => (
                        <View key={rating.id} className="flex-row items-center mb-2">
                          <Text className="text-sm text-foreground flex-1">
                            {rating.user?.full_name || "Anonymous"}
                          </Text>
                          <View className="flex-row">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <IconSymbol
                                key={star}
                                name="star.fill"
                                size={12}
                                color={star <= rating.rating ? "#FFD700" : colors.border}
                              />
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Comments Section */}
                <View className="p-4">
                  <Text className="text-lg font-semibold text-foreground mb-3">Comments</Text>

                  {/* Post Comment */}
                  <View className="mb-4">
                    {replyingTo && (
                      <View className="flex-row items-center justify-between mb-2 p-2 bg-surface rounded-lg">
                        <Text className="text-xs text-muted">Replying to comment</Text>
                        <TouchableOpacity onPress={() => setReplyingTo(null)}>
                          <IconSymbol name="xmark" size={16} color={colors.muted} />
                        </TouchableOpacity>
                      </View>
                    )}
                    <View className="flex-row gap-2">
                      <TextInput
                        value={newComment}
                        onChangeText={setNewComment}
                        placeholder="Write a comment..."
                        placeholderTextColor={colors.muted}
                        className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                        multiline
                      />
                      <TouchableOpacity
                        onPress={handlePostComment}
                        disabled={!newComment.trim()}
                        className="bg-primary rounded-xl px-4 py-3 items-center justify-center"
                        style={{ opacity: newComment.trim() ? 1 : 0.5 }}
                      >
                        <IconSymbol name="paperplane.fill" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Comments List */}
                  {episodeComments.length === 0 ? (
                    <View className="py-8 items-center">
                      <Text className="text-muted text-center">No comments yet. Be the first to comment!</Text>
                    </View>
                  ) : (
                    episodeComments.map((comment) => (
                      <View key={comment.id} className="mb-4">
                        {/* Main Comment */}
                        <View className="bg-surface rounded-xl p-3">
                          <View className="flex-row items-start justify-between mb-2">
                            <View className="flex-1">
                              <Text className="text-sm font-semibold text-foreground">
                                {comment.user?.full_name || "Anonymous"}
                              </Text>
                              <Text className="text-xs text-muted">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-sm text-foreground mb-2">{comment.content}</Text>
                          <View className="flex-row items-center gap-4">
                            <TouchableOpacity
                              onPress={() => handleLikeComment(comment.id)}
                              className="flex-row items-center gap-1"
                            >
                              <IconSymbol
                                name="heart.fill"
                                size={16}
                                color={likedComments.has(comment.id) ? "#EF4444" : colors.muted}
                              />
                              <Text className="text-xs text-muted">{comment.likes_count || 0}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => setReplyingTo(comment.id)}
                              className="flex-row items-center gap-1"
                            >
                              <IconSymbol name="bubble.left" size={16} color={colors.muted} />
                              <Text className="text-xs text-muted">Reply</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <View className="ml-6 mt-2">
                            {comment.replies.map((reply) => (
                              <View key={reply.id} className="bg-surface rounded-xl p-3 mb-2">
                                <View className="flex-row items-start justify-between mb-2">
                                  <View className="flex-1">
                                    <Text className="text-sm font-semibold text-foreground">
                                      {reply.user?.full_name || "Anonymous"}
                                    </Text>
                                    <Text className="text-xs text-muted">
                                      {new Date(reply.created_at).toLocaleDateString()}
                                    </Text>
                                  </View>
                                </View>
                                <Text className="text-sm text-foreground mb-2">{reply.content}</Text>
                                <TouchableOpacity
                                  onPress={() => handleLikeComment(reply.id)}
                                  className="flex-row items-center gap-1"
                                >
                                  <IconSymbol
                                    name="heart.fill"
                                    size={16}
                                    color={likedComments.has(reply.id) ? "#EF4444" : colors.muted}
                                  />
                                  <Text className="text-xs text-muted">{reply.likes_count || 0}</Text>
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>
          </ScreenContainer>
        )}
      </Modal>
    </ScreenContainer>
  );
}
