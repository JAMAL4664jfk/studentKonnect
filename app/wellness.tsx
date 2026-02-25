import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";

type TabType = "wellness" | "sports" | "fitness" | "events" | "ai-counsellor";

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: "sports",        label: "Sports Events",   icon: "sportscourt.fill" },
  { key: "events",        label: "Sports Clubs",    icon: "person.3.fill" },
  { key: "fitness",       label: "Fitness Classes", icon: "figure.run" },
  { key: "wellness",      label: "Matches",         icon: "trophy.fill" },
  { key: "ai-counsellor", label: "AI Counsellor",   icon: "brain.head.profile" },
];

type SportsEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  participants: number;
  maxParticipants: number;
};

type SportsClub = {
  id: string;
  name: string;
  sport: string;
  members: number;
  meetingDay: string;
  image: string;
  description: string;
};

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  date: string;
  time: string;
  venue: string;
  image: string;
};

type FitnessClass = {
  id: string;
  name: string;
  instructor: string;
  day: string;
  time: string;
  duration: string;
  level: string;
  image: string;
  spotsLeft: number;
};

const SPORTS_EVENTS: SportsEvent[] = [
  {
    id: "1",
    title: "Inter-Faculty Soccer Tournament",
    date: "2024-03-15",
    time: "14:00",
    location: "Main Sports Field",
    category: "Soccer",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
    participants: 45,
    maxParticipants: 64,
  },
  {
    id: "2",
    title: "Campus Marathon 2024",
    date: "2024-03-20",
    time: "06:00",
    location: "Campus Grounds",
    category: "Athletics",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800",
    participants: 120,
    maxParticipants: 200,
  },
  {
    id: "3",
    title: "Basketball 3v3 Championship",
    date: "2024-03-18",
    time: "16:00",
    location: "Indoor Sports Complex",
    category: "Basketball",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    participants: 32,
    maxParticipants: 48,
  },
  {
    id: "4",
    title: "Swimming Gala",
    date: "2024-03-22",
    time: "10:00",
    location: "Olympic Pool",
    category: "Swimming",
    image: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800",
    participants: 28,
    maxParticipants: 40,
  },
];

const SPORTS_CLUBS: SportsClub[] = [
  {
    id: "1",
    name: "Campus FC",
    sport: "Soccer",
    members: 45,
    meetingDay: "Tuesdays & Thursdays",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    description: "Competitive soccer club for all skill levels",
  },
  {
    id: "2",
    name: "Hoops Society",
    sport: "Basketball",
    members: 32,
    meetingDay: "Mondays & Wednesdays",
    image: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=800",
    description: "Join us for regular basketball training and matches",
  },
  {
    id: "3",
    name: "Tennis Club",
    sport: "Tennis",
    members: 28,
    meetingDay: "Saturdays",
    image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800",
    description: "Improve your tennis skills with coaching and tournaments",
  },
  {
    id: "4",
    name: "Rugby Warriors",
    sport: "Rugby",
    members: 38,
    meetingDay: "Wednesdays & Fridays",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
    description: "Competitive rugby team representing the university",
  },
];

const MATCHES: Match[] = [
  {
    id: "1",
    homeTeam: "Campus FC",
    awayTeam: "City University",
    sport: "Soccer",
    date: "2024-03-16",
    time: "15:00",
    venue: "Main Stadium",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
  },
  {
    id: "2",
    homeTeam: "Hoops Society",
    awayTeam: "Tech Institute",
    sport: "Basketball",
    date: "2024-03-17",
    time: "18:00",
    venue: "Indoor Arena",
    image: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=800",
  },
  {
    id: "3",
    homeTeam: "Rugby Warriors",
    awayTeam: "State College",
    sport: "Rugby",
    date: "2024-03-19",
    time: "16:00",
    venue: "Rugby Field",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
  },
];

