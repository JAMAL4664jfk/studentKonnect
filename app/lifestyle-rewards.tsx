import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { walletAPI, type Voucher } from "@/lib/wallet-api";

export default function LifestyleRewardsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [selectedTab, setSelectedTab] = useState("rewards");
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const useWalletAPI = process.env.EXPO_PUBLIC_USE_WALLET_API === 'true';

  // Load vouchers from Wallet API
  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    if (!useWalletAPI) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await walletAPI.getVouchers();
      setVouchers(data);
    } catch (error) {
      console.error('Error loading vouchers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data
  const stats = {
    points: 2450,
    badges: 12,
    streak: 7,
    level: 5,
  };

  // Convert API vouchers to rewards format or use mock data
  const rewards = useWalletAPI && vouchers.length > 0
    ? vouchers.map((v, i) => ({
        id: v.id,
        title: v.title,
        points: v.points,
        icon: getVoucherIcon(v.title),
        color: getVoucherColor(i),
        available: v.status === 'active',
      }))
    : [
        {
          id: "1",
          title: "Free Coffee",
          points: 500,
          icon: "cup.and.saucer.fill",
          color: "#8B5CF6",
          available: true,
        },
        {
          id: "2",
          title: "10% Bookstore Discount",
          points: 750,
          icon: "book.fill",
          color: "#3B82F6",
          available: true,
        },
        {
          id: "3",
          title: "Free Gym Day Pass",
          points: 1000,
          icon: "figure.run",
          color: "#10B981",
          available: true,
        },
        {
          id: "4",
          title: "Premium Account (1 Month)",
          points: 2000,
          icon: "star.fill",
          color: "#F59E0B",
          available: true,
        },
        {
          id: "5",
          title: "Free Movie Ticket",
          points: 3000,
          icon: "film.fill",
          color: "#EF4444",
          available: false,
        },
      ];

  const getVoucherIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('coffee')) return 'cup.and.saucer.fill';
    if (lower.includes('book')) return 'book.fill';
    if (lower.includes('gym') || lower.includes('fitness')) return 'figure.run';
    if (lower.includes('movie') || lower.includes('film')) return 'film.fill';
    if (lower.includes('premium') || lower.includes('star')) return 'star.fill';
    return 'gift.fill';
  };

  const getVoucherColor = (index: number) => {
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#FF6B9D'];
    return colors[index % colors.length];
  };

  const badges = [
    { name: "Early Bird", icon: "sunrise.fill", color: "#F59E0B" },
    { name: "Social Butterfly", icon: "person.3.fill", color: "#FF6B9D" },
    { name: "Bookworm", icon: "book.fill", color: "#8B5CF6" },
    { name: "Fitness Guru", icon: "figure.run", color: "#10B981" },
    { name: "Top Seller", icon: "star.fill", color: "#3B82F6" },
    { name: "Helpful Hand", icon: "hand.thumbsup.fill", color: "#06B6D4" },
  ];

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-6 pb-4 border-b border-border">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Lifestyle Rewards</Text>
            <View className="w-10" />
          </View>

          {/* Tab Selector */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setSelectedTab("rewards")}
              className={`flex-1 py-2 rounded-xl ${
                selectedTab === "rewards" ? "bg-primary" : "bg-surface"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  selectedTab === "rewards" ? "text-white" : "text-muted"
                }`}
              >
                Rewards
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab("badges")}
              className={`flex-1 py-2 rounded-xl ${
                selectedTab === "badges" ? "bg-primary" : "bg-surface"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  selectedTab === "badges" ? "text-white" : "text-muted"
                }`}
              >
                Badges
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4">
          {/* Stats Overview */}
          <View className="py-6">
            <View className="flex-row flex-wrap gap-3 mb-6">
              <View className="flex-1 min-w-[45%] bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20">
                <IconSymbol name="star.fill" size={24} color="#8B5CF6" />
                <Text className="text-2xl font-bold text-foreground mt-2">
                  {stats.points}
                </Text>
                <Text className="text-sm text-muted">Points</Text>
              </View>

              <View className="flex-1 min-w-[45%] bg-pink-500/10 rounded-2xl p-4 border border-pink-500/20">
                <IconSymbol name="rosette" size={24} color="#FF6B9D" />
                <Text className="text-2xl font-bold text-foreground mt-2">
                  {stats.badges}
                </Text>
                <Text className="text-sm text-muted">Badges</Text>
              </View>

              <View className="flex-1 min-w-[45%] bg-orange-500/10 rounded-2xl p-4 border border-orange-500/20">
                <IconSymbol name="flame.fill" size={24} color="#F59E0B" />
                <Text className="text-2xl font-bold text-foreground mt-2">
                  {stats.streak}
                </Text>
                <Text className="text-sm text-muted">Day Streak</Text>
              </View>

              <View className="flex-1 min-w-[45%] bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20">
                <IconSymbol name="chart.bar.fill" size={24} color="#3B82F6" />
                <Text className="text-2xl font-bold text-foreground mt-2">
                  Level {stats.level}
                </Text>
                <Text className="text-sm text-muted">Current Level</Text>
              </View>
            </View>
          </View>

          {/* Content based on selected tab */}
          {selectedTab === "rewards" ? (
            <View className="mb-6">
              <Text className="text-xl font-bold text-foreground mb-4">
                Available Rewards
              </Text>
              <View className="gap-3">
                {rewards.map((reward) => (
                  <View
                    key={reward.id}
                    className={`bg-surface rounded-2xl p-4 border ${
                      reward.available ? "border-border" : "border-muted/30 opacity-60"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3 flex-1">
                        <View
                          className="w-12 h-12 rounded-full items-center justify-center"
                          style={{ backgroundColor: reward.color + "20" }}
                        >
                          <IconSymbol name={reward.icon} size={24} color={reward.color} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground">
                            {reward.title}
                          </Text>
                          <Text className="text-sm text-muted">
                            {reward.points} points
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        disabled={!reward.available || stats.points < reward.points}
                        className={`px-4 py-2 rounded-xl ${
                          reward.available && stats.points >= reward.points
                            ? "bg-primary"
                            : "bg-muted/20"
                        }`}
                      >
                        <Text
                          className={`font-semibold ${
                            reward.available && stats.points >= reward.points
                              ? "text-white"
                              : "text-muted"
                          }`}
                        >
                          {stats.points >= reward.points ? "Redeem" : "Locked"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View className="mb-6">
              <Text className="text-xl font-bold text-foreground mb-4">
                Your Badges
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {badges.map((badge, index) => (
                  <View
                    key={index}
                    className="w-[30%] bg-surface rounded-2xl p-4 border border-border items-center"
                  >
                    <View
                      className="w-16 h-16 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: badge.color + "20" }}
                    >
                      <IconSymbol name={badge.icon} size={32} color={badge.color} />
                    </View>
                    <Text className="text-xs font-medium text-foreground text-center">
                      {badge.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
