import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, ActivityIndicator, TextInput, Modal, Linking, RefreshControl } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";
import { supabase, safeGetUser } from "@/lib/supabase";

type TabType = "podcasts" | "campus-radio" | "radio-stations" | "music" | "movies" | "news" | "events" | "lectures";

// ─── Campus Hub Types ────────────────────────────────────────────────────────
type CampusNews = {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url: string | null;
  category: string;
  author: string;
  published_at: string;
};

type CampusEvent = {
  id: string;
  title: string;
  description: string;
  full_description: string;
  image_url: string | null;
  event_date: string;
  end_date: string | null;
  location: string;
  category: string;
  organizer: string;
  capacity: number | null;
  registration_url: string | null;
  featured: boolean;
};

type Lecture = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  subject: string;
  duration: string;
  thumbnailUrl: string;
  downloadUrl: string;
};

const MOCK_LECTURES: Lecture[] = [
  { id: "1", title: "Business Management 101", description: "Introduction to business management principles covering leadership, strategy, and organizational behavior.", instructor: "Prof. Sarah Johnson", subject: "Business", duration: "1:45:30", thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", downloadUrl: "" },
  { id: "2", title: "Calculus and Analysis", description: "Advanced calculus covering derivatives, integrals, and mathematical analysis techniques.", instructor: "Dr. Michael Chen", subject: "Mathematics", duration: "2:15:20", thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400", downloadUrl: "" },
  { id: "3", title: "Programming Fundamentals", description: "Learn programming basics with Python including data structures, algorithms, and problem solving.", instructor: "Prof. David Park", subject: "Computer Science", duration: "1:30:45", thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400", downloadUrl: "" },
  { id: "4", title: "Introduction to Economics", description: "Economic principles, market dynamics, supply and demand, and macroeconomic theory.", instructor: "Dr. Amara Williams", subject: "Economics", duration: "1:55:10", thumbnailUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400", downloadUrl: "" },
  { id: "5", title: "Organic Chemistry Basics", description: "Fundamental concepts of organic chemistry including molecular structures and reactions.", instructor: "Prof. Lisa Nkosi", subject: "Chemistry", duration: "2:05:00", thumbnailUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400", downloadUrl: "" },
  { id: "6", title: "South African Constitutional Law", description: "Overview of the SA Constitution, Bill of Rights, and landmark court cases.", instructor: "Dr. James Dlamini", subject: "Law", duration: "1:40:15", thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400", downloadUrl: "" },
];

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
  const [activeTab, setActiveTab] = useState<TabType>("podcasts");
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingStationId, setPlayingStationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTabDropdown, setShowTabDropdown] = useState(false);

  // ─── Campus Hub State ───────────────────────────────────────────────────────
  const [campusNews, setCampusNews] = useState<CampusNews[]>([]);
  const [campusEvents, setCampusEvents] = useState<CampusEvent[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>(MOCK_LECTURES);
  const [campusLoading, setCampusLoading] = useState(false);
  const [campusRefreshing, setCampusRefreshing] = useState(false);
  const [newsSearch, setNewsSearch] = useState("");
  const [eventsSearch, setEventsSearch] = useState("");
  const [lecturesSearch, setLecturesSearch] = useState("");
  const [selectedNewsCategory, setSelectedNewsCategory] = useState("all");
  const [selectedEventsCategory, setSelectedEventsCategory] = useState("all");
  const [selectedLectureSubject, setSelectedLectureSubject] = useState("all");
  const [selectedNews, setSelectedNews] = useState<CampusNews | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [likedNews, setLikedNews] = useState<Set<string>>(new Set());
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

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
  }, [activeTab, router]);

  useEffect(() => {
    if (activeTab === "news" || activeTab === "events") {
      fetchCampusData();
    }
  }, [activeTab]);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (user) setUserId(user.id);
    } catch (e) {}
  };

  const fetchCampusData = async (isRefresh = false) => {
    if (isRefresh) setCampusRefreshing(true);
    else setCampusLoading(true);
    try {
      const [newsRes, eventsRes] = await Promise.all([
        supabase.from("campus_news").select("*").order("published_at", { ascending: false }),
        supabase.from("campus_events").select("*").order("event_date", { ascending: true }),
      ]);
      if (newsRes.data) setCampusNews(newsRes.data);
      if (eventsRes.data) setCampusEvents(eventsRes.data);
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to load campus content" });
    } finally {
      setCampusLoading(false);
      setCampusRefreshing(false);
    }
  };

  const toggleLike = async (contentType: "news" | "event", contentId: string) => {
    if (!userId) {
      Toast.show({ type: "info", text1: "Sign in required", text2: "Please sign in to like content" });
      return;
    }
    const likedSet = contentType === "news" ? likedNews : likedEvents;
    const setLiked = contentType === "news" ? setLikedNews : setLikedEvents;
    const isLiked = likedSet.has(contentId);
    try {
      if (isLiked) {
        await supabase.from("content_likes").delete().eq("user_id", userId).eq("content_type", contentType).eq("content_id", contentId);
        setLiked(prev => { const n = new Set(prev); n.delete(contentId); return n; });
      } else {
        await supabase.from("content_likes").insert({ user_id: userId, content_type: contentType, content_id: contentId });
        setLiked(prev => new Set([...prev, contentId]));
      }
    } catch (e) {}
  };

  const NEWS_CATEGORIES = ["all", "Academic", "Sports", "Arts", "Technology", "Social", "Wellness"];
  const EVENT_CATEGORIES = ["all", "Career", "Sports", "Technology", "Cultural", "Academic", "Community"];
  const LECTURE_SUBJECTS = ["all", "Business", "Mathematics", "Computer Science", "Economics", "Chemistry", "Law"];

  const filteredNews = campusNews.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(newsSearch.toLowerCase()) || n.summary.toLowerCase().includes(newsSearch.toLowerCase());
    const matchCat = selectedNewsCategory === "all" || n.category === selectedNewsCategory;
    return matchSearch && matchCat;
  });

  const filteredEvents = campusEvents.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(eventsSearch.toLowerCase()) || e.description.toLowerCase().includes(eventsSearch.toLowerCase());
    const matchCat = selectedEventsCategory === "all" || e.category === selectedEventsCategory;
    return matchSearch && matchCat;
  });

  const filteredLectures = lectures.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(lecturesSearch.toLowerCase()) || l.instructor.toLowerCase().includes(lecturesSearch.toLowerCase());
    const matchSubject = selectedLectureSubject === "all" || l.subject === selectedLectureSubject;
    return matchSearch && matchSubject;
  });

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const formatEventTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  // ─── Campus Hub Render Functions ────────────────────────────────────────────
  const renderNewsTab = () => (
    <View className="gap-4">
      {/* Search */}
      <View className="flex-row items-center bg-surface border border-border rounded-2xl px-4 py-3 gap-3">
        <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
        <TextInput
          value={newsSearch}
          onChangeText={setNewsSearch}
          placeholder="Search campus news..."
          placeholderTextColor={colors.muted}
          className="flex-1 text-foreground text-sm"
        />
      </View>
      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
        <View className="flex-row gap-2 px-1">
          {NEWS_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedNewsCategory(cat)}
              className={`px-4 py-2 rounded-full border ${
                selectedNewsCategory === cat ? "border-primary" : "border-border bg-surface"
              }`}
              style={selectedNewsCategory === cat ? { backgroundColor: colors.primary } : {}}
            >
              <Text className={`text-xs font-semibold capitalize ${
                selectedNewsCategory === cat ? "text-white" : "text-muted"
              }`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {/* News List */}
      {campusLoading ? (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted text-sm mt-3">Loading campus news...</Text>
        </View>
      ) : filteredNews.length === 0 ? (
        <View className="items-center py-12">
          <IconSymbol name="newspaper" size={48} color={colors.muted} />
          <Text className="text-muted text-base mt-3">No news found</Text>
        </View>
      ) : (
        filteredNews.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSelectedNews(item)}
            className="bg-surface rounded-3xl overflow-hidden border border-border active:opacity-80"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}
          >
            {item.image_url && (
              <Image
                source={{ uri: item.image_url }}
                style={{ width: "100%", height: 180 }}
                contentFit="cover"
              />
            )}
            <View className="p-4 gap-2">
              <View className="flex-row items-center gap-2">
                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary + "20" }}>
                  <Text className="text-xs font-bold" style={{ color: colors.primary }}>{item.category}</Text>
                </View>
                <Text className="text-xs text-muted">{timeAgo(item.published_at)}</Text>
              </View>
              <Text className="text-base font-bold text-foreground leading-snug">{item.title}</Text>
              <Text className="text-sm text-muted leading-relaxed" numberOfLines={2}>{item.summary}</Text>
              <View className="flex-row items-center justify-between mt-1">
                <Text className="text-xs text-muted">By {item.author}</Text>
                <TouchableOpacity
                  onPress={() => toggleLike("news", item.id)}
                  className="flex-row items-center gap-1"
                >
                  <IconSymbol
                    name={likedNews.has(item.id) ? "heart.fill" : "heart"}
                    size={16}
                    color={likedNews.has(item.id) ? "#ef4444" : colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderEventsTab = () => (
    <View className="gap-4">
      {/* Search */}
      <View className="flex-row items-center bg-surface border border-border rounded-2xl px-4 py-3 gap-3">
        <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
        <TextInput
          value={eventsSearch}
          onChangeText={setEventsSearch}
          placeholder="Search events..."
          placeholderTextColor={colors.muted}
          className="flex-1 text-foreground text-sm"
        />
      </View>
      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
        <View className="flex-row gap-2 px-1">
          {EVENT_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedEventsCategory(cat)}
              className={`px-4 py-2 rounded-full border ${
                selectedEventsCategory === cat ? "border-primary" : "border-border bg-surface"
              }`}
              style={selectedEventsCategory === cat ? { backgroundColor: colors.primary } : {}}
            >
              <Text className={`text-xs font-semibold capitalize ${
                selectedEventsCategory === cat ? "text-white" : "text-muted"
              }`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {/* Events List */}
      {campusLoading ? (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted text-sm mt-3">Loading events...</Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View className="items-center py-12">
          <IconSymbol name="calendar" size={48} color={colors.muted} />
          <Text className="text-muted text-base mt-3">No events found</Text>
        </View>
      ) : (
        filteredEvents.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSelectedEvent(item)}
            className="bg-surface rounded-3xl overflow-hidden border border-border active:opacity-80"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}
          >
            {item.image_url && (
              <Image
                source={{ uri: item.image_url }}
                style={{ width: "100%", height: 180 }}
                contentFit="cover"
              />
            )}
            <View className="p-4 gap-2">
              <View className="flex-row items-center gap-2">
                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "#f59e0b20" }}>
                  <Text className="text-xs font-bold" style={{ color: "#f59e0b" }}>{item.category}</Text>
                </View>
                {item.featured && (
                  <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary + "20" }}>
                    <Text className="text-xs font-bold" style={{ color: colors.primary }}>Featured</Text>
                  </View>
                )}
              </View>
              <Text className="text-base font-bold text-foreground leading-snug">{item.title}</Text>
              <Text className="text-sm text-muted" numberOfLines={2}>{item.description}</Text>
              <View className="flex-row items-center gap-4 mt-1">
                <View className="flex-row items-center gap-1">
                  <IconSymbol name="calendar" size={14} color={colors.muted} />
                  <Text className="text-xs text-muted">{formatEventDate(item.event_date)}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <IconSymbol name="clock" size={14} color={colors.muted} />
                  <Text className="text-xs text-muted">{formatEventTime(item.event_date)}</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1">
                <IconSymbol name="mappin" size={14} color={colors.muted} />
                <Text className="text-xs text-muted">{item.location}</Text>
              </View>
              <View className="flex-row items-center justify-between mt-1">
                <Text className="text-xs text-muted">By {item.organizer}</Text>
                <TouchableOpacity
                  onPress={() => toggleLike("event", item.id)}
                  className="flex-row items-center gap-1"
                >
                  <IconSymbol
                    name={likedEvents.has(item.id) ? "heart.fill" : "heart"}
                    size={16}
                    color={likedEvents.has(item.id) ? "#ef4444" : colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderLecturesTab = () => (
    <View className="gap-4">
      {/* Search */}
      <View className="flex-row items-center bg-surface border border-border rounded-2xl px-4 py-3 gap-3">
        <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
        <TextInput
          value={lecturesSearch}
          onChangeText={setLecturesSearch}
          placeholder="Search lectures..."
          placeholderTextColor={colors.muted}
          className="flex-1 text-foreground text-sm"
        />
      </View>
      {/* Subject Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
        <View className="flex-row gap-2 px-1">
          {LECTURE_SUBJECTS.map(sub => (
            <TouchableOpacity
              key={sub}
              onPress={() => setSelectedLectureSubject(sub)}
              className={`px-4 py-2 rounded-full border ${
                selectedLectureSubject === sub ? "border-primary" : "border-border bg-surface"
              }`}
              style={selectedLectureSubject === sub ? { backgroundColor: colors.primary } : {}}
            >
              <Text className={`text-xs font-semibold capitalize ${
                selectedLectureSubject === sub ? "text-white" : "text-muted"
              }`}>{sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {/* Lectures Grid */}
      {filteredLectures.length === 0 ? (
        <View className="items-center py-12">
          <IconSymbol name="book.fill" size={48} color={colors.muted} />
          <Text className="text-muted text-base mt-3">No lectures found</Text>
        </View>
      ) : (
        filteredLectures.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSelectedLecture(item)}
            className="bg-surface rounded-3xl overflow-hidden border border-border active:opacity-80"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}
          >
            <View className="flex-row">
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={{ width: 110, height: 110 }}
                contentFit="cover"
              />
              <View className="flex-1 p-4 gap-1 justify-center">
                <View className="px-2 py-0.5 rounded-full self-start" style={{ backgroundColor: "#6366f120" }}>
                  <Text className="text-xs font-bold" style={{ color: "#6366f1" }}>{item.subject}</Text>
                </View>
                <Text className="text-sm font-bold text-foreground leading-snug" numberOfLines={2}>{item.title}</Text>
                <Text className="text-xs text-muted">{item.instructor}</Text>
                <View className="flex-row items-center gap-1 mt-1">
                  <IconSymbol name="clock" size={12} color={colors.muted} />
                  <Text className="text-xs text-muted">{item.duration}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

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

        {/* Category Dropdown */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => setShowTabDropdown(!showTabDropdown)}
            className="bg-white border-2 border-gray-200 rounded-xl px-5 py-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol
                name={
                  activeTab === "podcasts" ? "mic.fill" :
                  activeTab === "campus-radio" ? "antenna.radiowaves.left.and.right" :
                  activeTab === "radio-stations" ? "radio.fill" :
                  activeTab === "music" ? "music.note" :
                  activeTab === "news" ? "newspaper" :
                  activeTab === "events" ? "calendar" :
                  activeTab === "lectures" ? "book.fill" :
                  "film.fill"
                }
                size={20}
                color="#1f2937"
              />
              <Text className="text-base font-semibold text-gray-900">
                {
                  activeTab === "podcasts" ? "Podcasts" :
                  activeTab === "campus-radio" ? "Campus Radio" :
                  activeTab === "radio-stations" ? "Radio" :
                  activeTab === "music" ? "Music" :
                  activeTab === "news" ? "Campus News" :
                  activeTab === "events" ? "Campus Events" :
                  activeTab === "lectures" ? "Lectures" :
                  "Movies"
                }
              </Text>
            </View>
            <IconSymbol name="chevron.down" size={20} color="#1f2937" />
          </TouchableOpacity>

          {/* Dropdown Menu */}
          {showTabDropdown && (
            <View className="bg-white border-2 border-gray-200 rounded-xl mt-2 overflow-hidden">
              <TouchableOpacity
                onPress={() => {
                  setActiveTab("podcasts");
                  setShowTabDropdown(false);
                }}
                className={`px-5 py-4 flex-row items-center gap-3 ${
                  activeTab === "podcasts" ? "bg-primary/10" : ""
                }`}
              >
                <IconSymbol
                  name="mic.fill"
                  size={20}
                  color={activeTab === "podcasts" ? colors.primary : "#1f2937"}
                />
                <Text
                  className={`text-base font-semibold ${
                    activeTab === "podcasts" ? "text-primary" : "text-gray-900"
                  }`}
                >
                  Podcasts
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setActiveTab("campus-radio");
                  setShowTabDropdown(false);
                }}
                className={`px-5 py-4 flex-row items-center gap-3 ${
                  activeTab === "campus-radio" ? "bg-primary/10" : ""
                }`}
              >
                <IconSymbol
                  name="antenna.radiowaves.left.and.right"
                  size={20}
                  color={activeTab === "campus-radio" ? colors.primary : "#1f2937"}
                />
                <Text
                  className={`text-base font-semibold ${
                    activeTab === "campus-radio" ? "text-primary" : "text-gray-900"
                  }`}
                >
                  Campus Radio
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setActiveTab("radio-stations");
                  setShowTabDropdown(false);
                }}
                className={`px-5 py-4 flex-row items-center gap-3 ${
                  activeTab === "radio-stations" ? "bg-primary/10" : ""
                }`}
              >
                <IconSymbol
                  name="radio.fill"
                  size={20}
                  color={activeTab === "radio-stations" ? colors.primary : "#1f2937"}
                />
                <Text
                  className={`text-base font-semibold ${
                    activeTab === "radio-stations" ? "text-primary" : "text-gray-900"
                  }`}
                >
                  Radio
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setActiveTab("music");
                  setShowTabDropdown(false);
                }}
                className={`px-5 py-4 flex-row items-center gap-3 ${
                  activeTab === "music" ? "bg-primary/10" : ""
                }`}
              >
                <IconSymbol
                  name="music.note"
                  size={20}
                  color={activeTab === "music" ? colors.primary : "#1f2937"}
                />
                <Text
                  className={`text-base font-semibold ${
                    activeTab === "music" ? "text-primary" : "text-gray-900"
                  }`}
                >
                  Music
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setActiveTab("movies");
                  setShowTabDropdown(false);
                }}
                className={`px-5 py-4 flex-row items-center gap-3 ${
                  activeTab === "movies" ? "bg-primary/10" : ""
                }`}
              >
                <IconSymbol
                  name="film.fill"
                  size={20}
                  color={activeTab === "movies" ? colors.primary : "#1f2937"}
                />
                <Text
                  className={`text-base font-semibold ${
                    activeTab === "movies" ? "text-primary" : "text-gray-900"
                  }`}
                >
                  Movies
                </Text>
              </TouchableOpacity>
              {/* ─── Campus Hub Tabs ─── */}
              <View className="border-t border-border my-1" />
              <TouchableOpacity
                onPress={() => { setActiveTab("news"); setShowTabDropdown(false); }}
                className={`px-5 py-4 flex-row items-center gap-3 ${activeTab === "news" ? "bg-primary/10" : ""}`}
              >
                <IconSymbol name="newspaper" size={20} color={activeTab === "news" ? colors.primary : "#1f2937"} />
                <Text className={`text-base font-semibold ${activeTab === "news" ? "text-primary" : "text-gray-900"}`}>Campus News</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setActiveTab("events"); setShowTabDropdown(false); }}
                className={`px-5 py-4 flex-row items-center gap-3 ${activeTab === "events" ? "bg-primary/10" : ""}`}
              >
                <IconSymbol name="calendar" size={20} color={activeTab === "events" ? colors.primary : "#1f2937"} />
                <Text className={`text-base font-semibold ${activeTab === "events" ? "text-primary" : "text-gray-900"}`}>Campus Events</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setActiveTab("lectures"); setShowTabDropdown(false); }}
                className={`px-5 py-4 flex-row items-center gap-3 ${activeTab === "lectures" ? "bg-primary/10" : ""}`}
              >
                <IconSymbol name="book.fill" size={20} color={activeTab === "lectures" ? colors.primary : "#1f2937"} />
                <Text className={`text-base font-semibold ${activeTab === "lectures" ? "text-primary" : "text-gray-900"}`}>Lectures</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            (activeTab === "news" || activeTab === "events") ? (
              <RefreshControl
                refreshing={campusRefreshing}
                onRefresh={() => fetchCampusData(true)}
                tintColor={colors.primary}
              />
            ) : undefined
          }
        >
          {activeTab === "podcasts" && renderPodcastsTab()}
          {activeTab === "campus-radio" && renderRadioStations(CAMPUS_RADIO, "Campus Radio Stations")}
          {activeTab === "radio-stations" && renderRadioStations(RADIO_STATIONS, "Live Radio Stations")}
          {activeTab === "music" && renderMusicTab()}
          {activeTab === "movies" && renderMoviesTab()}
          {activeTab === "news" && renderNewsTab()}
          {activeTab === "events" && renderEventsTab()}
          {activeTab === "lectures" && renderLecturesTab()}
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

      {/* ─── News Detail Modal ─── */}
      <Modal visible={!!selectedNews} animationType="slide" onRequestClose={() => setSelectedNews(null)}>
        <ScreenContainer edges={["top", "left", "right"]}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <TouchableOpacity onPress={() => setSelectedNews(null)} className="flex-row items-center gap-2 px-4 py-3">
              <IconSymbol name="chevron.left" size={20} color={colors.primary} />
              <Text className="text-primary font-semibold">Back</Text>
            </TouchableOpacity>
            {selectedNews?.image_url && (
              <Image source={{ uri: selectedNews.image_url }} style={{ width: "100%", height: 220 }} contentFit="cover" />
            )}
            <View className="px-4 pt-4 gap-3">
              <View className="flex-row items-center gap-2">
                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary + "20" }}>
                  <Text className="text-xs font-bold" style={{ color: colors.primary }}>{selectedNews?.category}</Text>
                </View>
                <Text className="text-xs text-muted">{selectedNews ? timeAgo(selectedNews.published_at) : ""}</Text>
              </View>
              <Text className="text-2xl font-bold text-foreground leading-tight">{selectedNews?.title}</Text>
              <Text className="text-sm text-muted font-semibold">{selectedNews?.summary}</Text>
              <View className="border-t border-border pt-3">
                <Text className="text-base text-foreground leading-relaxed">{selectedNews?.content}</Text>
              </View>
              <Text className="text-xs text-muted pt-2">By {selectedNews?.author}</Text>
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>

      {/* ─── Event Detail Modal ─── */}
      <Modal visible={!!selectedEvent} animationType="slide" onRequestClose={() => setSelectedEvent(null)}>
        <ScreenContainer edges={["top", "left", "right"]}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <TouchableOpacity onPress={() => setSelectedEvent(null)} className="flex-row items-center gap-2 px-4 py-3">
              <IconSymbol name="chevron.left" size={20} color={colors.primary} />
              <Text className="text-primary font-semibold">Back</Text>
            </TouchableOpacity>
            {selectedEvent?.image_url && (
              <Image source={{ uri: selectedEvent.image_url }} style={{ width: "100%", height: 220 }} contentFit="cover" />
            )}
            <View className="px-4 pt-4 gap-4">
              <View className="flex-row items-center gap-2 flex-wrap">
                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "#f59e0b20" }}>
                  <Text className="text-xs font-bold" style={{ color: "#f59e0b" }}>{selectedEvent?.category}</Text>
                </View>
                {selectedEvent?.featured && (
                  <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary + "20" }}>
                    <Text className="text-xs font-bold" style={{ color: colors.primary }}>Featured</Text>
                  </View>
                )}
              </View>
              <Text className="text-2xl font-bold text-foreground leading-tight">{selectedEvent?.title}</Text>
              <Text className="text-base text-muted">{selectedEvent?.description}</Text>
              {/* Date/Time/Location Grid */}
              <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
                <View className="flex-row items-start gap-3">
                  <IconSymbol name="calendar" size={18} color={colors.primary} />
                  <View>
                    <Text className="text-xs font-bold text-foreground">Date & Time</Text>
                    <Text className="text-sm text-muted">{selectedEvent ? formatEventDate(selectedEvent.event_date) : ""} at {selectedEvent ? formatEventTime(selectedEvent.event_date) : ""}</Text>
                  </View>
                </View>
                <View className="flex-row items-start gap-3">
                  <IconSymbol name="mappin" size={18} color={colors.primary} />
                  <View>
                    <Text className="text-xs font-bold text-foreground">Location</Text>
                    <Text className="text-sm text-muted">{selectedEvent?.location}</Text>
                  </View>
                </View>
                {selectedEvent?.capacity && (
                  <View className="flex-row items-start gap-3">
                    <IconSymbol name="person.2.fill" size={18} color={colors.primary} />
                    <View>
                      <Text className="text-xs font-bold text-foreground">Capacity</Text>
                      <Text className="text-sm text-muted">{selectedEvent.capacity} people</Text>
                    </View>
                  </View>
                )}
                <View className="flex-row items-start gap-3">
                  <IconSymbol name="person.fill" size={18} color={colors.primary} />
                  <View>
                    <Text className="text-xs font-bold text-foreground">Organizer</Text>
                    <Text className="text-sm text-muted">{selectedEvent?.organizer}</Text>
                  </View>
                </View>
              </View>
              <Text className="text-base text-foreground leading-relaxed">{selectedEvent?.full_description}</Text>
              {selectedEvent?.registration_url && (
                <TouchableOpacity
                  onPress={() => selectedEvent.registration_url && Linking.openURL(selectedEvent.registration_url)}
                  className="rounded-2xl py-4 items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-bold text-base">Register Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>

      {/* ─── Lecture Detail Modal ─── */}
      <Modal visible={!!selectedLecture} animationType="slide" onRequestClose={() => setSelectedLecture(null)}>
        <ScreenContainer edges={["top", "left", "right"]}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <TouchableOpacity onPress={() => setSelectedLecture(null)} className="flex-row items-center gap-2 px-4 py-3">
              <IconSymbol name="chevron.left" size={20} color={colors.primary} />
              <Text className="text-primary font-semibold">Back</Text>
            </TouchableOpacity>
            {/* Thumbnail with play overlay */}
            <View style={{ position: "relative" }}>
              <Image source={{ uri: selectedLecture?.thumbnailUrl }} style={{ width: "100%", height: 220 }} contentFit="cover" />
              <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}>
                <View className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.9)" }}>
                  <IconSymbol name="play.fill" size={28} color={colors.primary} />
                </View>
              </View>
            </View>
            <View className="px-4 pt-4 gap-4">
              <View className="px-3 py-1 rounded-full self-start" style={{ backgroundColor: "#6366f120" }}>
                <Text className="text-xs font-bold" style={{ color: "#6366f1" }}>{selectedLecture?.subject}</Text>
              </View>
              <Text className="text-2xl font-bold text-foreground leading-tight">{selectedLecture?.title}</Text>
              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                  <IconSymbol name="person.fill" size={14} color={colors.muted} />
                  <Text className="text-sm text-muted">{selectedLecture?.instructor}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <IconSymbol name="clock" size={14} color={colors.muted} />
                  <Text className="text-sm text-muted">{selectedLecture?.duration}</Text>
                </View>
              </View>
              <Text className="text-base text-foreground leading-relaxed">{selectedLecture?.description}</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => Toast.show({ type: "info", text1: "Coming Soon", text2: "Video playback will be available soon" })}
                  className="flex-1 rounded-2xl py-4 items-center flex-row justify-center gap-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  <IconSymbol name="play.fill" size={18} color="white" />
                  <Text className="text-white font-bold">Play Lecture</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => Toast.show({ type: "success", text1: "Saved!", text2: "Added to your library" })}
                  className="flex-1 rounded-2xl py-4 items-center flex-row justify-center gap-2 border border-border bg-surface"
                >
                  <IconSymbol name="bookmark.fill" size={18} color={colors.primary} />
                  <Text className="font-bold" style={{ color: colors.primary }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}
