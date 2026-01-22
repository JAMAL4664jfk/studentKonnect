import { ScrollView, Text, View, TouchableOpacity, ImageBackground, Image } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  total?: number;
};

type Challenge = {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
};

type Reward = {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  logo?: any;
};

export default function GamificationScreen() {
  const colors = useColors();
  const router = useRouter();
  
  const [userPoints, setUserPoints] = useState(1250);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);

  const badges: Badge[] = [
    {
      id: "first-purchase",
      name: "First Purchase",
      description: "Made your first marketplace purchase",
      icon: "cart.fill",
      earned: true,
    },
    {
      id: "social-butterfly",
      name: "Social Butterfly",
      description: "Connected with 10 students",
      icon: "person.3.fill",
      earned: true,
    },
    {
      id: "study-master",
      name: "Study Master",
      description: "Completed 5 tutoring sessions",
      icon: "book.fill",
      earned: false,
      progress: 3,
      total: 5,
    },
    {
      id: "podcast-fan",
      name: "Podcast Fan",
      description: "Listened to 10 podcast episodes",
      icon: "music.note",
      earned: false,
      progress: 6,
      total: 10,
    },
  ];

  const challenges: Challenge[] = [
    {
      id: "daily-login",
      title: "Daily Login",
      description: "Log in every day for a week",
      points: 50,
      completed: false,
    },
    {
      id: "marketplace-seller",
      name: "Marketplace Seller",
      description: "List 3 items on marketplace",
      points: 100,
      completed: false,
    },
    {
      id: "tutor-session",
      title: "Tutor Session",
      description: "Complete a tutoring session",
      points: 75,
      completed: false,
    },
  ];

  const rewards: Reward[] = [
    {
      id: "netflix-voucher",
      name: "Netflix Voucher",
      description: "R100 Netflix subscription voucher",
      points: 500,
      icon: "tv.fill",
      logo: require("@/assets/images/netflix-logo.png"),
    },
    {
      id: "uber-credit",
      name: "Uber Credit",
      description: "R50 Uber ride credit",
      points: 300,
      icon: "car.fill",
      logo: require("@/assets/images/uber-logo.png"),
    },
    {
      id: "takealot-voucher",
      name: "Takealot Voucher",
      description: "R200 Takealot shopping voucher",
      points: 800,
      icon: "cart.fill",
      logo: require("@/assets/images/takealot-logo.png"),
    },
    {
      id: "kfc-voucher",
      name: "KFC Voucher",
      description: "R75 KFC meal voucher",
      points: 400,
      icon: "fork.knife",
      logo: require("@/assets/images/kfc-logo.png"),
    },
  ];

  const handleClaimDailyBonus = () => {
    setUserPoints(userPoints + 10);
    setDailyBonusClaimed(true);
  };

  const handleRedeemReward = (reward: Reward) => {
    if (userPoints >= reward.points) {
      setUserPoints(userPoints - reward.points);
      alert(`Successfully redeemed ${reward.name}!`);
    } else {
      alert(`You need ${reward.points - userPoints} more points to redeem this reward.`);
    }
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <ImageBackground
        source={require("@/assets/images/lifestyle-rewards-banner.jpg")}
        className="flex-1"
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <View className="p-4 gap-6">
              {/* Header */}
              <View className="gap-2">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="flex-row items-center gap-2 mb-2"
                >
                  <IconSymbol name="chevron.left" size={24} color="white" />
                  <Text className="text-base text-white">Back</Text>
                </TouchableOpacity>
                <Text className="text-4xl font-bold text-white">Lifestyle & Rewards</Text>
                <Text className="text-base text-white/80">
                  Earn points, unlock badges, and redeem rewards
                </Text>
              </View>

              {/* Points Card */}
              <View className="bg-primary rounded-2xl p-6 gap-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm text-white/80">Your Points</Text>
                    <Text className="text-5xl font-bold text-white">{userPoints}</Text>
                  </View>
                  <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
                    <IconSymbol name="star.fill" size={32} color="white" />
                  </View>
                </View>

                {/* Streak */}
                <View className="flex-row items-center gap-2 bg-white/10 rounded-xl p-3">
                  <IconSymbol name="flame.fill" size={24} color="#f59e0b" />
                  <Text className="text-white font-semibold">
                    {currentStreak} Day Streak! 🔥
                  </Text>
                </View>

                {/* Daily Bonus */}
                {!dailyBonusClaimed && (
                  <TouchableOpacity
                    onPress={handleClaimDailyBonus}
                    className="bg-white rounded-xl p-4 active:opacity-70"
                  >
                    <Text className="text-primary font-bold text-center">
                      Claim Daily Bonus (+10 points)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Badges */}
              <View className="gap-4">
                <Text className="text-2xl font-bold text-white">Badges</Text>
                <View className="gap-3">
                  {badges.map((badge) => (
                    <View
                      key={badge.id}
                      className="bg-surface/80 backdrop-blur-sm rounded-xl p-4 border border-border"
                    >
                      <View className="flex-row items-center gap-3">
                        <View
                          className={`w-12 h-12 rounded-full items-center justify-center ${
                            badge.earned ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <IconSymbol
                            name={badge.icon as any}
                            size={24}
                            color={badge.earned ? "white" : colors.foreground}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground">
                            {badge.name}
                          </Text>
                          <Text className="text-sm text-muted">{badge.description}</Text>
                          {!badge.earned && badge.progress && badge.total && (
                            <Text className="text-xs text-primary mt-1">
                              Progress: {badge.progress}/{badge.total}
                            </Text>
                          )}
                        </View>
                        {badge.earned && (
                          <IconSymbol name="checkmark.circle.fill" size={24} color="#10b981" />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Challenges */}
              <View className="gap-4">
                <Text className="text-2xl font-bold text-white">Daily Challenges</Text>
                <View className="gap-3">
                  {challenges.map((challenge) => (
                    <View
                      key={challenge.id}
                      className="bg-surface/80 backdrop-blur-sm rounded-xl p-4 border border-border"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground">
                            {challenge.title}
                          </Text>
                          <Text className="text-sm text-muted">{challenge.description}</Text>
                        </View>
                        <View className="bg-primary px-3 py-1 rounded-full">
                          <Text className="text-white font-bold text-sm">
                            +{challenge.points}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Rewards */}
              <View className="gap-4">
                <Text className="text-2xl font-bold text-white">Redeem Rewards</Text>
                <View className="gap-3">
                  {rewards.map((reward) => (
                    <View key={reward.id}
                      className="bg-surface/80 backdrop-blur-sm rounded-xl p-4 border border-border"
                    >
                      <View className="flex-row items-center gap-3 mb-3">
                        {reward.logo ? (
                          <View className="w-16 h-16 rounded-xl bg-white items-center justify-center p-2">
                            <Image
                              source={reward.logo}
                              style={{ width: 48, height: 48 }}
                              resizeMode="contain"
                            />
                          </View>
                        ) : (
                          <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
                            <IconSymbol name={reward.icon as any} size={24} color={colors.primary} />
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground">
                            {reward.name}
                          </Text>
                          <Text className="text-sm text-muted">{reward.description}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRedeemReward(reward)}
                        className={`rounded-xl p-3 ${
                          userPoints >= reward.points
                            ? "bg-primary"
                            : "bg-muted"
                        } active:opacity-70`}
                        disabled={userPoints < reward.points}
                      >
                        <Text
                          className={`text-center font-bold ${
                            userPoints >= reward.points
                              ? "text-white"
                              : "text-muted-foreground"
                          }`}
                        >
                          {userPoints >= reward.points
                            ? `Redeem for ${reward.points} points`
                            : `Need ${reward.points - userPoints} more points`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </ScreenContainer>
  );
}
