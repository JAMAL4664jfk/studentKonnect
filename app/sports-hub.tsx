import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Types ───────────────────────────────────────────────────────────────────
type TabType = "fixtures" | "leagues" | "fitness" | "esports";

interface Fixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  sport: string;
  venue: string;
  date: string;
  time: string;
  status: "live" | "upcoming" | "completed";
}

interface LeagueTeam {
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  logo?: string;
}

interface League {
  id: string;
  name: string;
  sport: string;
  teams: LeagueTeam[];
}

interface FitnessChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  dailyGoal: string;
  progress: number;
  participants: number;
  prize: string;
  daysLeft: number;
  emoji: string;
  imageUrl: string;
}

interface EsportsTournament {
  id: string;
  title: string;
  game: string;
  format: string;
  prizePool: string;
  maxTeams: number;
  registeredTeams: number;
  startDate: string;
  platform: string;
  imageUrl: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────
const CAMPUS_FIXTURES: Fixture[] = [
  {
    id: "f1",
    homeTeam: "UCT Ikeys",
    awayTeam: "Wits Bucks",
    homeScore: 2,
    awayScore: 1,
    sport: "Football",
    venue: "UCT Sports Complex",
    date: "2026-02-24",
    time: "15:00",
    status: "live",
  },
  {
    id: "f2",
    homeTeam: "UJ Panthers",
    awayTeam: "TUT Tigers",
    homeScore: null,
    awayScore: null,
    sport: "Basketball",
    venue: "UJ Indoor Arena",
    date: "2026-02-25",
    time: "14:00",
    status: "upcoming",
  },
  {
    id: "f3",
    homeTeam: "Stellenbosch Maties",
    awayTeam: "UKZN Impi",
    homeScore: 28,
    awayScore: 14,
    sport: "Rugby",
    venue: "Danie Craven Stadium",
    date: "2026-02-22",
    time: "16:00",
    status: "completed",
  },
  {
    id: "f4",
    homeTeam: "UP Tuks",
    awayTeam: "NWU Eagles",
    homeScore: null,
    awayScore: null,
    sport: "Cricket",
    venue: "Tuks Cricket Oval",
    date: "2026-02-26",
    time: "10:00",
    status: "upcoming",
  },
  {
    id: "f5",
    homeTeam: "NMMU Warriors",
    awayTeam: "Rhodes Strikers",
    homeScore: 3,
    awayScore: 3,
    sport: "Netball",
    venue: "NMMU Sports Hall",
    date: "2026-02-24",
    time: "13:00",
    status: "live",
  },
  {
    id: "f6",
    homeTeam: "DUT Dolphins",
    awayTeam: "MUT Lions",
    homeScore: null,
    awayScore: null,
    sport: "Football",
    venue: "DUT Sports Ground",
    date: "2026-02-27",
    time: "15:30",
    status: "upcoming",
  },
];

const CAMPUS_LEAGUES: League[] = [
  {
    id: "football",
    name: "USSA Football League",
    sport: "Football",
    teams: [
      { name: "UCT Ikeys", played: 10, won: 8, drawn: 1, lost: 1, points: 25 },
      { name: "Wits Bucks", played: 10, won: 7, drawn: 2, lost: 1, points: 23 },
      { name: "UJ Panthers", played: 10, won: 6, drawn: 1, lost: 3, points: 19 },
      { name: "Stellenbosch", played: 10, won: 5, drawn: 2, lost: 3, points: 17 },
      { name: "UP Tuks", played: 10, won: 4, drawn: 2, lost: 4, points: 14 },
      { name: "UKZN Impi", played: 10, won: 3, drawn: 1, lost: 6, points: 10 },
      { name: "DUT Dolphins", played: 10, won: 2, drawn: 2, lost: 6, points: 8 },
      { name: "TUT Tigers", played: 10, won: 1, drawn: 1, lost: 8, points: 4 },
    ],
  },
  {
    id: "basketball",
    name: "USSA Basketball League",
    sport: "Basketball",
    teams: [
      { name: "UP Tuks", played: 8, won: 7, drawn: 0, lost: 1, points: 21 },
      { name: "UCT Ikeys", played: 8, won: 6, drawn: 0, lost: 2, points: 18 },
      { name: "Wits Bucks", played: 8, won: 5, drawn: 0, lost: 3, points: 15 },
      { name: "UJ Panthers", played: 8, won: 4, drawn: 0, lost: 4, points: 12 },
      { name: "UKZN Impi", played: 8, won: 2, drawn: 0, lost: 6, points: 6 },
    ],
  },
  {
    id: "rugby",
    name: "USSA Rugby League",
    sport: "Rugby",
    teams: [
      { name: "Stellenbosch Maties", played: 9, won: 8, drawn: 0, lost: 1, points: 24 },
      { name: "UP Tuks", played: 9, won: 7, drawn: 0, lost: 2, points: 21 },
      { name: "UCT Ikeys", played: 9, won: 5, drawn: 1, lost: 3, points: 16 },
      { name: "Wits Bucks", played: 9, won: 4, drawn: 0, lost: 5, points: 12 },
      { name: "NWU Eagles", played: 9, won: 2, drawn: 1, lost: 6, points: 7 },
    ],
  },
];

const FITNESS_CHALLENGES: FitnessChallenge[] = [
  {
    id: "fc1",
    title: "30-Day Running Challenge",
    category: "Running",
    difficulty: "Beginner",
    dailyGoal: "5km per day",
    progress: 60,
    participants: 1240,
    prize: "R500 Takealot voucher",
    daysLeft: 12,
    emoji: "🏃",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
  },
  {
    id: "fc2",
    title: "Campus Cycling Sprint",
    category: "Cycling",
    difficulty: "Intermediate",
    dailyGoal: "20km per day",
    progress: 35,
    participants: 680,
    prize: "R1000 Sportsmans Warehouse",
    daysLeft: 18,
    emoji: "🚴",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  },
  {
    id: "fc3",
    title: "100 Push-Up Challenge",
    category: "Fitness",
    difficulty: "Advanced",
    dailyGoal: "100 push-ups per day",
    progress: 80,
    participants: 2100,
    prize: "R750 gym membership",
    daysLeft: 5,
    emoji: "💪",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
  },
  {
    id: "fc4",
    title: "Swim 10km Challenge",
    category: "Swimming",
    difficulty: "Intermediate",
    dailyGoal: "500m per day",
    progress: 45,
    participants: 420,
    prize: "R600 TotalSports voucher",
    daysLeft: 22,
    emoji: "🏊",
    imageUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&q=80",
  },
  {
    id: "fc5",
    title: "Yoga & Mindfulness",
    category: "Wellness",
    difficulty: "Beginner",
    dailyGoal: "30 min session",
    progress: 70,
    participants: 3200,
    prize: "R400 wellness hamper",
    daysLeft: 8,
    emoji: "🧘",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
  },
];

const ESPORTS_TOURNAMENTS: EsportsTournament[] = [
  {
    id: "es1",
    title: "USSA FIFA 25 Championship",
    game: "FIFA 25",
    format: "1v1 Knockout",
    prizePool: "R5,000",
    maxTeams: 64,
    registeredTeams: 48,
    startDate: "2026-03-01",
    platform: "PS5 / Xbox",
    imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&q=80",
  },
  {
    id: "es2",
    title: "Valorant Campus Cup",
    game: "Valorant",
    format: "5v5 Teams",
    prizePool: "R8,000",
    maxTeams: 16,
    registeredTeams: 10,
    startDate: "2026-03-08",
    platform: "PC",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80",
  },
  {
    id: "es3",
    title: "eFootball League SA",
    game: "eFootball 2025",
    format: "Round Robin + Finals",
    prizePool: "R3,500",
    maxTeams: 32,
    registeredTeams: 20,
    startDate: "2026-03-15",
    platform: "PS5 / Mobile",
    imageUrl: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=400&q=80",
  },
  {
    id: "es4",
    title: "Call of Duty Warzone Invitational",
    game: "Call of Duty: Warzone",
    format: "Squads (4-player)",
    prizePool: "R6,000",
    maxTeams: 20,
    registeredTeams: 14,
    startDate: "2026-03-20",
    platform: "PC / Console",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80",
  },
];

const LEADERBOARD = [
  { rank: 1, name: "Thabo M.", uni: "UJ", points: 15420, badge: "🥇" },
  { rank: 2, name: "Sarah K.", uni: "UCT", points: 14850, badge: "🥈" },
  { rank: 3, name: "James N.", uni: "Wits", points: 14200, badge: "🥉" },
  { rank: 4, name: "Priya S.", uni: "UKZN", points: 13900, badge: "4" },
  { rank: 5, name: "Michael O.", uni: "Stellenbosch", points: 13650, badge: "5" },
];

const SPORT_EMOJIS: Record<string, string> = {
  Football: "⚽",
  Rugby: "🏉",
  Netball: "🏐",
  Cricket: "🏏",
  Basketball: "🏀",
  Hockey: "🏑",
  Athletics: "🏃",
  Running: "🏅",
  Swimming: "🏊",
  Cycling: "🚴",
  Esports: "🎮",
  Wellness: "🧘",
  Fitness: "💪",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function SportsHubScreen() {
  const colors = useColors();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("fixtures");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  // Fixtures state
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [alertedFixtures, setAlertedFixtures] = useState<string[]>([]);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  // Leagues state
  const [selectedLeague, setSelectedLeague] = useState("football");

  // Fitness state
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([]);

  // Esports state
  const [registeredTournaments, setRegisteredTournaments] = useState<string[]>([]);

  useEffect(() => {
    loadCurrentUser();
    loadUserData();
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user } } = await safeGetUser();
    setCurrentUser(user);
  };

  const loadUserData = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (!user) return;
      // Load joined challenges from Supabase
      const { data: challenges } = await supabase
        .from("fitness_challenge_participants")
        .select("challenge_id")
        .eq("user_id", user.id);
      if (challenges) setJoinedChallenges(challenges.map((c: any) => c.challenge_id));

      // Load registered tournaments
      const { data: tournaments } = await supabase
        .from("esports_registrations")
        .select("tournament_id")
        .eq("user_id", user.id);
      if (tournaments) setRegisteredTournaments(tournaments.map((t: any) => t.tournament_id));

      // Load fixture alerts
      const { data: alerts } = await supabase
        .from("fixture_alerts")
        .select("fixture_id")
        .eq("user_id", user.id);
      if (alerts) setAlertedFixtures(alerts.map((a: any) => a.fixture_id));
    } catch (e) {
      // silently fail — static data still shows
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, []);