const FITNESS_CLASSES: FitnessClass[] = [
  {
    id: "1",
    name: "HIIT Cardio Blast",
    instructor: "Coach Sarah",
    day: "Monday, Wednesday, Friday",
    time: "06:00 - 07:00",
    duration: "60 min",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
    spotsLeft: 5,
  },
  {
    id: "2",
    name: "Yoga Flow",
    instructor: "Instructor Maya",
    day: "Tuesday, Thursday",
    time: "17:00 - 18:00",
    duration: "60 min",
    level: "All Levels",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
    spotsLeft: 8,
  },
  {
    id: "3",
    name: "Strength Training",
    instructor: "Coach Mike",
    day: "Monday, Wednesday, Friday",
    time: "18:00 - 19:00",
    duration: "60 min",
    level: "Beginner to Advanced",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
    spotsLeft: 3,
  },
  {
    id: "4",
    name: "Zumba Dance Fitness",
    instructor: "Instructor Lisa",
    day: "Tuesday, Thursday",
    time: "19:00 - 20:00",
    duration: "60 min",
    level: "All Levels",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
    spotsLeft: 12,
  },
  {
    id: "5",
    name: "Pilates Core",
    instructor: "Instructor Emma",
    day: "Wednesday, Saturday",
    time: "07:00 - 08:00",
    duration: "60 min",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800",
    spotsLeft: 6,
  },
  {
    id: "6",
    name: "Boxing Fitness",
    instructor: "Coach James",
    day: "Tuesday, Thursday, Saturday",
    time: "16:00 - 17:00",
    duration: "60 min",
    level: "All Levels",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800",
    spotsLeft: 4,
  },
];

