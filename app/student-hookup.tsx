import { View, Text, TouchableOpacity, ScrollView, Animated, PanResponder, Dimensions, Modal, TextInput, ImageBackground, FlatList, Alert } from "react-native";
import { Image } from "expo-image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = Math.min(height * 0.65, 600);
const CARD_WIDTH = Math.min(width - 48, 380);
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

const SAMPLE_PROFILES: DatingProfile[] = [
  {
    id: 1,
    userId: 101,
    name: "Thandi Mabaso",
    age: 21,
    institution: "University of Pretoria",
    course: "Business Management",
    bio: "Love hiking, coffee dates, and deep conversations. Looking for someone genuine!",
    images: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800",
    interests: "Hiking, Coffee, Music, Travel",
    isVerified: true,
    distance: 2,
  },
  {
    id: 2,
    userId: 102,
    name: "Lerato Ndlovu",
    age: 22,
    institution: "Stellenbosch University",
    course: "Computer Science",
    bio: "Tech enthusiast and bookworm. Lets grab coffee and talk about our favorite series!",
    images: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800",
    interests: "Technology, Reading, Gaming, Coding",
    isVerified: true,
    distance: 5,
  },
  {
    id: 3,
    userId: 103,
    name: "Sipho Khumalo",
    age: 23,
    institution: "University of Cape Town",
    course: "Engineering",
    bio: "Gym rat and adventure seeker. Always up for trying new things!",
    images: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    interests: "Fitness, Adventure, Sports, Travel",
    isVerified: false,
    distance: 8,
  },
  {
    id: 4,
    userId: 104,
    name: "Nomsa Dlamini",
    age: 20,
    institution: "University of Johannesburg",
    course: "Psychology",
    bio: "Aspiring psychologist who loves art and meaningful conversations.",
    images: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
    interests: "Art, Psychology, Music, Yoga",
    isVerified: true,
    distance: 3,
  },
  {
    id: 5,
    userId: 105,
    name: "Bongani Zulu",
    age: 24,
    institution: "University of the Witwatersrand",
    course: "Law",
    bio: "Future lawyer with a passion for justice and good food!",
    images: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800",
    interests: "Law, Food, Politics, Debate",
    isVerified: true,
    distance: 6,
  },
  {
    id: 6,
    userId: 106,
    name: "Zanele Mokoena",
    age: 21,
    institution: "Stellenbosch University",
    course: "Medicine",
    bio: "Med student who loves dancing and helping others. Lets make memories!",
    images: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800",
    interests: "Medicine, Dancing, Volunteering, Fitness",
    isVerified: true,
    distance: 4,
  },
];

type TabType = "dashboard" | "profiles" | "likes" | "liked" | "passed" | "matches" | "events" | "edit";

