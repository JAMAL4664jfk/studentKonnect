import { View, Text, TouchableOpacity, ScrollView, ImageBackground, Image, Modal, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import Toast from "react-native-toast-message";

type Reward = {
  id: string;
  brand: string;
  name: string;
  description: string;
  points: number;
  value: string;
  logo?: any;
  category: string;
};

type RedeemedReward = {
  id: string;
  reward: Reward;
  voucherCode: string;
  redeemedAt: string;
  expiresAt: string;
  used: boolean;
};

export default function GamificationScreen() {
  const colors = useColors();
  const router = useRouter();
  
  const [userPoints, setUserPoints] = useState(1250);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<RedeemedReward | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const categories = ["All", "Food", "Shopping", "Entertainment", "Transport", "Tech"];

  const rewards: Reward[] = [
    // Food & Beverage
    {
      id: "kfc-75",
      brand: "KFC",
      name: "KFC Voucher",
      description: "R75 meal voucher",
      points: 400,
      value: "R75",
      logo: require("@/assets/images/kfc-logo.png"),
      category: "Food",
    },
    {
      id: "mcdonalds-50",
      brand: "McDonald's",
      name: "McDonald's Voucher",
      description: "R50 meal voucher",
      points: 300,
      value: "R50",
      logo: require("@/assets/images/kfc-logo.png"),
      category: "Food",
    },
    {
      id: "nandos-100",
      brand: "Nando's",
      name: "Nando's Voucher",
      description: "R100 meal voucher",
      points: 500,
      value: "R100",
      logo: require("@/assets/images/kfc-logo.png"),
      category: "Food",
    },
    {
      id: "starbucks-60",
      brand: "Starbucks",
      name: "Starbucks Card",
      description: "R60 coffee voucher",
      points: 350,
      value: "R60",
      logo: require("@/assets/images/kfc-logo.png"),
      category: "Food",
    },
    
    // Shopping
    {
      id: "takealot-200",
      brand: "Takealot",
      name: "Takealot Voucher",
      description: "R200 shopping voucher",
      points: 800,
      value: "R200",
      logo: require("@/assets/images/takealot-logo.png"),
      category: "Shopping",
    },
    {
      id: "woolworths-150",
      brand: "Woolworths",
      name: "Woolworths Voucher",
      description: "R150 shopping voucher",
      points: 650,
      value: "R150",
      logo: require("@/assets/images/takealot-logo.png"),
      category: "Shopping",
    },
    {
      id: "checkers-100",
      brand: "Checkers",
      name: "Checkers Voucher",
      description: "R100 grocery voucher",
      points: 500,
      value: "R100",
      logo: require("@/assets/images/takealot-logo.png"),
      category: "Shopping",
    },
    {
      id: "makro-250",
      brand: "Makro",
      name: "Makro Voucher",
      description: "R250 shopping voucher",
      points: 1000,
      value: "R250",
      logo: require("@/assets/images/takealot-logo.png"),
      category: "Shopping",
    },

    // Entertainment
    {
      id: "netflix-100",
      brand: "Netflix",
      name: "Netflix Voucher",
      description: "R100 subscription voucher",
      points: 500,
      value: "R100",
      logo: require("@/assets/images/netflix-logo.png"),
      category: "Entertainment",
    },
    {
      id: "showmax-99",
      brand: "Showmax",
      name: "Showmax Voucher",
      description: "R99 monthly subscription",
      points: 450,
      value: "R99",
      logo: require("@/assets/images/netflix-logo.png"),
      category: "Entertainment",
    },
    {
      id: "dstv-150",
      brand: "DStv",
      name: "DStv Voucher",
      description: "R150 subscription voucher",
      points: 700,
      value: "R150",
      logo: require("@/assets/images/netflix-logo.png"),
      category: "Entertainment",
    },
    {
      id: "spotify-60",
      brand: "Spotify",
      name: "Spotify Premium",
      description: "R60 monthly subscription",
      points: 350,
      value: "R60",
      logo: require("@/assets/images/netflix-logo.png"),
      category: "Entertainment",
    },

    // Transport
    {
      id: "uber-50",
      brand: "Uber",
      name: "Uber Credit",
      description: "R50 ride credit",
      points: 300,
      value: "R50",
      logo: require("@/assets/images/uber-logo.png"),
      category: "Transport",
    },
    {
      id: "bolt-40",
      brand: "Bolt",
      name: "Bolt Credit",
      description: "R40 ride credit",
      points: 250,
      value: "R40",
      logo: require("@/assets/images/uber-logo.png"),
      category: "Transport",
    },
    {
      id: "uber-100",
      brand: "Uber",
      name: "Uber Credit",
      description: "R100 ride credit",
      points: 550,
      value: "R100",
      logo: require("@/assets/images/uber-logo.png"),
      category: "Transport",
    },

    // Tech & Services
    {
      id: "google-play-50",
      brand: "Google Play",
      name: "Google Play Card",
      description: "R50 store credit",
      points: 300,
      value: "R50",
      logo: require("@/assets/images/takealot-logo.png"),
      category: "Tech",
    },
    {
      id: "apple-100",
      brand: "Apple",
      name: "Apple Gift Card",
      description: "R100 store credit",
      points: 550,
      value: "R100",
      logo: require("@/assets/images/takealot-logo.png"),
      category: "Tech",
    },
    {
      id: "steam-75",
      brand: "Steam",
      name: "Steam Wallet",
      description: "R75 gaming credit",
      points: 400,
      value: "R75",
      logo: require("@/assets/images/takealot-logo.png"),
      category: "Tech",
    },
  ];

  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([
    {
      id: "redeemed-1",
      reward: rewards[0],
      voucherCode: "KFC-2024-AB12CD",
      redeemedAt: "2024-01-20",
      expiresAt: "2024-02-20",
      used: false,
    },
    {
      id: "redeemed-2",
      reward: rewards[4],
      voucherCode: "TAL-2024-XY98ZW",
      redeemedAt: "2024-01-15",
      expiresAt: "2024-03-15",
      used: true,
    },
  ]);

  const generateVoucherCode = (brand: string): string => {
    const prefix = brand.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-2024-${random}`;
  };

  const handleRedeemReward = (reward: Reward) => {
    if (userPoints >= reward.points) {
      const voucherCode = generateVoucherCode(reward.brand);
      const newRedeemed: RedeemedReward = {
        id: `redeemed-${Date.now()}`,
        reward,
        voucherCode,
        redeemedAt: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        used: false,
      };
      
      setRedeemedRewards([newRedeemed, ...redeemedRewards]);
      setUserPoints(userPoints - reward.points);
      setSelectedVoucher(newRedeemed);
      setShowVoucherModal(true);
      
      Toast.show({
        type: "success",
        text1: "Reward Redeemed!",
        text2: `${reward.name} voucher code generated`,
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Insufficient Points",
        text2: `You need ${reward.points - userPoints} more points`,
      });
    }
  };

  const filteredRewards = selectedCategory === "All" 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory);

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
                  Redeem exclusive vouchers from top brands
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

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setShowHistoryModal(true)}
                    className="flex-1 bg-white/20 rounded-xl p-3 flex-row items-center justify-center gap-2"
                  >
                    <IconSymbol name="clock.fill" size={20} color="white" />
                    <Text className="text-white font-semibold">History</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Toast.show({
                        type: "info",
                        text1: "Earn Points",
                        text2: "Complete activities to earn more points!",
                      });
                    }}
                    className="flex-1 bg-white/20 rounded-xl p-3 flex-row items-center justify-center gap-2"
                  >
                    <IconSymbol name="plus.circle.fill" size={20} color="white" />
                    <Text className="text-white font-semibold">Earn More</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category Filter */}
              <View className="gap-3">
                <Text className="text-xl font-bold text-white">Categories</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                  <View className="flex-row gap-2">
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-full ${
                          selectedCategory === cat ? "bg-primary" : "bg-white/20"
                        }`}
                      >
                        <Text className={`font-semibold ${
                          selectedCategory === cat ? "text-white" : "text-white/80"
                        }`}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Rewards Grid */}
              <View className="gap-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-2xl font-bold text-white">Available Rewards</Text>
                  <Text className="text-sm text-white/60">{filteredRewards.length} rewards</Text>
                </View>
                <View className="gap-3">
                  {filteredRewards.map((reward) => (
                    <View key={reward.id}
                      className="bg-surface/90 backdrop-blur-sm rounded-2xl p-4 border border-border"
                    >
                      <View className="flex-row items-start gap-3 mb-3">
                        {reward.logo ? (
                          <View className="w-16 h-16 rounded-xl bg-white items-center justify-center p-2">
                            <Image
                              source={reward.logo}
                              style={{ width: 48, height: 48 }}
                              resizeMode="contain"
                            />
                          </View>
                        ) : (
                          <View className="w-16 h-16 rounded-xl bg-primary/20 items-center justify-center">
                            <Text className="text-2xl">{reward.brand[0]}</Text>
                          </View>
                        )}
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 mb-1">
                            <Text className="text-lg font-bold text-foreground">
                              {reward.brand}
                            </Text>
                            <View className="bg-primary/20 px-2 py-0.5 rounded-md">
                              <Text className="text-xs font-bold text-primary">{reward.value}</Text>
                            </View>
                          </View>
                          <Text className="text-sm font-medium text-foreground mb-1">
                            {reward.name}
                          </Text>
                          <Text className="text-xs text-muted">{reward.description}</Text>
                        </View>
                      </View>
                      
                      <View className="flex-row items-center justify-between pt-3 border-t border-border">
                        <View className="flex-row items-center gap-1">
                          <IconSymbol name="star.fill" size={16} color={colors.primary} />
                          <Text className="text-sm font-bold text-foreground">
                            {reward.points} points
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRedeemReward(reward)}
                          className={`rounded-xl px-6 py-2.5 ${
                            userPoints >= reward.points
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                          disabled={userPoints < reward.points}
                        >
                          <Text
                            className={`font-bold text-sm ${
                              userPoints >= reward.points
                                ? "text-white"
                                : "text-muted-foreground"
                            }`}
                          >
                            {userPoints >= reward.points ? "Redeem" : "Locked"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>

      {/* Voucher Code Modal */}
      <Modal visible={showVoucherModal} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <View className="bg-background rounded-3xl p-6 mx-4 w-11/12 max-w-md">
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-4">
                <IconSymbol name="checkmark.circle.fill" size={48} color={colors.primary} />
              </View>
              <Text className="text-2xl font-bold text-foreground mb-2">Reward Redeemed!</Text>
              <Text className="text-sm text-muted text-center">
                Your voucher code has been generated
              </Text>
            </View>

            {selectedVoucher && (
              <View className="gap-4">
                <View className="bg-surface rounded-2xl p-4 border border-border">
                  <Text className="text-xs text-muted mb-1">Reward</Text>
                  <Text className="text-lg font-bold text-foreground mb-3">
                    {selectedVoucher.reward.brand} - {selectedVoucher.reward.value}
                  </Text>
                  
                  <Text className="text-xs text-muted mb-1">Voucher Code</Text>
                  <View className="bg-primary/10 rounded-xl p-4 mb-3">
                    <Text className="text-2xl font-mono font-bold text-primary text-center tracking-wider">
                      {selectedVoucher.voucherCode}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-xs text-muted">Redeemed</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {new Date(selectedVoucher.redeemedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted">Expires</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {new Date(selectedVoucher.expiresAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text className="text-xs text-muted text-center">
                  Screenshot this code or find it in your redemption history
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setShowVoucherModal(false)}
              className="bg-primary rounded-xl p-4 mt-4"
            >
              <Text className="text-white font-bold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Redemption History Modal */}
      <Modal visible={showHistoryModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View className="bg-background rounded-t-3xl p-6" style={{ maxHeight: "80%" }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-foreground">Redemption History</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {redeemedRewards.length === 0 ? (
                <View className="items-center justify-center py-12">
                  <IconSymbol name="clock" size={48} color={colors.muted} />
                  <Text className="text-muted text-center mt-4">No redeemed rewards yet</Text>
                </View>
              ) : (
                <View className="gap-3">
                  {redeemedRewards.map((redeemed) => (
                    <TouchableOpacity
                      key={redeemed.id}
                      onPress={() => {
                        setSelectedVoucher(redeemed);
                        setShowHistoryModal(false);
                        setShowVoucherModal(true);
                      }}
                      className="bg-surface rounded-2xl p-4 border border-border"
                    >
                      <View className="flex-row items-start gap-3 mb-3">
                        {redeemed.reward.logo && (
                          <View className="w-12 h-12 rounded-xl bg-white items-center justify-center p-2">
                            <Image
                              source={redeemed.reward.logo}
                              style={{ width: 36, height: 36 }}
                              resizeMode="contain"
                            />
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-base font-bold text-foreground mb-1">
                            {redeemed.reward.brand} - {redeemed.reward.value}
                          </Text>
                          <Text className="text-xs text-muted mb-2">{redeemed.reward.name}</Text>
                          <View className="flex-row items-center gap-2">
                            <View className={`px-2 py-1 rounded-md ${
                              redeemed.used ? "bg-muted" : "bg-primary/20"
                            }`}>
                              <Text className={`text-xs font-semibold ${
                                redeemed.used ? "text-muted-foreground" : "text-primary"
                              }`}>
                                {redeemed.used ? "Used" : "Active"}
                              </Text>
                            </View>
                            <Text className="text-xs text-muted">
                              Expires: {new Date(redeemed.expiresAt).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                      </View>
                      
                      <View className="bg-muted/20 rounded-lg p-3">
                        <Text className="text-xs text-muted mb-1">Voucher Code</Text>
                        <Text className="text-sm font-mono font-bold text-foreground">
                          {redeemed.voucherCode}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