  const toggleSportFilter = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleSetAlert = async (fixture: Fixture) => {
    if (!currentUser) {
      Toast.show({ type: "info", text1: "Sign in to set alerts" });
      return;
    }
    const alreadySet = alertedFixtures.includes(fixture.id);
    if (alreadySet) {
      await supabase
        .from("fixture_alerts")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("fixture_id", fixture.id);
      setAlertedFixtures((prev) => prev.filter((id) => id !== fixture.id));
      Toast.show({ type: "success", text1: "Alert removed" });
    } else {
      await supabase.from("fixture_alerts").insert({
        user_id: currentUser.id,
        fixture_id: fixture.id,
        fixture_label: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      });
      setAlertedFixtures((prev) => [...prev, fixture.id]);
      Toast.show({ type: "success", text1: "Alert set!", text2: `You'll be notified for ${fixture.homeTeam} vs ${fixture.awayTeam}` });
    }
  };

  const handleJoinChallenge = async (challenge: FitnessChallenge) => {
    if (!currentUser) {
      Toast.show({ type: "info", text1: "Sign in to join challenges" });
      return;
    }
    if (joinedChallenges.includes(challenge.id)) return;
    try {
      await supabase.from("fitness_challenge_participants").insert({
        user_id: currentUser.id,
        challenge_id: challenge.id,
        challenge_title: challenge.title,
      });
      setJoinedChallenges((prev) => [...prev, challenge.id]);
      Toast.show({ type: "success", text1: "Joined!", text2: `You joined ${challenge.title}` });
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Error joining challenge", text2: e.message });
    }
  };

