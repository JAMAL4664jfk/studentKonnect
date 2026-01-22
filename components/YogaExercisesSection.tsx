import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { VideoView, useVideoPlayer } from "expo-video";

function VideoPlayer({ videoId }: { videoId: string }) {
  const player = useVideoPlayer(
    `https://www.youtube.com/watch?v=${videoId}`,
    (player) => {
      player.play();
    }
  );

  return (
    <VideoView
      player={player}
      style={{ flex: 1 }}
      allowsFullscreen
      allowsPictureInPicture
    />
  );
}

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  videos: Video[];
}

const categories: Category[] = [
  {
    id: "stress-relief",
    name: "Stress Relief Yoga",
    description: "Calm your mind and release tension",
    icon: "wind",
    gradient: "from-blue-500 to-cyan-400",
    videos: [
      {
        id: "1",
        title: "Yoga for Stress Relief",
        description: "15-minute session to reduce stress",
        youtubeId: "v7AYKMP6rOE",
        duration: "15 min",
      },
      {
        id: "2",
        title: "Deep Relaxation Flow",
        description: "Gentle yoga flow to unwind",
        youtubeId: "hJbRpHZr_d0",
        duration: "20 min",
      },
    ],
  },
  {
    id: "morning-routines",
    name: "Morning Routines",
    description: "Start your day with energy",
    icon: "sunrise.fill",
    gradient: "from-orange-500 to-yellow-400",
    videos: [
      {
        id: "6",
        title: "Morning Stretch Routine",
        description: "10-minute energizing stretches",
        youtubeId: "sTANio_2E0Q",
        duration: "10 min",
      },
      {
        id: "7",
        title: "Wake Up Yoga Flow",
        description: "Gentle flow to awaken your body",
        youtubeId: "UEEsdXn8oG8",
        duration: "12 min",
      },
    ],
  },
  {
    id: "study-tips",
    name: "Study Tips & Focus",
    description: "Maximize your study sessions",
    icon: "book.fill",
    gradient: "from-emerald-500 to-teal-400",
    videos: [
      {
        id: "11",
        title: "How to Study Effectively",
        description: "Science-backed study techniques",
        youtubeId: "IlU-zDU6aQ0",
        duration: "12 min",
      },
      {
        id: "12",
        title: "Focus Music for Studying",
        description: "Concentration-boosting music",
        youtubeId: "lTRiuFIWV54",
        duration: "180 min",
      },
    ],
  },
  {
    id: "financial-wellness",
    name: "Financial Wellness",
    description: "Money management tips",
    icon: "creditcard.fill",
    gradient: "from-green-500 to-lime-400",
    videos: [
      {
        id: "17",
        title: "Budgeting for Students",
        description: "Create and stick to a budget",
        youtubeId: "HQzoZfc3GwQ",
        duration: "12 min",
      },
      {
        id: "18",
        title: "Save Money as a Student",
        description: "Smart saving strategies",
        youtubeId: "dPo-sG8GGvI",
        duration: "10 min",
      },
    ],
  },
  {
    id: "mental-health",
    name: "Mental Health",
    description: "Support your emotional wellbeing",
    icon: "heart.fill",
    gradient: "from-pink-500 to-rose-400",
    videos: [
      {
        id: "22",
        title: "Managing Anxiety",
        description: "Techniques to cope with anxiety",
        youtubeId: "WWloIAQpMcQ",
        duration: "15 min",
      },
      {
        id: "23",
        title: "Building Self-Esteem",
        description: "Boost your confidence",
        youtubeId: "uOrzmFUJtrs",
        duration: "12 min",
      },
    ],
  },
  {
    id: "meditation",
    name: "Meditation & Mindfulness",
    description: "Improve concentration",
    icon: "brain",
    gradient: "from-purple-500 to-pink-400",
    videos: [
      {
        id: "33",
        title: "Meditation for Beginners",
        description: "Start your meditation journey",
        youtubeId: "U9YKY7fdwyg",
        duration: "10 min",
      },
      {
        id: "34",
        title: "Focus Meditation",
        description: "Improve concentration",
        youtubeId: "inpok4MKVLM",
        duration: "15 min",
      },
    ],
  },
  {
    id: "bedtime",
    name: "Bedtime & Sleep",
    description: "Relaxing routines for better sleep",
    icon: "moon.fill",
    gradient: "from-indigo-500 to-purple-400",
    videos: [
      {
        id: "38",
        title: "Bedtime Yoga",
        description: "Relaxing routine for sleep",
        youtubeId: "g_tea8ZNk5A",
        duration: "20 min",
      },
      {
        id: "39",
        title: "Sleep Meditation",
        description: "Drift off to peaceful sleep",
        youtubeId: "rvaqPPjtxng",
        duration: "30 min",
      },
    ],
  },
];

const getYoutubeThumbnail = (youtubeId: string) =>
  `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

export function YogaExercisesSection() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { width } = Dimensions.get("window");

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text className="text-2xl font-bold text-foreground mb-2">
          Wellness Videos
        </Text>
        <Text className="text-sm text-muted mb-6">
          Explore yoga, meditation, study tips, and mental health resources
        </Text>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category)}
            className="bg-surface rounded-2xl p-4 mb-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center gap-3 mb-2">
              <View className="bg-primary/10 rounded-full p-3">
                <IconSymbol name={category.icon as any} size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground">
                  {category.name}
                </Text>
                <Text className="text-sm text-muted">{category.description}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </View>
            <Text className="text-xs text-muted">
              {category.videos.length} videos available
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category Videos Modal */}
      <Modal
        visible={selectedCategory !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedCategory(null)}
      >
        <View className="flex-1 bg-background">
          <View
            className="flex-row items-center gap-3 px-4 py-3 border-b"
            style={{ borderBottomColor: colors.border }}
          >
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-lg font-bold text-foreground">
                {selectedCategory?.name}
              </Text>
              <Text className="text-xs text-muted">
                {selectedCategory?.videos.length} videos
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 py-4">
            {selectedCategory?.videos.map((video) => (
              <TouchableOpacity
                key={video.id}
                onPress={() => setSelectedVideo(video)}
                className="mb-4"
              >
                <View className="relative rounded-xl overflow-hidden">
                  <Image
                    source={{ uri: getYoutubeThumbnail(video.youtubeId) }}
                    style={{ width: "100%", height: 200 }}
                    contentFit="cover"
                  />
                  <View className="absolute inset-0 items-center justify-center bg-black/30">
                    <View className="bg-white/90 rounded-full p-4">
                      <IconSymbol name="play.fill" size={32} color="#000" />
                    </View>
                  </View>
                  <View className="absolute bottom-2 right-2 bg-black/70 rounded px-2 py-1">
                    <Text className="text-white text-xs font-semibold">
                      {video.duration}
                    </Text>
                  </View>
                </View>
                <Text className="text-base font-bold text-foreground mt-2">
                  {video.title}
                </Text>
                <Text className="text-sm text-muted">{video.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Video Player Modal */}
      <Modal
        visible={selectedVideo !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedVideo(null)}
      >
        <View className="flex-1 bg-black">
          <View className="flex-row items-center justify-between px-4 py-3 bg-black">
            <TouchableOpacity onPress={() => setSelectedVideo(null)}>
              <IconSymbol name="xmark" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-white font-semibold flex-1 ml-3">
              {selectedVideo?.title}
            </Text>
          </View>

          {selectedVideo && (
            <VideoPlayer videoId={selectedVideo.youtubeId} />
          )}
        </View>
      </Modal>
    </View>
  );
}
