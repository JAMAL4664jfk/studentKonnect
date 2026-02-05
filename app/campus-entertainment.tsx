import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";

type TabType = "podcasts" | "campus-radio" | "radio-stations" | "music" | "movies";

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

type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  image: string;
  audioUrl: string;
  duration: string;
};

type Movie = {
  id: string;
  title: string;
  year: string;
  genre: string;
  duration: string;
  rating: string;
  image: string;
  videoUrl: string;
  description: string;
};

const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "1",
    title: "Study Beats Vol. 1",
    artist: "Campus Collective",
    album: "Focus Music",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "3:45",
  },
  {
    id: "2",
    title: "Lofi Hip Hop Study Mix",
    artist: "Student Vibes",
    album: "Chill Sessions",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "4:12",
  },
  {
    id: "3",
    title: "Motivation Mix",
    artist: "Energy Boost",
    album: "Get Up & Go",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "3:30",
  },
  {
    id: "4",
    title: "Jazz for Studying",
    artist: "Campus Jazz Ensemble",
    album: "Smooth Study",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: "5:20",
  },
  {
    id: "5",
    title: "Afrobeats Study Session",
    artist: "African Rhythms",
    album: "Campus Vibes",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration: "4:05",
  },
];

const MOVIES: Movie[] = [
  {
    id: "1",
    title: "The Social Network",
    year: "2010",
    genre: "Biography, Drama",
    duration: "2h 0m",
    rating: "7.8/10",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    description: "The story of Facebook's founding and the lawsuits that followed.",
  },
  {
    id: "2",
    title: "Good Will Hunting",
    year: "1997",
    genre: "Drama",
    duration: "2h 6m",
    rating: "8.3/10",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    description: "A janitor at MIT has a gift for mathematics but needs help from a psychologist.",
  },
  {
    id: "3",
    title: "The Pursuit of Happyness",
    year: "2006",
    genre: "Biography, Drama",
    duration: "1h 57m",
    rating: "8.0/10",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    description: "A struggling salesman takes custody of his son as he's poised to begin a life-changing career.",
  },
  {
    id: "4",
    title: "Dead Poets Society",
    year: "1989",
    genre: "Drama",
    duration: "2h 8m",
    rating: "8.1/10",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    description: "An English teacher inspires his students to look at poetry with a different perspective.",
  },
  {
    id: "5",
    title: "Hidden Figures",
    year: "2016",
    genre: "Biography, Drama, History",
    duration: "2h 7m",
    rating: "7.8/10",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    description: "The story of African-American women mathematicians who worked at NASA.",
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
  const [activeTab, setActiveTab] = useState<TabType>("campus-radio");
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

  useEffect(() => {
    // Auto-navigate to full podcasts screen when podcasts tab is active
    if (activeTab === "podcasts") {
      router.push("/podcasts");
    }
  }, [activeTab]);

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

  const renderPodcastsTab = () => {
    // Directly navigate to full podcasts screen
    router.push("/podcasts");
    return null;
  };

  const playMusicTrack = async (track: MusicTrack) => {
    try {
      if (playingStationId === track.id && isPlaying) {
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
        }
        setIsPlaying(false);
        setPlayingStationId(null);
        return;
      }

      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      setIsLoading(true);

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: true, isLooping: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setPlayingStationId(track.id);
      setIsPlaying(true);

      Toast.show({
        type: "success",
        text1: "Now Playing",
        text2: `${track.title} - ${track.artist}`,
      });
    } catch (error: any) {
      console.error("Error playing music:", error);
      Toast.show({
        type: "error",
        text1: "Playback Error",
        text2: "Unable to play this track",
      });
      setIsPlaying(false);
      setPlayingStationId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMusicTab = () => (
    <View className="gap-4">
      <Text className="text-lg font-semibold text-foreground">Free Music Streaming</Text>
      {MUSIC_TRACKS.map((track) => {
        const isCurrentlyPlaying = playingStationId === track.id && isPlaying;
        const isCurrentlyLoading = playingStationId === track.id && isLoading;

        return (
          <TouchableOpacity
            key={track.id}
            onPress={() => playMusicTrack(track)}
            disabled={isLoading}
            className="bg-surface rounded-2xl overflow-hidden border border-border"
          >
            <View className="flex-row p-4">
              <Image
                source={{ uri: track.image }}
                className="w-20 h-20 rounded-xl"
                contentFit="cover"
              />
              <View className="flex-1 ml-4 justify-center">
                <Text className="text-base font-semibold text-foreground mb-1">
                  {track.title}
                </Text>
                <Text className="text-sm text-muted mb-1">{track.artist}</Text>
                <View className="flex-row items-center gap-2">
                  <View className="bg-primary/20 px-2 py-1 rounded-full">
                    <Text className="text-xs font-medium text-primary">{track.album}</Text>
                  </View>
                  <Text className="text-xs text-muted">{track.duration}</Text>
                </View>
              </View>
              <View className="justify-center">
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    isCurrentlyPlaying ? "bg-primary" : "bg-surface border border-border"
                  }`}
                >
                  {isCurrentlyLoading ? (
                    <IconSymbol name="arrow.clockwise" size={20} color={colors.primary} />
                  ) : (
                    <IconSymbol
                      name={isCurrentlyPlaying ? "pause.fill" : "play.fill"}
                      size={20}
                      color={isCurrentlyPlaying ? "white" : colors.primary}
                    />
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderMoviesTab = () => (
    <View className="gap-4">
      <Text className="text-lg font-semibold text-foreground">Free Educational Movies</Text>
      {MOVIES.map((movie) => (
        <TouchableOpacity
          key={movie.id}
          onPress={() => {
            Toast.show({
              type: "info",
              text1: "Opening Player",
              text2: `Loading ${movie.title}...`,
            });
            // In production, this would open a video player
          }}
          className="rounded-2xl overflow-hidden border border-border"
        >
          <ImageBackground
            source={{ uri: movie.image }}
            className="h-48"
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
              className="flex-1 p-4 justify-end"
            >
              <View className="flex-row items-center gap-2 mb-2">
                <View className="bg-primary px-3 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-white">{movie.rating}</Text>
                </View>
                <Text className="text-xs text-white/90">{movie.year}</Text>
                <Text className="text-xs text-white/90">•</Text>
                <Text className="text-xs text-white/90">{movie.duration}</Text>
              </View>
              <Text className="text-xl font-bold text-white mb-1">{movie.title}</Text>
              <Text className="text-sm text-white/80 mb-2">{movie.genre}</Text>
              <Text className="text-xs text-white/70" numberOfLines={2}>
                {movie.description}
              </Text>
            </LinearGradient>
          </ImageBackground>
          <View className="bg-surface p-3 flex-row items-center justify-center gap-2">
            <IconSymbol name="play.circle.fill" size={20} color={colors.primary} />
            <Text className="text-sm font-semibold text-primary">Watch Now</Text>
          </View>
        </TouchableOpacity>
      ))}
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
            <Text className="text-2xl font-bold text-foreground">Edutainment</Text>
            <Text className="text-sm text-muted">Podcasts, Radio, Music & Movies</Text>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setActiveTab("podcasts")}
              className={`px-6 py-3 rounded-xl ${
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
              className={`px-6 py-3 rounded-xl ${
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
              className={`px-6 py-3 rounded-xl ${
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
            <TouchableOpacity
              onPress={() => setActiveTab("music")}
              className={`px-6 py-3 rounded-xl ${
                activeTab === "music" ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "music" ? "text-white" : "text-foreground"
                }`}
              >
                Music
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("movies")}
              className={`px-6 py-3 rounded-xl ${
                activeTab === "movies" ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "movies" ? "text-white" : "text-foreground"
                }`}
              >
                Movies
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Content */}
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {activeTab === "podcasts" && renderPodcastsTab()}
          {activeTab === "campus-radio" && renderRadioStations(CAMPUS_RADIO, "Campus Radio Stations")}
          {activeTab === "radio-stations" && renderRadioStations(RADIO_STATIONS, "Live Radio Stations")}
          {activeTab === "music" && renderMusicTab()}
          {activeTab === "movies" && renderMoviesTab()}
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
