import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";

type TabType = "podcasts" | "campus-radio" | "radio-stations";

type RadioStation = {
  id: string;
  name: string;
  frequency: string;
  genre: string;
  image: any;
  streamUrl: string;
};

const CAMPUS_RADIO: RadioStation[] = [
  {
    id: "1",
    name: "UCT Radio",
    frequency: "104.5 FM",
    genre: "Campus Mix",
    image: require("@/assets/images/student-podcast-bg.jpg"),
    streamUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv", // Example stream
  },
  {
    id: "2",
    name: "Wits Radio Academy",
    frequency: "107.9 FM",
    genre: "Student Talk",
    image: require("@/assets/images/hero-student-connect.jpg"),
    streamUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv",
  },
  {
    id: "3",
    name: "UJ Campus Radio",
    frequency: "95.4 FM",
    genre: "Youth Culture",
    image: require("@/assets/images/lifestyle-rewards-banner.jpg"),
    streamUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv",
  },
];

const RADIO_STATIONS: RadioStation[] = [
  {
    id: "1",
    name: "Metro FM",
    frequency: "94.7 FM",
    genre: "Urban Contemporary",
    image: require("@/assets/images/student-podcast-bg.jpg"),
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FM.mp3",
  },
  {
    id: "2",
    name: "5FM",
    frequency: "94.5 FM",
    genre: "Pop & Dance",
    image: require("@/assets/images/hero-student-connect.jpg"),
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/5FM.mp3",
  },
  {
    id: "3",
    name: "Good Hope FM",
    frequency: "94.0 FM",
    genre: "Adult Contemporary",
    image: require("@/assets/images/lifestyle-rewards-banner.jpg"),
    streamUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv",
  },
  {
    id: "4",
    name: "Kaya FM",
    frequency: "95.9 FM",
    genre: "Urban Soul",
    image: require("@/assets/images/student-podcast-bg.jpg"),
    streamUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv",
  },
  {
    id: "5",
    name: "YFM",
    frequency: "99.2 FM",
    genre: "Youth & Hip Hop",
    image: require("@/assets/images/hero-student-connect.jpg"),
    streamUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv",
  },
];

export default function CampusEntertainmentScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("podcasts");
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingStationId, setPlayingStationId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playRadioStation = async (station: RadioStation) => {
    try {
      // If same station is playing, stop it
      if (playingStationId === station.id && isPlaying) {
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
        }
        setIsPlaying(false);
        setPlayingStationId(null);
        return;
      }

      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      setIsLoading(true);

      // Configure audio mode for streaming
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Create and play new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: station.streamUrl },
        { shouldPlay: true, isLooping: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setPlayingStationId(station.id);
      setIsPlaying(true);

      Toast.show({
        type: "success",
        text1: "Now Playing",
        text2: `${station.name} - ${station.frequency}`,
      });
    } catch (error: any) {
      console.error("Error playing radio:", error);
      Toast.show({
        type: "error",
        text1: "Playback Error",
        text2: "Unable to stream this station",
      });
      setIsPlaying(false);
      setPlayingStationId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setPlayingStationId(null);
        setIsPlaying(false);
      }
    } else if (status.error) {
      console.error("Playback error:", status.error);
      setIsPlaying(false);
      setPlayingStationId(null);
    }
  };

  const renderPodcastsTab = () => (
    <View className="gap-4">
      <View className="bg-surface rounded-2xl p-6 border border-border items-center">
        <IconSymbol name="mic.fill" size={48} color={colors.primary} />
        <Text className="text-xl font-bold text-foreground mt-4 mb-2">
          Student Podcasts
        </Text>
        <Text className="text-sm text-muted text-center mb-4">
          Listen to student podcasts, create your own series, and manage episodes
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/podcasts")}
          className="bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Open Podcasts</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-surface rounded-2xl p-4 border border-border">
        <Text className="text-base font-semibold text-foreground mb-2">Features:</Text>
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
            <Text className="text-sm text-foreground">Browse all podcast episodes</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
            <Text className="text-sm text-foreground">Create and manage your own series</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
            <Text className="text-sm text-foreground">Upload audio and video episodes</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
            <Text className="text-sm text-foreground">Rate and comment on episodes</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
            <Text className="text-sm text-foreground">Search by category and host</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderRadioStations = (stations: RadioStation[], title: string) => (
    <View className="gap-4">
      <Text className="text-lg font-semibold text-foreground">{title}</Text>
      {stations.map((station) => {
        const isCurrentlyPlaying = playingStationId === station.id && isPlaying;
        const isCurrentlyLoading = playingStationId === station.id && isLoading;

        return (
          <TouchableOpacity
            key={station.id}
            onPress={() => playRadioStation(station)}
            disabled={isLoading}
            className="rounded-2xl overflow-hidden border border-border active:opacity-80"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
              height: 100,
            }}
          >
            <ImageBackground
              source={station.image}
              className="flex-1"
              resizeMode="cover"
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.8)"]}
                className="flex-1 p-4 flex-row items-center justify-between"
              >
                <View className="flex-1">
                  <Text className="text-xl font-bold text-white mb-1">{station.name}</Text>
                  <Text className="text-sm text-white/90 mb-1">{station.frequency}</Text>
                  <View className="bg-white/20 px-3 py-1 rounded-full self-start">
                    <Text className="text-xs font-semibold text-white">{station.genre}</Text>
                  </View>
                </View>
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    isCurrentlyPlaying ? "bg-red-500" : "bg-white/20"
                  }`}
                >
                  {isCurrentlyLoading ? (
                    <IconSymbol name="arrow.clockwise" size={24} color="white" />
                  ) : (
                    <IconSymbol
                      name={isCurrentlyPlaying ? "stop.fill" : "play.fill"}
                      size={24}
                      color="white"
                    />
                  )}
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <ScreenContainer className="p-4" edges={["top", "left", "right"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Campus Entertainment</Text>
            <Text className="text-sm text-muted">Podcasts, Radio & Music</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2 mb-6">
          <TouchableOpacity
            onPress={() => setActiveTab("podcasts")}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === "podcasts" ? "bg-primary" : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "podcasts" ? "text-white" : "text-foreground"
              }`}
            >
              Podcasts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("campus-radio")}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === "campus-radio" ? "bg-primary" : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "campus-radio" ? "text-white" : "text-foreground"
              }`}
            >
              Campus Radio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("radio-stations")}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === "radio-stations" ? "bg-primary" : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "radio-stations" ? "text-white" : "text-foreground"
              }`}
            >
              Radio
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {activeTab === "podcasts" && renderPodcastsTab()}
          {activeTab === "campus-radio" && renderRadioStations(CAMPUS_RADIO, "Campus Radio Stations")}
          {activeTab === "radio-stations" && renderRadioStations(RADIO_STATIONS, "Live Radio Stations")}
        </ScrollView>

        {/* Now Playing Bar */}
        {isPlaying && playingStationId && (
          <View className="absolute bottom-0 left-0 right-0 bg-primary p-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm">Now Playing</Text>
              <Text className="text-white/80 text-xs">
                {[...CAMPUS_RADIO, ...RADIO_STATIONS].find((s) => s.id === playingStationId)?.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                const station = [...CAMPUS_RADIO, ...RADIO_STATIONS].find(
                  (s) => s.id === playingStationId
                );
                if (station) playRadioStation(station);
              }}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
            >
              <IconSymbol name="stop.fill" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
