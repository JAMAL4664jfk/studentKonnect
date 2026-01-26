import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/use-colors";

type TabType = "podcasts" | "campus-radio" | "radio-stations";

type PodcastItem = {
  id: string;
  title: string;
  host: string;
  image: any;
  duration: string;
  category: string;
};

type RadioStation = {
  id: string;
  name: string;
  frequency: string;
  genre: string;
  image: any;
  streamUrl?: string;
};

const PODCASTS: PodcastItem[] = [
  {
    id: "1",
    title: "Student Success Stories",
    host: "Campus Voices",
    image: require("@/assets/images/student-podcast-bg.jpg"),
    duration: "45 min",
    category: "Motivation",
  },
  {
    id: "2",
    title: "Study Tips & Tricks",
    host: "Academic Excellence",
    image: require("@/assets/images/hero-student-connect.jpg"),
    duration: "30 min",
    category: "Education",
  },
  {
    id: "3",
    title: "Career Insights",
    host: "Future Leaders",
    image: require("@/assets/images/career-innovation-hero.jpg"),
    duration: "50 min",
    category: "Career",
  },
];

const CAMPUS_RADIO: RadioStation[] = [
  {
    id: "1",
    name: "UCT Radio",
    frequency: "104.5 FM",
    genre: "Campus Mix",
    image: require("@/assets/images/student-podcast-bg.jpg"),
  },
  {
    id: "2",
    name: "Wits Radio Academy",
    frequency: "107.9 FM",
    genre: "Student Talk",
    image: require("@/assets/images/hero-student-connect.jpg"),
  },
  {
    id: "3",
    name: "UJ Campus Radio",
    frequency: "95.4 FM",
    genre: "Youth Culture",
    image: require("@/assets/images/lifestyle-rewards-banner.jpg"),
  },
];

const RADIO_STATIONS: RadioStation[] = [
  {
    id: "1",
    name: "Metro FM",
    frequency: "94.7 FM",
    genre: "Urban Contemporary",
    image: require("@/assets/images/student-podcast-bg.jpg"),
  },
  {
    id: "2",
    name: "5FM",
    frequency: "94.5 FM",
    genre: "Pop & Dance",
    image: require("@/assets/images/hero-student-connect.jpg"),
  },
  {
    id: "3",
    name: "Good Hope FM",
    frequency: "94.0 FM",
    genre: "Adult Contemporary",
    image: require("@/assets/images/lifestyle-rewards-banner.jpg"),
  },
  {
    id: "4",
    name: "Kaya FM",
    frequency: "95.9 FM",
    genre: "Urban Soul",
    image: require("@/assets/images/student-podcast-bg.jpg"),
  },
  {
    id: "5",
    name: "YFM",
    frequency: "99.2 FM",
    genre: "Youth & Hip Hop",
    image: require("@/assets/images/hero-student-connect.jpg"),
  },
];

export default function CampusEntertainmentScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("podcasts");

  const renderPodcasts = () => (
    <View className="gap-4">
      {PODCASTS.map((podcast) => (
        <TouchableOpacity
          key={podcast.id}
          className="rounded-2xl overflow-hidden border border-border active:opacity-80"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            height: 120,
          }}
        >
          <ImageBackground
            source={podcast.image}
            className="flex-1"
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.8)"]}
              className="flex-1 p-4 justify-between"
            >
              <View className="flex-row justify-between items-start">
                <View className="bg-purple-600 px-3 py-1 rounded-full">
                  <Text className="text-xs font-bold text-white">{podcast.category}</Text>
                </View>
                <View className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-white">{podcast.duration}</Text>
                </View>
              </View>
              <View>
                <Text className="text-xl font-bold text-white mb-1">{podcast.title}</Text>
                <Text className="text-sm text-white/90">{podcast.host}</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRadioStations = (stations: RadioStation[], title: string) => (
    <View className="gap-4">
      <Text className="text-lg font-semibold text-foreground">{title}</Text>
      {stations.map((station) => (
        <TouchableOpacity
          key={station.id}
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
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                <IconSymbol name="play.fill" size={24} color="white" />
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      ))}
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
          {activeTab === "podcasts" && renderPodcasts()}
          {activeTab === "campus-radio" && renderRadioStations(CAMPUS_RADIO, "Campus Radio Stations")}
          {activeTab === "radio-stations" && renderRadioStations(RADIO_STATIONS, "Live Radio Stations")}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