export default function StudentHookupScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Age verification gate (required by Google Play for dating/hookup content)
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    // Check if user has previously verified age
    checkAgeVerification().catch(() => {
      // Silently ignore — age gate remains visible on error
    });
    // Load sample profiles
    setTimeout(() => {
      setProfiles(SAMPLE_PROFILES);
      setLoading(false);
    }, 1000);
  }, []);

  const checkAgeVerification = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('age_verified_for_dating')
          .eq('id', user.id)
          .maybeSingle();
        if (profile?.age_verified_for_dating) {
          setAgeVerified(true);
          setShowAgeGate(false);
        }
      }
    } catch (error) {
      // Continue showing age gate if check fails
    }
  };

  const handleAgeConfirm = async () => {
    if (!agreedToTerms) {
      Alert.alert('Confirmation Required', 'You must confirm that you are 18 years or older to access this section.');
      return;
    }
    try {
      const { data: { user } } = await safeGetUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ age_verified_for_dating: true })
          .eq('id', user.id);
      }
    } catch (error) {
      // Proceed even if DB update fails
    }
    setAgeVerified(true);
    setShowAgeGate(false);
  };
  const [showFilters, setShowFilters] = useState(false);
  const [showTabDropdown, setShowTabDropdown] = useState(false);
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
      const { data: { user } } = await safeGetUser();
      
      // Get real users from profiles table
      let query = supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          institution_name,
          course_program,
          bio,
          created_at
        `)
        .not("full_name", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);
      
      // Exclude current user
      if (user) {
        query = query.neq("id", user.id);
        
        // Also exclude users already swiped on
        const { data: interactions } = await supabase
          .from("dating_interactions")
          .select("target_user_id")
          .eq("user_id", user.id);
        
        if (interactions && interactions.length > 0) {
          const swipedIds = interactions.map(i => i.target_user_id);
          query = query.not("id", "in", `(${swipedIds.join(",")})`);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Database error loading profiles:", error);
        // Fallback to sample profiles if database fetch fails
        console.log("Using sample profiles as fallback");
        setProfiles(SAMPLE_PROFILES);
        Toast.show({
          type: "info",
          text1: "Using Demo Profiles",
          text2: "Showing sample profiles for now",
        });
        return;
      }
      
      // Transform to DatingProfile format
      const transformedProfiles: DatingProfile[] = (data || []).map((profile, index) => ({
        id: index,
        userId: profile.id,
        name: profile.full_name || "Anonymous",
        age: 20 + Math.floor(Math.random() * 10), // Calculate from DOB if available
        institution: profile.institution_name || "Student",
        course: profile.course_program || "Unknown",
        bio: profile.bio || "Hey there! 👋",
        images: JSON.stringify([profile.avatar_url || "https://via.placeholder.com/400"]),
        interests: JSON.stringify([]),
        isVerified: false,
      }));
      
      console.log("Loaded profiles:", transformedProfiles.length);
      
      // If no profiles from database, use sample profiles
      if (transformedProfiles.length === 0) {
        console.log("No profiles in database, using sample profiles");
        setProfiles(SAMPLE_PROFILES);
      } else {
        setProfiles(transformedProfiles);
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
      // Use sample profiles as fallback
      console.log("Exception occurred, using sample profiles");
      setProfiles(SAMPLE_PROFILES);
      Toast.show({
        type: "info",
        text1: "Using Demo Profiles",
        text2: "Showing sample profiles",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInteractions = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (!user) return;
      
      // Load likes (people who liked me)
      const { data: likesData } = await supabase
        .from("dating_interactions")
        .select(`
          target_user_id,
          profiles!dating_interactions_target_user_id_fkey (
            id,
            full_name,
            avatar_url,
            institution_name,
            course_program,
            bio
          )
        `)
        .eq("target_user_id", user.id)
        .eq("action", "like");
      
      // Load liked (people I liked)
      const { data: likedData } = await supabase
        .from("dating_interactions")
        .select(`
          target_user_id,
          profiles!dating_interactions_target_user_id_fkey (
            id,
            full_name,
            avatar_url,
            institution_name,
            course_program,
            bio
          )
        `)
        .eq("user_id", user.id)
        .eq("action", "like");
      
      // Load matches
      const { data: matchesData } = await supabase
        .from("dating_matches")
        .select(`
          user1_id,
          user2_id,
          profiles!dating_matches_user2_id_fkey (
            id,
            full_name,
            avatar_url,
            institution_name,
            course_program,
            bio
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      
      // Transform and set data
      setLikes(likesData || []);
      setLiked(likedData || []);
      setMatches(matchesData || []);
    } catch (error) {
      console.error("Error loading interactions:", error);
    }
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

  const handleSwipeRight = async () => {
    const currentProfile = profiles[currentIndex];
    
    Animated.timing(position, {
      toValue: { x: width + 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(async () => {
      setLiked([...liked, currentProfile]);
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
      
      // Save interaction to database
      try {
        const { data: { user } } = await safeGetUser();
        if (!user) return;
        
        // Save the like
        await supabase.from("dating_interactions").insert({
          user_id: user.id,
          target_user_id: currentProfile.userId,
          action: "like",
        });
        
        // Check if it's a match (they liked us back)
        const { data: mutualLike } = await supabase
          .from("dating_interactions")
          .select("*")
          .eq("user_id", currentProfile.userId)
          .eq("target_user_id", user.id)
          .eq("action", "like")
          .maybeSingle();
        
        if (mutualLike) {
          // It's a match!
          await supabase.from("dating_matches").insert({
            user1_id: user.id,
            user2_id: currentProfile.userId,
          });
          
          Toast.show({
            type: "success",
            text1: "It's a Match! 🎉",
            text2: `You and ${currentProfile.name} liked each other!`,
          });
        } else {
          Toast.show({
            type: "success",
            text1: "Liked! 💖",
            text2: `You liked ${currentProfile.name}`,
          });
        }
      } catch (error) {
        console.error("Error saving like:", error);
      }
    });
  };

  const handleSwipeLeft = async () => {
    const currentProfile = profiles[currentIndex];
    
    Animated.timing(position, {
      toValue: { x: -width - 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(async () => {
      setPassed([...passed, currentProfile]);
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
      
      // Save pass interaction to database
      try {
        const { data: { user } } = await safeGetUser();
        if (!user) return;
        
        await supabase.from("dating_interactions").insert({
          user_id: user.id,
          target_user_id: currentProfile.userId,
          action: "pass",
        });
      } catch (error) {
        console.error("Error saving pass:", error);
      }
    });
  };

  const renderCard = (profile: DatingProfile, index: number) => {
    if (index < currentIndex) return null;
    if (index > currentIndex) {
      // Only show the immediate next card, hide others
      if (index > currentIndex + 1) return null;
      
      return (
        <Animated.View
          key={profile.id}
          style={{
            position: "absolute",
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transform: [{ scale: 0.95 }],
            zIndex: -1, // Behind the current card
            opacity: 0.5, // Slightly transparent
          }}
        >
          <ProfileCard profile={profile} />
        </Animated.View>
      );
    }

    // Handle both string URL and JSON array formats
    let images: string[] = [];
    try {
      images = typeof profile.images === 'string' && profile.images.startsWith('[') 
        ? JSON.parse(profile.images) 
        : [profile.images];
    } catch {
      images = [profile.images];
    }
    const mainImage = images[0] || "";

    return (
      <Animated.View
        key={profile.id}
        {...panResponder.panHandlers}
        style={{
          position: "absolute",
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
          zIndex: 10, // Ensure current card is on top
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
    // Handle both string URL and JSON array formats
    let images: string[] = [];
    try {
      images = typeof profile.images === 'string' && profile.images.startsWith('[') 
        ? JSON.parse(profile.images) 
        : [profile.images];
    } catch {
      images = [profile.images];
    }
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
      <View style={{ height: CARD_HEIGHT, marginBottom: 24, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
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

      {/* Arrow Navigation Buttons - On sides of card */}
      {profiles.length > 0 && currentIndex < profiles.length && (
        <>
          {/* Left Arrow - Pass/Dislike */}
          <TouchableOpacity
            onPress={handleSwipeLeft}
            className="absolute left-4 top-1/2 w-14 h-14 rounded-full bg-white items-center justify-center"
            style={{
              marginTop: -28, // Center vertically
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
              zIndex: 10,
            }}
          >
            <IconSymbol name="arrow.left" size={28} color="#ef4444" />
          </TouchableOpacity>

          {/* Right Arrow - Like */}
          <TouchableOpacity
            onPress={handleSwipeRight}
            className="absolute right-4 top-1/2 w-14 h-14 rounded-full items-center justify-center"
            style={{
              marginTop: -28, // Center vertically
              backgroundColor: colors.primary,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
              zIndex: 10,
            }}
          >
            <IconSymbol name="arrow.right" size={28} color="#fff" />
          </TouchableOpacity>
        </>
      )}

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

        {/* Chat Button */}
        {profiles.length > 0 && currentIndex < profiles.length && (
          <TouchableOpacity
            onPress={() => {
              const currentProfile = profiles[currentIndex];
              if (currentProfile?.userId) {
                router.push(`/chat-conversation?userId=${currentProfile.userId}&userName=${encodeURIComponent(currentProfile.name)}`);
              } else {
                Toast.show({
                  type: 'info',
                  text1: 'Chat Unavailable',
                  text2: 'This is a demo profile',
                });
              }
            }}
            className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <IconSymbol name="message.fill" size={24} color="#fff" />
          </TouchableOpacity>
        )}

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
      {/* Age Verification Gate — required by Google Play for dating/hookup content */}
      <Modal
        visible={showAgeGate && !ageVerified}
        transparent
        animationType="fade"
        onRequestClose={() => router.back()}
      >
        <View className="flex-1 bg-black/80 items-center justify-center px-6">
          <View className="bg-surface rounded-3xl p-6 w-full max-w-sm border border-border">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-pink-500/20 items-center justify-center mb-3">
                <IconSymbol name="heart.fill" size={32} color="#ec4899" />
              </View>
              <Text className="text-2xl font-bold text-foreground text-center">Age Verification</Text>
              <Text className="text-sm text-muted text-center mt-2">
                This section contains social dating content intended for adults only.
              </Text>
            </View>
            <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-4">
              <Text className="text-sm text-foreground font-medium text-center">
                You must be 18 years or older to access Student Hookup.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              className="flex-row items-center gap-3 mb-5"
            >
              <View
                className="w-6 h-6 rounded border-2 items-center justify-center"
                style={{ borderColor: agreedToTerms ? '#ec4899' : colors.muted, backgroundColor: agreedToTerms ? '#ec4899' : 'transparent' }}
              >
                {agreedToTerms && <IconSymbol name="checkmark" size={14} color="#fff" />}
              </View>
              <Text className="text-sm text-foreground flex-1">
                I confirm that I am 18 years of age or older and agree to the Terms of Service.
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAgeConfirm}
              className="rounded-2xl py-4 items-center mb-3"
              style={{ backgroundColor: agreedToTerms ? '#ec4899' : colors.muted }}
            >
              <Text className="text-white font-bold text-base">Enter Student Hookup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              className="rounded-2xl py-3 items-center"
            >
              <Text className="text-muted text-sm">Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View className="flex-1">
        {/* Header - Matching Screenshot Design */}
        <View className="-mx-4 -mt-4 mb-4">
          <ImageBackground
            source={require("@/assets/images/student-hookup-bg.jpg")}
            style={{ height: Math.min(height * 0.25, 200) }}
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
                <Text className="text-2xl font-bold text-white mb-1" numberOfLines={1}>💖 Student Hook-Up! 💖</Text>
                <Text className="text-sm text-white/90" numberOfLines={1}>🌹 Find your perfect match 💘</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>
        {/* Tabs Dropdown */}
        <View className="mb-6 px-4">
          <TouchableOpacity
            onPress={() => setShowTabDropdown(!showTabDropdown)}
            className="bg-white border-2 border-gray-200 rounded-xl px-5 py-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol
                name={
                  activeTab === "dashboard" ? "house.fill" :
                  activeTab === "profiles" ? "person.3.fill" :
                  activeTab === "likes" ? "heart.fill" :
                  activeTab === "liked" ? "heart" :
                  activeTab === "passed" ? "xmark.circle" :
                  activeTab === "matches" ? "sparkles" :
                  activeTab === "events" ? "calendar" :
                  "pencil"
                }
                size={20}
                color={colors.primary}
              />
              <Text className="text-base font-semibold text-gray-900">
                {
                  activeTab === "dashboard" ? "Dashboard" :
                  activeTab === "profiles" ? "Profiles" :
                  activeTab === "likes" ? "Likes You" :
                  activeTab === "liked" ? "Liked" :
                  activeTab === "passed" ? "Passed" :
                  activeTab === "matches" ? "Matches" :
                  activeTab === "events" ? "Events" :
                  "Edit Profile"
                }
              </Text>
            </View>
            <IconSymbol name={showTabDropdown ? "chevron.up" : "chevron.down"} size={20} color="#1f2937" />
          </TouchableOpacity>

          {/* Dropdown Menu */}
          {showTabDropdown && (
            <View className="bg-white border-2 border-gray-200 rounded-xl mt-2 overflow-hidden">
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
                  onPress={() => {
                    setActiveTab(tab.key as TabType);
                    setShowTabDropdown(false);
                  }}
                  className={`px-5 py-4 flex-row items-center gap-3 ${
                    activeTab === tab.key ? "bg-primary/10" : ""
                  }`}
                >
                  <IconSymbol
                    name={tab.icon}
                    size={20}
                    color={activeTab === tab.key ? colors.primary : "#1f2937"}
                  />
                  <Text
                    className={`text-base font-semibold flex-1 ${
                      activeTab === tab.key ? "text-primary" : "text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </Text>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <View className="bg-error w-5 h-5 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">{tab.badge}</Text>
                    </View>
                  )}
                  {activeTab === tab.key && (
                    <IconSymbol name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        {activeTab === "dashboard" && renderDashboard()}
        
        {/* Profiles Tab - Show all available profiles */}
        {activeTab === "profiles" && (
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-bold text-foreground mb-4">All Profiles ({profiles.length})</Text>
            {profiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                onPress={() => {
                  setCurrentIndex(profiles.findIndex(p => p.id === profile.id));
                  setActiveTab("dashboard");
                }}
                className="bg-white rounded-2xl mb-4 overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="flex-row">
                  <Image
                    source={{ uri: JSON.parse(profile.images)[0] }}
                    style={{ width: 100, height: 120 }}
                    contentFit="cover"
                  />
                  <View className="flex-1 p-4">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-lg font-bold text-gray-900">{profile.name}, {profile.age}</Text>
                        {profile.isVerified && (
                          <IconSymbol name="checkmark.seal.fill" size={16} color={colors.primary} />
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          if (profile.userId) {
                            router.push(`/chat-conversation?userId=${profile.userId}&userName=${encodeURIComponent(profile.name)}`);
                          } else {
                            Toast.show({
                              type: 'info',
                              text1: 'Chat Unavailable',
                              text2: 'This is a demo profile',
                            });
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                      >
                        <IconSymbol name="message.fill" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-sm text-gray-600 mb-1">{profile.institution}</Text>
                    <Text className="text-sm text-gray-600 mb-2">{profile.course}</Text>
                    <Text className="text-xs text-gray-500" numberOfLines={2}>{profile.bio}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        {/* Likes You Tab - People who liked you */}
        {activeTab === "likes" && (
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-bold text-foreground mb-4">Likes You ({likes.length})</Text>
            {likes.length === 0 ? (
              <View className="flex-1 items-center justify-center py-20">
                <IconSymbol name="heart.fill" size={64} color={colors.mutedForeground} />
                <Text className="text-lg font-semibold text-foreground mt-4">No likes yet</Text>
                <Text className="text-muted-foreground mt-2 text-center px-8">Keep swiping! Someone will like you soon 💕</Text>
              </View>
            ) : (
              likes.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  className="bg-white rounded-2xl mb-4 overflow-hidden"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row">
                    <Image
                      source={{ uri: JSON.parse(profile.images)[0] }}
                      style={{ width: 100, height: 120 }}
                      contentFit="cover"
                    />
                    <View className="flex-1 p-4">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-lg font-bold text-gray-900">{profile.name}, {profile.age}</Text>
                          <IconSymbol name="heart.fill" size={16} color="#ef4444" />
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            if (profile.userId) {
                              router.push(`/chat-conversation?userId=${profile.userId}&userName=${encodeURIComponent(profile.name)}`);
                            } else {
                              Toast.show({
                                type: 'info',
                                text1: 'Chat Unavailable',
                                text2: 'This is a demo profile',
                              });
                            }
                          }}
                          className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
                          style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 3,
                          }}
                        >
                          <IconSymbol name="message.fill" size={18} color="#fff" />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-sm text-gray-600 mb-1">{profile.institution}</Text>
                      <Text className="text-sm text-gray-600">{profile.course}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
        
        {/* Liked Tab - People you liked */}
        {activeTab === "liked" && (
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-bold text-foreground mb-4">You Liked ({liked.length})</Text>
            {liked.length === 0 ? (
              <View className="flex-1 items-center justify-center py-20">
                <IconSymbol name="heart" size={64} color={colors.mutedForeground} />
                <Text className="text-lg font-semibold text-foreground mt-4">No likes yet</Text>
                <Text className="text-muted-foreground mt-2 text-center px-8">Start swiping right on profiles you like!</Text>
              </View>
            ) : (
              liked.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  className="bg-white rounded-2xl mb-4 overflow-hidden"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row">
                    <Image
                      source={{ uri: JSON.parse(profile.images)[0] }}
                      style={{ width: 100, height: 120 }}
                      contentFit="cover"
                    />
                    <View className="flex-1 p-4">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-lg font-bold text-gray-900">{profile.name}, {profile.age}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            if (profile.userId) {
                              router.push(`/chat-conversation?userId=${profile.userId}&userName=${encodeURIComponent(profile.name)}`);
                            } else {
                              Toast.show({
                                type: 'info',
                                text1: 'Chat Unavailable',
                                text2: 'This is a demo profile',
                              });
                            }
                          }}
                          className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
                          style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 3,
                          }}
                        >
                          <IconSymbol name="message.fill" size={18} color="#fff" />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-sm text-gray-600 mb-1">{profile.institution}</Text>
                      <Text className="text-sm text-gray-600">{profile.course}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
        
        {/* Passed Tab - People you passed on */}
        {activeTab === "passed" && (
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-bold text-foreground mb-4">Passed ({passed.length})</Text>
            {passed.length === 0 ? (
              <View className="flex-1 items-center justify-center py-20">
                <IconSymbol name="xmark.circle" size={64} color={colors.mutedForeground} />
                <Text className="text-lg font-semibold text-foreground mt-4">No passes yet</Text>
                <Text className="text-muted-foreground mt-2 text-center px-8">Profiles you swipe left on will appear here</Text>
              </View>
            ) : (
              passed.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  className="bg-white rounded-2xl mb-4 overflow-hidden"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row">
                    <Image
                      source={{ uri: JSON.parse(profile.images)[0] }}
                      style={{ width: 100, height: 120 }}
                      contentFit="cover"
                    />
                    <View className="flex-1 p-4">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-lg font-bold text-gray-900">{profile.name}, {profile.age}</Text>
                      </View>
                      <Text className="text-sm text-gray-600 mb-1">{profile.institution}</Text>
                      <Text className="text-sm text-gray-600">{profile.course}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
        
        {/* Matches Tab - Mutual likes */}
        {activeTab === "matches" && (
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-bold text-foreground mb-4">Matches ({matches.length})</Text>
            {matches.length === 0 ? (
              <View className="flex-1 items-center justify-center py-20">
                <IconSymbol name="sparkles" size={64} color={colors.mutedForeground} />
                <Text className="text-lg font-semibold text-foreground mt-4">No matches yet</Text>
                <Text className="text-muted-foreground mt-2 text-center px-8">When someone you like likes you back, you'll see them here! ✨</Text>
              </View>
            ) : (
              matches.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  onPress={() => {
                    Toast.show({
                      type: "success",
                      text1: "It's a Match! 🎉",
                      text2: `Start chatting with ${profile.name}`,
                    });
                  }}
                  className="bg-white rounded-2xl mb-4 overflow-hidden"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row">
                    <Image
                      source={{ uri: JSON.parse(profile.images)[0] }}
                      style={{ width: 100, height: 120 }}
                      contentFit="cover"
                    />
                  <View className="flex-1 p-4">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-lg font-bold text-gray-900">{profile.name}, {profile.age}</Text>
                        <IconSymbol name="sparkles" size={16} color={colors.primary} />
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          if (profile.userId) {
                            router.push(`/chat-conversation?userId=${profile.userId}&userName=${encodeURIComponent(profile.name)}`);
                          } else {
                            Toast.show({
                              type: 'info',
                              text1: 'Chat Unavailable',
                              text2: 'This is a demo profile',
                            });
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                      >
                        <IconSymbol name="message.fill" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-sm text-gray-600 mb-1">{profile.institution}</Text>
                      <Text className="text-sm text-gray-600 mb-2">{profile.course}</Text>
                      <View className="bg-primary/10 px-3 py-1 rounded-full self-start">
                        <Text className="text-xs font-semibold text-primary">💬 Start Chat</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
        
        {/* Events Tab */}
        {activeTab === "events" && (
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-bold text-foreground mb-4">Campus Dating Events</Text>
            <View className="bg-white rounded-2xl p-6 mb-4">
              <IconSymbol name="calendar" size={48} color={colors.primary} />
              <Text className="text-lg font-bold text-foreground mt-4">Speed Dating Night</Text>
              <Text className="text-sm text-muted-foreground mt-2">Friday, 7:00 PM • Student Union</Text>
              <Text className="text-sm text-foreground mt-3">Meet other students in a fun, fast-paced environment!</Text>
              <TouchableOpacity className="bg-primary py-3 rounded-xl mt-4">
                <Text className="text-white font-bold text-center">Register Now</Text>
              </TouchableOpacity>
            </View>
            <View className="bg-white rounded-2xl p-6 mb-4">
              <IconSymbol name="music.note" size={48} color={colors.primary} />
              <Text className="text-lg font-bold text-foreground mt-4">Singles Mixer</Text>
              <Text className="text-sm text-muted-foreground mt-2">Saturday, 8:00 PM • Campus Bar</Text>
              <Text className="text-sm text-foreground mt-3">Drinks, music, and great vibes. Come meet new people!</Text>
              <TouchableOpacity className="bg-primary py-3 rounded-xl mt-4">
                <Text className="text-white font-bold text-center">Register Now</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
        
        {/* Edit Profile Tab */}
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