  const handleRegisterEsports = async (tournament: EsportsTournament) => {
    if (!currentUser) {
      Toast.show({ type: "info", text1: "Sign in to register" });
      return;
    }
    if (registeredTournaments.includes(tournament.id)) return;
    try {
      await supabase.from("esports_registrations").insert({
        user_id: currentUser.id,
        tournament_id: tournament.id,
        tournament_title: tournament.title,
      });
      setRegisteredTournaments((prev) => [...prev, tournament.id]);
      Toast.show({ type: "success", text1: "Registered!", text2: `You're registered for ${tournament.title}` });
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Error registering", text2: e.message });
    }
  };

  // ─── Filtered Data ──────────────────────────────────────────────────────────
  const query = searchQuery.toLowerCase();
  const allSports = [...new Set(CAMPUS_FIXTURES.map((f) => f.sport))];

  const filteredFixtures = CAMPUS_FIXTURES.filter((f) => {
    const matchesSearch =
      !query ||
      f.homeTeam.toLowerCase().includes(query) ||
      f.awayTeam.toLowerCase().includes(query) ||
      f.sport.toLowerCase().includes(query) ||
      f.venue.toLowerCase().includes(query);
    const matchesSport = selectedSports.length === 0 || selectedSports.includes(f.sport);
    return matchesSearch && matchesSport;
  });