export default function WellnessScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("sports");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleRegisterEvent = (eventTitle: string) => {
    Toast.show({
      type: "success",
      text1: "Registration Successful",
      text2: `You're registered for ${eventTitle}`,
    });
  };

  const handleJoinClub = (clubName: string) => {
    Toast.show({
      type: "success",
      text1: "Joined Club",
      text2: `Welcome to ${clubName}!`,
    });
  };

  const handleBookClass = (className: string) => {
    Toast.show({
      type: "success",
      text1: "Class Booked",
      text2: `You're booked for ${className}`,
    });
  };

  const renderSportsEvents = () => (
    <View className="gap-4">
      <Text className="text-lg font-semibold text-foreground">Upcoming Sports Events</Text>
      {SPORTS_EVENTS.map((event) => (
        <TouchableOpacity
          key={event.id}
          className="rounded-2xl overflow-hidden border border-border"
        >
          <ImageBackground
            source={{ uri: event.image }}
            className="h-48"
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
              className="flex-1 p-4 justify-end"
            >
              <View className="bg-primary px-3 py-1 rounded-full self-start mb-2">
                <Text className="text-xs font-semibold text-white">{event.category}</Text>
              </View>
              <Text className="text-xl font-bold text-white mb-1">{event.title}</Text>
              <View className="flex-row items-center gap-2 mb-2">
                <IconSymbol name="calendar" size={14} color="white" />
                <Text className="text-sm text-white/90">{event.date} at {event.time}</Text>
              </View>
              <View className="flex-row items-center gap-2 mb-2">
                <IconSymbol name="location.fill" size={14} color="white" />
                <Text className="text-sm text-white/90">{event.location}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <IconSymbol name="person.2.fill" size={14} color="white" />
                <Text className="text-sm text-white/90">
                  {event.participants}/{event.maxParticipants} participants
                </Text>
              </View>
            </LinearGradient>
          </ImageBackground>
          <TouchableOpacity
            onPress={() => handleRegisterEvent(event.title)}
            className="bg-primary p-3 flex-row items-center justify-center gap-2"
          >
            <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
            <Text className="text-sm font-semibold text-white">Register for Event</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSportsClubs = () => (
    <View className="gap-4">
      <Text className="text-lg font-semibold text-foreground">Sports Clubs</Text>
      {SPORTS_CLUBS.map((club) => (
        <TouchableOpacity
          key={club.id}
          className="bg-surface rounded-2xl overflow-hidden border border-border"
        >
          <Image
            source={{ uri: club.image }}
            className="h-40 w-full"
            contentFit="cover"
          />
          <View className="p-4">
            <Text className="text-lg font-bold text-foreground mb-1">{club.name}</Text>
            <Text className="text-sm text-muted mb-3">{club.description}</Text>
            <View className="flex-row items-center gap-4 mb-3">
              <View className="flex-row items-center gap-1">
                <IconSymbol name="sportscourt.fill" size={16} color={colors.primary} />
                <Text className="text-sm text-foreground">{club.sport}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <IconSymbol name="person.2.fill" size={16} color={colors.primary} />
                <Text className="text-sm text-foreground">{club.members} members</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1 mb-3">
              <IconSymbol name="calendar" size={16} color={colors.muted} />
              <Text className="text-sm text-muted">{club.meetingDay}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleJoinClub(club.name)}
              className="bg-primary py-3 rounded-xl flex-row items-center justify-center gap-2"
            >
              <IconSymbol name="plus.circle.fill" size={20} color="white" />
              <Text className="text-sm font-semibold text-white">Join Club</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMatches = () => (
    <View className="gap-4">
      <Text className="text-lg font-semibold text-foreground">Featured Matches</Text>
      {MATCHES.map((match) => (
        <TouchableOpacity
          key={match.id}
          className="rounded-2xl overflow-hidden border border-border"
        >
          <ImageBackground
            source={{ uri: match.image }}
            className="h-56"
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.9)"]}
              className="flex-1 p-4 justify-end"
            >
              <View className="bg-primary px-3 py-1 rounded-full self-start mb-3">
                <Text className="text-xs font-semibold text-white">{match.sport}</Text>
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1 items-center">
                  <Text className="text-lg font-bold text-white">{match.homeTeam}</Text>
                </View>
                <Text className="text-2xl font-bold text-white mx-4">VS</Text>
                <View className="flex-1 items-center">
                  <Text className="text-lg font-bold text-white">{match.awayTeam}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-center gap-4">
                <View className="flex-row items-center gap-1">
                  <IconSymbol name="calendar" size={14} color="white" />
                  <Text className="text-sm text-white/90">{match.date}</Text>
                </View>
                <Text className="text-white/90">•</Text>
                <View className="flex-row items-center gap-1">
                  <IconSymbol name="clock.fill" size={14} color="white" />
                  <Text className="text-sm text-white/90">{match.time}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-center gap-1 mt-2">
                <IconSymbol name="location.fill" size={14} color="white" />
                <Text className="text-sm text-white/90">{match.venue}</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
          <View className="bg-surface p-3 flex-row items-center justify-center gap-2">
            <IconSymbol name="ticket.fill" size={20} color={colors.primary} />
            <Text className="text-sm font-semibold text-primary">Get Tickets</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFitnessClasses = () => (
    <View className="gap-4">
      <Text className="text-lg font-semibold text-foreground">Fitness Classes</Text>
      {FITNESS_CLASSES.map((fitnessClass) => (
        <TouchableOpacity
          key={fitnessClass.id}
          className="bg-surface rounded-2xl overflow-hidden border border-border"
        >
          <Image
            source={{ uri: fitnessClass.image }}
            className="h-48 w-full"
            contentFit="cover"
          />
          <View className="p-4">
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground mb-1">
                  {fitnessClass.name}
                </Text>
                <Text className="text-sm text-muted">with {fitnessClass.instructor}</Text>
              </View>
              <View className="bg-primary/20 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-primary">{fitnessClass.level}</Text>
              </View>
            </View>
            <View className="gap-2 mb-3">
              <View className="flex-row items-center gap-2">
                <IconSymbol name="calendar" size={16} color={colors.muted} />
                <Text className="text-sm text-foreground">{fitnessClass.day}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <IconSymbol name="clock.fill" size={16} color={colors.muted} />
                <Text className="text-sm text-foreground">
                  {fitnessClass.time} ({fitnessClass.duration})
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <IconSymbol name="person.fill" size={16} color={colors.primary} />
                <Text className="text-sm text-primary font-medium">
                  {fitnessClass.spotsLeft} spots left
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleBookClass(fitnessClass.name)}
              className="bg-primary py-3 rounded-xl flex-row items-center justify-center gap-2"
            >
              <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
              <Text className="text-sm font-semibold text-white">Book Class</Text>
            </TouchableOpacity>
          </View>
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
            <Text className="text-2xl font-bold text-foreground">
              Wellness Sports and Entertainment
            </Text>
            <Text className="text-sm text-muted">Health, fitness & campus sports</Text>
          </View>
        </View>

        {/* Tab Dropdown */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => setShowDropdown(!showDropdown)}
            className="bg-surface border border-border rounded-xl px-5 py-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol
                name={TABS.find(t => t.key === activeTab)?.icon as any || "sportscourt.fill"}
                size={20}
                color={colors.primary}
              />
              <Text className="text-base font-semibold text-foreground">
                {TABS.find(t => t.key === activeTab)?.label || "Sports Events"}
              </Text>
            </View>
            <IconSymbol
              name={showDropdown ? "chevron.up" : "chevron.down"}
              size={20}
              color={colors.foreground}
            />
          </TouchableOpacity>
          {showDropdown && (
            <View className="bg-surface border border-border rounded-xl mt-2 overflow-hidden">
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => { setActiveTab(tab.key); setShowDropdown(false); }}
                  className={`px-5 py-4 flex-row items-center gap-3 ${
                    activeTab === tab.key ? "bg-primary/10" : ""
                  }`}
                >
                  <IconSymbol
                    name={tab.icon as any}
                    size={20}
                    color={activeTab === tab.key ? colors.primary : colors.foreground}
                  />
                  <Text
                    className={`text-base font-semibold ${
                      activeTab === tab.key ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {tab.label}
                  </Text>
                  {activeTab === tab.key && (
                    <View style={{ marginLeft: "auto" as any }}>
                      <IconSymbol name="checkmark" size={16} color={colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {activeTab === "sports" && renderSportsEvents()}
          {activeTab === "events" && renderSportsClubs()}
          {activeTab === "fitness" && renderFitnessClasses()}
            {activeTab === "wellness" && renderMatches()}
          {activeTab === "ai-counsellor" && (
            <View className="gap-4">
              <Text className="text-lg font-bold text-foreground mb-2">AI Wellness Counsellors</Text>
              <Text className="text-sm text-muted mb-4">Confidential AI support available 24/7. Choose a counsellor below.</Text>
              {[
                { type: "mental", name: "MindMate", emoji: "🧠", color: "#8B5CF6", desc: "Mental Health & Emotional Support", detail: "Stress, anxiety, depression, and emotional wellbeing" },
                { type: "financial", name: "FinanceGuru", emoji: "💰", color: "#10B981", desc: "Financial Coaching & Budgeting", detail: "NSFAS, budgeting, savings, and money management" },
                { type: "academic", name: "StudyBuddy", emoji: "📚", color: "#F59E0B", desc: "Academic Support & Study Planning", detail: "Study planning, exam prep, and time management" },
              ].map((c) => (
                <TouchableOpacity
                  key={c.type}
                  onPress={() => router.push(`/ai-counsellor?type=${c.type}` as any)}
                  className="rounded-2xl p-5 border border-border"
                  style={{ backgroundColor: c.color + "15" }}
                >
                  <View className="flex-row items-center gap-4">
                    <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: c.color + "25" }}>
                      <Text style={{ fontSize: 28 }}>{c.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-foreground">{c.name}</Text>
                      <Text className="text-sm font-medium mb-1" style={{ color: c.color }}>{c.desc}</Text>
                      <Text className="text-xs text-muted">{c.detail}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color={c.color} />
                  </View>
                </TouchableOpacity>
              ))}
              <View className="rounded-2xl p-4 border border-border bg-surface mt-2">
                <View className="flex-row items-center gap-2 mb-2">
                  <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
                  <Text className="text-sm font-semibold text-foreground">Emergency Support</Text>
                </View>
                <Text className="text-xs text-muted mb-1">Lifeline SA: 0800 567 567 (24/7)</Text>
                <Text className="text-xs text-muted mb-1">SADAG: 0800 456 789</Text>
                <Text className="text-xs text-muted">Campus Health Centre: Visit your nearest student health centre</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
