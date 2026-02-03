import { View, Text, TouchableOpacity, ScrollView, Animated, PanResponder, Dimensions, Modal, TextInput, ImageBackground } from "react-native";
import { Image } from "expo-image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.25;

type DatingProfile = {
  id: number;
  userId: number;
  name: string;
  age: number;
  institution: string;
  course: string;
  bio: string;
  images: string;
  interests: string;
  isVerified: boolean;
  distance?: number;
};

type TabType = "dashboard" | "profiles" | "likes" | "liked" | "passed" | "matches" | "events" | "edit";

export default function StudentHookupScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 30,
    institution: "",
    course: "",
    maxDistance: 50,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [likes, setLikes] = useState<DatingProfile[]>([]);
  const [liked, setLiked] = useState<DatingProfile[]>([]);
  const [passed, setPassed] = useState<DatingProfile[]>([]);
  const [matches, setMatches] = useState<DatingProfile[]>([]);

  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  useEffect(() => {
    seedDemoUsers();
    loadProfiles();
    loadInteractions();
  }, []);

  const seedDemoUsers = async () => {
    // Seed 10 demo users if not already exists
    const demoUsers = [
      { name: "Tshephang Motaung", age: 23, institution: "University of Johannesburg", course: "Marketing", bio: "Marketing student with big dreams. Love music festivals and creative vibes! 🎵", interests: ["Music", "Art", "Travel"], images: ["https://i.pravatar.cc/400?img=1"], isVerified: true },
      { name: "Lerato Ndlovu", age: 21, institution: "University of Pretoria", course: "Computer Science", bio: "Tech enthusiast and gamer. Looking for someone to share adventures with! 🎮", interests: ["Gaming", "Technology", "Movies"], images: ["https://i.pravatar.cc/400?img=5"], isVerified: true },
      { name: "Thabo Mkhize", age: 24, institution: "Wits University", course: "Business Management", bio: "Entrepreneur at heart. Love fitness and healthy living. Let's build something together! 💪", interests: ["Fitness", "Business", "Food"], images: ["https://i.pravatar.cc/400?img=12"], isVerified: false },
      { name: "Naledi Khumalo", age: 22, institution: "University of Cape Town", course: "Medicine", bio: "Future doctor with a passion for helping others. Love hiking and nature! 🏔️", interests: ["Travel", "Fitness", "Reading"], images: ["https://i.pravatar.cc/400?img=9"], isVerified: true },
      { name: "Sipho Dlamini", age: 25, institution: "Stellenbosch University", course: "Engineering", bio: "Engineering student who loves solving problems. Coffee addict ☕", interests: ["Technology", "Coffee", "Sports"], images: ["https://i.pravatar.cc/400?img=15"], isVerified: false },
      { name: "Zanele Moyo", age: 20, institution: "Rhodes University", course: "Journalism", bio: "Aspiring journalist and storyteller. Love photography and exploring new places 📸", interests: ["Photography", "Writing", "Travel"], images: ["https://i.pravatar.cc/400?img=10"], isVerified: true },
      { name: "Bongani Sithole", age: 23, institution: "University of KwaZulu-Natal", course: "Law", bio: "Law student with a passion for justice. Love debating and intellectual conversations ⚖️", interests: ["Reading", "Debate", "Politics"], images: ["https://i.pravatar.cc/400?img=13"], isVerified: false },
      { name: "Nomvula Zulu", age: 21, institution: "North-West University", course: "Psychology", bio: "Understanding the human mind. Love art and creative expression 🎨", interests: ["Art", "Psychology", "Music"], images: ["https://i.pravatar.cc/400?img=16"], isVerified: true },
      { name: "Mandla Nkosi", age: 24, institution: "University of the Free State", course: "Sports Science", bio: "Athlete and fitness coach. Let's stay active together! 🏃‍♂️", interests: ["Sports", "Fitness", "Nutrition"], images: ["https://i.pravatar.cc/400?img=14"], isVerified: false },
      { name: "Precious Mahlangu", age: 22, institution: "Tshwane University of Technology", course: "Fashion Design", bio: "Fashion designer with an eye for style. Love shopping and creative projects 👗", interests: ["Fashion", "Shopping", "Art"], images: ["https://i.pravatar.cc/400?img=20"], isVerified: true },
    ];

    try {
      for (const user of demoUsers) {
        await supabase.from("datingProfiles").upsert({
          ...user,
          images: JSON.stringify(user.images),
          interests: JSON.stringify(user.interests),
          isActive: true,
        }, { onConflict: "name" });
      }
    } catch (error) {
      console.log("Demo users already seeded or error:", error);
    }
  };

  const loadProfiles = async () => {
    try {
      setLoading(true);
      // Get current user to exclude from profiles
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from("datingProfiles")
        .select("*")
        .eq("isActive", true)
        .order("createdAt", { ascending: false });
      
      // Exclude current user's profile
      if (user) {
        query = query.neq("userId", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error loading profiles:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load profiles",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInteractions = async () => {
    // Load likes, matches, etc. from database
    // Mock data for now
    setLikes([]);
    setLiked([]);
    setPassed([]);
    setMatches([]);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          handleSwipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          handleSwipeLeft();
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleSwipeRight = () => {
    Animated.timing(position, {
      toValue: { x: width + 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      const currentProfile = profiles[currentIndex];
      setLiked([...liked, currentProfile]);
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
      
      Toast.show({
        type: "success",
        text1: "Liked! 💖",
        text2: `You liked ${currentProfile.name}`,
      });
    });
  };

  const handleSwipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -width - 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      const currentProfile = profiles[currentIndex];
      setPassed([...passed, currentProfile]);
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
    });
  };

  const renderCard = (profile: DatingProfile, index: number) => {
    if (index < currentIndex) return null;
    if (index > currentIndex) {
      return (
        <Animated.View
          key={profile.id}
          style={{
            position: "absolute",
            width: width - 32,
            height: height * 0.65,
            transform: [{ scale: 0.95 }],
            opacity: 0.5,
          }}
        >
          <ProfileCard profile={profile} />
        </Animated.View>
      );
    }

    const images = JSON.parse(profile.images || "[]");
    const mainImage = images[0] || "";

    return (
      <Animated.View
        key={profile.id}
        {...panResponder.panHandlers}
        style={{
          position: "absolute",
          width: width - 32,
          height: height * 0.65,
          transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
        }}
      >
        <View className="flex-1 rounded-3xl overflow-hidden bg-surface" style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}>
          {mainImage ? (
            <Image
              source={{ uri: mainImage }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.muted }}>
              <IconSymbol name="person.circle.fill" size={120} color={colors.mutedForeground} />
            </View>
          )}

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.9)"]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24 }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-3xl font-bold text-white">{profile.name}, {profile.age}</Text>
              {profile.isVerified && (
                <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                  <IconSymbol name="checkmark" size={14} color="#fff" />
                </View>
              )}
            </View>
            <View className="flex-row items-center gap-2 mb-2">
              <IconSymbol name="building.2.fill" size={16} color="#fff" />
              <Text className="text-base text-white">{profile.institution}</Text>
            </View>
            <View className="flex-row items-center gap-2 mb-3">
              <IconSymbol name="book.fill" size={16} color="#fff" />
              <Text className="text-base text-white">{profile.course}</Text>
            </View>
            <Text className="text-sm text-white opacity-90" numberOfLines={2}>
              {profile.bio}
            </Text>
          </LinearGradient>

          {/* Like/Nope Overlays */}
          <Animated.View
            style={{
              position: "absolute",
              top: 100,
              right: 40,
              opacity: likeOpacity,
              transform: [{ rotate: "30deg" }],
            }}
          >
            <View className="border-4 border-green-500 px-6 py-3 rounded-2xl">
              <Text className="text-4xl font-bold text-green-500">LIKE</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              position: "absolute",
              top: 100,
              left: 40,
              opacity: nopeOpacity,
              transform: [{ rotate: "-30deg" }],
            }}
          >
            <View className="border-4 border-red-500 px-6 py-3 rounded-2xl">
              <Text className="text-4xl font-bold text-red-500">NOPE</Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    );
  };

  const ProfileCard = ({ profile }: { profile: DatingProfile }) => {
    const images = JSON.parse(profile.images || "[]");
    const mainImage = images[0] || "";

    return (
      <View className="flex-1 rounded-3xl overflow-hidden bg-surface">
        {mainImage ? (
          <Image source={{ uri: mainImage }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        ) : (
          <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.muted }}>
            <IconSymbol name="person.circle.fill" size={120} color={colors.mutedForeground} />
          </View>
        )}
      </View>
    );
  };

  const renderDashboard = () => (
    <View className="flex-1">
      {/* Swipe Cards */}
      <View style={{ height: height * 0.65, marginBottom: 24 }}>
        {profiles.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <IconSymbol name="heart.slash.fill" size={64} color={colors.mutedForeground} />
            <Text className="text-xl font-bold text-foreground mt-4">No more profiles</Text>
            <Text className="text-muted-foreground mt-2">Check back later for new matches!</Text>
          </View>
        ) : currentIndex >= profiles.length ? (
          <View className="flex-1 items-center justify-center">
            <IconSymbol name="checkmark.circle.fill" size={64} color={colors.primary} />
            <Text className="text-xl font-bold text-foreground mt-4">You're all caught up!</Text>
            <Text className="text-muted-foreground mt-2">Come back later for more profiles</Text>
          </View>
        ) : (
          profiles.map((profile, index) => renderCard(profile, index))
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center justify-center gap-6 px-8">
        <TouchableOpacity
          onPress={handleSwipeLeft}
          className="w-16 h-16 rounded-full bg-white items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <IconSymbol name="xmark" size={32} color="#ef4444" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          className="w-12 h-12 rounded-full bg-white items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <IconSymbol name="slider.horizontal.3" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSwipeRight}
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{
            backgroundColor: colors.primary,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <IconSymbol name="heart.fill" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header - Matching Screenshot Design */}
        <View className="-mx-4 -mt-4 mb-4">
          <ImageBackground
            source={require("@/assets/images/student-hookup-bg.jpg")}
            style={{ height: 200 }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)"]}
              className="flex-1 px-4 pt-6 pb-4 justify-between"
            >
              {/* Top Row: Status Pills and Actions */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row gap-2">
                  {/* Live Status */}
                  <View className="bg-green-500/90 px-3 py-2 rounded-full flex-row items-center gap-1.5">
                    <IconSymbol name="wifi" size={14} color="#fff" />
                    <Text className="text-white text-xs font-bold">Live</Text>
                  </View>
                  {/* Points */}
                  <View className="bg-pink-500/90 px-3 py-2 rounded-full flex-row items-center gap-1.5">
                    <IconSymbol name="heart.fill" size={14} color="#fff" />
                    <Text className="text-white text-xs font-bold">250 pts</Text>
                  </View>
                  {/* Streak */}
                  <View className="bg-orange-500/90 px-3 py-2 rounded-full flex-row items-center gap-1.5">
                    <IconSymbol name="flame.fill" size={14} color="#fff" />
                    <Text className="text-white text-xs font-bold">5 days</Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                    <IconSymbol name="heart.fill" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                    <IconSymbol name="crown.fill" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Title */}
              <View className="items-center">
                <Text className="text-4xl font-bold text-white mb-1">💖 Student Hook-Up! 💖</Text>
                <Text className="text-base text-white/90">🌹 Find your perfect match on campus 💘</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Tabs - Matching Marketplace Style */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ gap: 12, paddingRight: 16, paddingBottom: 12 }}
        >
          {[
            { key: "dashboard", label: "Dashboard", icon: "house.fill" },
            { key: "profiles", label: "Profiles", icon: "person.3.fill" },
            { key: "likes", label: "Likes You", icon: "heart.fill", badge: likes.length },
            { key: "liked", label: "Liked", icon: "heart", badge: liked.length },
            { key: "passed", label: "Passed", icon: "xmark.circle", badge: passed.length },
            { key: "matches", label: "Matches", icon: "sparkles", badge: matches.length },
            { key: "events", label: "Events", icon: "calendar" },
            { key: "edit", label: "Edit Profile", icon: "pencil" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as TabType)}
              className={`px-5 rounded-full flex-row items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-primary"
                  : "bg-white border-2 border-gray-200"
              }`}
              style={{ height: 42, minHeight: 42, maxHeight: 42 }}
            >
              <IconSymbol
                name={tab.icon}
                size={18}
                color={activeTab === tab.key ? "#fff" : "#1f2937"}
              />
              <Text
                className={`font-bold text-base ${
                  activeTab === tab.key ? "text-white" : "text-gray-900"
                }`}
              >
                {tab.label}
              </Text>
              {tab.badge !== undefined && tab.badge > 0 && (
                <View className="bg-error w-5 h-5 rounded-full items-center justify-center ml-1">
                  <Text className="text-white text-xs font-bold">{tab.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "profiles" && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">Profiles view coming soon</Text>
          </View>
        )}
        {activeTab === "likes" && (
          <View className="flex-1 items-center justify-center">
            <IconSymbol name="heart.fill" size={64} color={colors.primary} />
            <Text className="text-xl font-bold text-foreground mt-4">{likes.length} people like you!</Text>
            <Text className="text-muted-foreground mt-2">Upgrade to see who likes you</Text>
          </View>
        )}
        {activeTab === "events" && (
          <View className="flex-1 items-center justify-center">
            <IconSymbol name="calendar" size={64} color={colors.primary} />
            <Text className="text-xl font-bold text-foreground mt-4">Campus Events</Text>
            <Text className="text-muted-foreground mt-2">Meet people at events near you</Text>
          </View>
        )}
        {activeTab === "edit" && (
          <View className="flex-1 items-center justify-center">
            <TouchableOpacity
              onPress={() => router.push("/edit-dating-profile")}
              className="bg-primary px-6 py-3 rounded-full"
            >
              <Text className="text-white font-bold text-base">Edit Your Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Filters Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View className="bg-surface rounded-t-3xl p-6" style={{ maxHeight: height * 0.7 }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-base font-semibold text-foreground mb-2">Age Range</Text>
              <View className="flex-row gap-3 mb-6">
                <TextInput
                  className="flex-1 bg-muted rounded-xl px-4 py-3 text-foreground"
                  placeholder="Min Age"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  value={filters.minAge.toString()}
                  onChangeText={(text) => setFilters({ ...filters, minAge: parseInt(text) || 18 })}
                />
                <TextInput
                  className="flex-1 bg-muted rounded-xl px-4 py-3 text-foreground"
                  placeholder="Max Age"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  value={filters.maxAge.toString()}
                  onChangeText={(text) => setFilters({ ...filters, maxAge: parseInt(text) || 30 })}
                />
              </View>

              <Text className="text-base font-semibold text-foreground mb-2">Institution</Text>
              <TextInput
                className="bg-muted rounded-xl px-4 py-3 text-foreground mb-6"
                placeholder="Filter by institution"
                placeholderTextColor={colors.mutedForeground}
                value={filters.institution}
                onChangeText={(text) => setFilters({ ...filters, institution: text })}
              />

              <TouchableOpacity
                className="bg-primary py-4 rounded-xl items-center"
                onPress={() => {
                  setShowFilters(false);
                  loadProfiles();
                }}
              >
                <Text className="text-white font-bold text-base">Apply Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