  const liveFixtures = filteredFixtures.filter((f) => f.status === "live");
  const upcomingFixtures = filteredFixtures.filter((f) => f.status === "upcoming");
  const completedFixtures = filteredFixtures.filter((f) => f.status === "completed");

  const currentLeague = CAMPUS_LEAGUES.find((l) => l.id === selectedLeague) || CAMPUS_LEAGUES[0];

  const filteredChallenges = FITNESS_CHALLENGES.filter(
    (c) =>
      !query ||
      c.title.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.difficulty.toLowerCase().includes(query)
  );

  const filteredTournaments = ESPORTS_TOURNAMENTS.filter(
    (t) =>
      !query ||
      t.title.toLowerCase().includes(query) ||
      t.game.toLowerCase().includes(query) ||
      t.platform.toLowerCase().includes(query)
  );

  // ─── Render Helpers ─────────────────────────────────────────────────────────
  const renderFixtureCard = (fixture: Fixture) => {
    const isLive = fixture.status === "live";
    const isUpcoming = fixture.status === "upcoming";
    const isAlerted = alertedFixtures.includes(fixture.id);

    return (
      <TouchableOpacity
        key={fixture.id}
        onPress={() => setSelectedFixture(fixture)}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: isLive ? 2 : 1,
          borderColor: isLive ? "#22c55e" : colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {/* Status badge */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 18 }}>{SPORT_EMOJIS[fixture.sport] || "🏆"}</Text>
            <Text style={{ fontSize: 13, color: colors.muted }}>{fixture.sport}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {isLive && (
              <View style={{ backgroundColor: "#22c55e", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>● LIVE</Text>
              </View>
            )}
            {isUpcoming && (
              <TouchableOpacity
                onPress={() => handleSetAlert(fixture)}
                style={{
                  backgroundColor: isAlerted ? colors.primary : "transparent",
                  borderWidth: 1,
                  borderColor: colors.primary,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <IconSymbol name={isAlerted ? "bell.fill" : "bell"} size={11} color={isAlerted ? "#fff" : colors.primary} />
                <Text style={{ color: isAlerted ? "#fff" : colors.primary, fontSize: 11, fontWeight: "600" }}>
                  {isAlerted ? "Alert set" : "Set alert"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Teams & Score */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, textAlign: "center" }}>{fixture.homeTeam}</Text>
            <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>Home</Text>
          </View>
          <View style={{ alignItems: "center", paddingHorizontal: 16 }}>
            {fixture.homeScore !== null ? (
              <Text style={{ fontSize: 28, fontWeight: "800", color: isLive ? "#22c55e" : colors.foreground }}>
                {fixture.homeScore} – {fixture.awayScore}
              </Text>
            ) : (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.primary }}>{fixture.time}</Text>
                <Text style={{ fontSize: 11, color: colors.muted }}>{new Date(fixture.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, textAlign: "center" }}>{fixture.awayTeam}</Text>
            <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>Away</Text>
          </View>
        </View>

        {/* Venue */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 4 }}>
          <IconSymbol name="mappin" size={12} color={colors.muted} />
          <Text style={{ fontSize: 12, color: colors.muted }}>{fixture.venue}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFixturesTab = () => (
    <View>
      {/* Sport filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 4 }}>
          <TouchableOpacity
            onPress={() => setSelectedSports([])}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: selectedSports.length === 0 ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: selectedSports.length === 0 ? colors.primary : colors.border,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: selectedSports.length === 0 ? "#fff" : colors.foreground }}>All</Text>
          </TouchableOpacity>
          {allSports.map((sport) => (
            <TouchableOpacity
              key={sport}
              onPress={() => toggleSportFilter(sport)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: selectedSports.includes(sport) ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: selectedSports.includes(sport) ? colors.primary : colors.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 14 }}>{SPORT_EMOJIS[sport] || "🏆"}</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: selectedSports.includes(sport) ? "#fff" : colors.foreground }}>{sport}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Live fixtures */}
      {liveFixtures.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>Live Now</Text>
          </View>
          {liveFixtures.map(renderFixtureCard)}
        </View>
      )}

      {/* Upcoming fixtures */}
      {upcomingFixtures.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>Upcoming</Text>
          {upcomingFixtures.map(renderFixtureCard)}
        </View>
      )}

      {/* Completed fixtures */}
      {completedFixtures.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>Recent Results</Text>
          {completedFixtures.map(renderFixtureCard)}
        </View>
      )}

      {filteredFixtures.length === 0 && (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
          <Text style={{ fontSize: 16, color: colors.muted }}>No fixtures found</Text>
        </View>
      )}
    </View>
  );

  const renderLeaguesTab = () => (
    <View>
      {/* League selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 4 }}>
          {CAMPUS_LEAGUES.map((league) => (
            <TouchableOpacity
              key={league.id}
              onPress={() => setSelectedLeague(league.id)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: selectedLeague === league.id ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: selectedLeague === league.id ? colors.primary : colors.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 14 }}>{SPORT_EMOJIS[league.sport] || "🏆"}</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: selectedLeague === league.id ? "#fff" : colors.foreground }}>{league.sport}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* League table */}
      {currentLeague && (
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}>
          {/* Header */}
          <View style={{ backgroundColor: colors.primary, padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>{currentLeague.name}</Text>
          </View>

          {/* Table header */}
          <View style={{ flexDirection: "row", paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ flex: 1, fontSize: 12, fontWeight: "700", color: colors.muted }}>#</Text>
            <Text style={{ flex: 3, fontSize: 12, fontWeight: "700", color: colors.muted }}>Team</Text>
            <Text style={{ width: 28, fontSize: 12, fontWeight: "700", color: colors.muted, textAlign: "center" }}>P</Text>
            <Text style={{ width: 28, fontSize: 12, fontWeight: "700", color: colors.muted, textAlign: "center" }}>W</Text>
            <Text style={{ width: 28, fontSize: 12, fontWeight: "700", color: colors.muted, textAlign: "center" }}>D</Text>
            <Text style={{ width: 28, fontSize: 12, fontWeight: "700", color: colors.muted, textAlign: "center" }}>L</Text>
            <Text style={{ width: 36, fontSize: 12, fontWeight: "700", color: colors.primary, textAlign: "center" }}>Pts</Text>
          </View>

          {/* Table rows */}
          {currentLeague.teams.map((team, index) => (
            <View
              key={team.name}
              style={{
                flexDirection: "row",
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderBottomWidth: index < currentLeague.teams.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
                backgroundColor: index < 3 ? `${colors.primary}08` : "transparent",
              }}
            >
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: index < 3 ? colors.primary : colors.muted }}>
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`}
                </Text>
              </View>
              <Text style={{ flex: 3, fontSize: 13, fontWeight: "600", color: colors.foreground }}>{team.name}</Text>
              <Text style={{ width: 28, fontSize: 13, color: colors.muted, textAlign: "center" }}>{team.played}</Text>
              <Text style={{ width: 28, fontSize: 13, color: "#22c55e", textAlign: "center", fontWeight: "600" }}>{team.won}</Text>
              <Text style={{ width: 28, fontSize: 13, color: colors.muted, textAlign: "center" }}>{team.drawn}</Text>
              <Text style={{ width: 28, fontSize: 13, color: "#ef4444", textAlign: "center" }}>{team.lost}</Text>
              <Text style={{ width: 36, fontSize: 14, fontWeight: "800", color: colors.primary, textAlign: "center" }}>{team.points}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderFitnessTab = () => (
    <View>
      {filteredChallenges.map((challenge) => {
        const joined = joinedChallenges.includes(challenge.id);
        return (
          <View
            key={challenge.id}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              marginBottom: 16,
              overflow: "hidden",
              borderWidth: joined ? 2 : 1,
              borderColor: joined ? "#f97316" : colors.border,
            }}
          >
            {/* Image */}
            <View style={{ height: 120, position: "relative" }}>
              <Image
                source={{ uri: challenge.imageUrl }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
              <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)" }} />
              <View style={{ position: "absolute", top: 10, right: 10, flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                <View style={{ backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                  <Text style={{ color: "#fff", fontSize: 11 }}>⏱ {challenge.daysLeft} days left</Text>
                </View>
                {joined && (
                  <View style={{ backgroundColor: "#f97316", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>Joined ✓</Text>
                  </View>
                )}
              </View>
              <Text style={{ position: "absolute", bottom: 10, left: 14, fontSize: 32 }}>{challenge.emoji}</Text>
            </View>

            {/* Content */}
            <View style={{ padding: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 2 }}>{challenge.title}</Text>
              <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>{challenge.category} • {challenge.difficulty}</Text>

              <View style={{ gap: 8, marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: colors.muted }}>Daily Goal</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>{challenge.dailyGoal}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: colors.muted }}>Progress</Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#f97316" }}>{joined ? challenge.progress : 0}%</Text>
                </View>
                {/* Progress bar */}
                <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3 }}>
                  <View style={{ height: 6, backgroundColor: "#f97316", borderRadius: 3, width: `${joined ? challenge.progress : 0}%` }} />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: colors.muted }}>Participants</Text>
                  <Text style={{ fontSize: 13, color: colors.foreground }}>{challenge.participants.toLocaleString()}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: colors.muted }}>Prize</Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#22c55e" }}>{challenge.prize}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleJoinChallenge(challenge)}
                disabled={joined}
                style={{
                  backgroundColor: joined ? colors.border : "#f97316",
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 16 }}>🔥</Text>
                <Text style={{ color: joined ? colors.muted : "#fff", fontWeight: "700", fontSize: 14 }}>
                  {joined ? "Joined ✓" : "Join Challenge"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Leaderboard */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: colors.border, marginTop: 8 }}>
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>👑 Campus Fitness Leaderboard</Text>
        </View>
        {LEADERBOARD.map((entry) => (
          <View
            key={entry.rank}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              borderBottomWidth: entry.rank < LEADERBOARD.length ? 1 : 0,
              borderBottomColor: colors.border,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 22, width: 36, textAlign: "center" }}>{entry.badge}</Text>
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: colors.primary,
              alignItems: "center", justifyContent: "center",
            }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{entry.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{entry.name}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{entry.uni}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: colors.primary }}>{entry.points.toLocaleString()}</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>points</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderEsportsTab = () => (
    <View>
      {filteredTournaments.map((tournament) => {
        const registered = registeredTournaments.includes(tournament.id);
        const spotsLeft = tournament.maxTeams - tournament.registeredTeams;
        const fillPercent = (tournament.registeredTeams / tournament.maxTeams) * 100;

        return (
          <View
            key={tournament.id}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              marginBottom: 16,
              overflow: "hidden",
              borderWidth: registered ? 2 : 1,
              borderColor: registered ? colors.primary : colors.border,
            }}
          >
            {/* Image */}
            <View style={{ height: 130, position: "relative" }}>
              <Image
                source={{ uri: tournament.imageUrl }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
              <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)" }} />
              <View style={{ position: "absolute", top: 10, right: 10 }}>
                {registered && (
                  <View style={{ backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Registered ✓</Text>
                  </View>
                )}
              </View>
              <View style={{ position: "absolute", bottom: 12, left: 14 }}>
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>{tournament.title}</Text>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>🎮 {tournament.game}</Text>
              </View>
            </View>

            {/* Content */}
            <View style={{ padding: 14 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {[
                  { icon: "🏆", label: tournament.prizePool },
                  { icon: "👥", label: tournament.format },
                  { icon: "💻", label: tournament.platform },
                  { icon: "📅", label: new Date(tournament.startDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short" }) },
                ].map((item, i) => (
                  <View key={i} style={{ backgroundColor: `${colors.primary}15`, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexDirection: "row", gap: 4, alignItems: "center" }}>
                    <Text style={{ fontSize: 13 }}>{item.icon}</Text>
                    <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "600" }}>{item.label}</Text>
                  </View>
                ))}
              </View>

              {/* Registration progress */}
              <View style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, color: colors.muted }}>Teams registered</Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: spotsLeft <= 5 ? "#ef4444" : colors.foreground }}>
                    {tournament.registeredTeams}/{tournament.maxTeams} {spotsLeft <= 5 ? `(${spotsLeft} spots left!)` : ""}
                  </Text>
                </View>
                <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3 }}>
                  <View style={{ height: 6, backgroundColor: spotsLeft <= 5 ? "#ef4444" : colors.primary, borderRadius: 3, width: `${fillPercent}%` }} />
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleRegisterEsports(tournament)}
                disabled={registered}
                style={{
                  backgroundColor: registered ? colors.border : colors.primary,
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 16 }}>🎮</Text>
                <Text style={{ color: registered ? colors.muted : "#fff", fontWeight: "700", fontSize: 14 }}>
                  {registered ? "Registered ✓" : "Register Now"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );

  const TABS: { key: TabType; label: string; icon: string; color: string }[] = [
    { key: "fixtures", label: "Fixtures", icon: "⚽", color: "#22c55e" },
    { key: "leagues", label: "Leagues", icon: "🏆", color: "#3b82f6" },
    { key: "fitness", label: "Fitness", icon: "🔥", color: "#f97316" },
    { key: "esports", label: "Esports", icon: "🎮", color: "#8b5cf6" },
  ];

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: colors.foreground }}>Sports Hub</Text>
            <Text style={{ fontSize: 13, color: colors.muted }}>Campus sports, leagues & fitness</Text>
          </View>
          <Text style={{ fontSize: 28 }}>🏟️</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => { setActiveTab(tab.key); setSearchQuery(""); }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderRadius: 22,
                    backgroundColor: isActive ? tab.color : colors.surface,
                    borderWidth: 1,
                    borderColor: isActive ? tab.color : colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 15 }}>{tab.icon}</Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: isActive ? "#fff" : colors.foreground }}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Search bar */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 12,
          gap: 8,
        }}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor={colors.muted}
            style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: colors.foreground }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "fixtures" && renderFixturesTab()}
        {activeTab === "leagues" && renderLeaguesTab()}
        {activeTab === "fitness" && renderFitnessTab()}
        {activeTab === "esports" && renderEsportsTab()}
      </ScrollView>

      {/* Fixture detail modal */}
      <Modal visible={!!selectedFixture} transparent animationType="slide" onRequestClose={() => setSelectedFixture(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            {selectedFixture && (
              <>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: colors.foreground }}>Match Details</Text>
                  <TouchableOpacity onPress={() => setSelectedFixture(null)}>
                    <IconSymbol name="xmark.circle.fill" size={24} color={colors.muted} />
                  </TouchableOpacity>
                </View>

                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>{SPORT_EMOJIS[selectedFixture.sport] || "🏆"}</Text>
                  <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>{selectedFixture.sport}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, flex: 1, textAlign: "right" }}>{selectedFixture.homeTeam}</Text>
                    <Text style={{ fontSize: 28, fontWeight: "800", color: selectedFixture.status === "live" ? "#22c55e" : colors.foreground }}>
                      {selectedFixture.homeScore !== null ? `${selectedFixture.homeScore} – ${selectedFixture.awayScore}` : "vs"}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, flex: 1, textAlign: "left" }}>{selectedFixture.awayTeam}</Text>
                  </View>
                </View>

                {[
                  { icon: "mappin", label: "Venue", value: selectedFixture.venue },
                  { icon: "calendar", label: "Date", value: new Date(selectedFixture.date).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" }) },
                  { icon: "clock", label: "Time", value: selectedFixture.time },
                ].map((item) => (
                  <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <IconSymbol name={item.icon as any} size={18} color={colors.primary} />
                    <Text style={{ fontSize: 14, color: colors.muted, width: 60 }}>{item.label}</Text>
                    <Text style={{ fontSize: 14, color: colors.foreground, fontWeight: "600", flex: 1 }}>{item.value}</Text>
                  </View>
                ))}

                {selectedFixture.status === "upcoming" && (
                  <TouchableOpacity
                    onPress={() => { handleSetAlert(selectedFixture); setSelectedFixture(null); }}
                    style={{ backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 8, flexDirection: "row", justifyContent: "center", gap: 8 }}
                  >
                    <IconSymbol name={alertedFixtures.includes(selectedFixture.id) ? "bell.fill" : "bell"} size={18} color="#fff" />
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                      {alertedFixtures.includes(selectedFixture.id) ? "Remove Alert" : "Set Match Alert"}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
