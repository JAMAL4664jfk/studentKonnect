// Home Screen with Visa/Mastercaimport React from "react";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useWallet } from "@/contexts/WalletContext";
import { useInstitution } from "@/contexts/InstitutionContext";
import { MoreOptionsModal } from "@/components/MoreOptionsModal";
import { GazooAIChat } from "@/components/GazooAIChat";

import { BRAND_COLORS } from "@/constants/brand-colors";
import { FEATURE_DESCRIPTIONS } from "@/constants/feature-descriptions";

type QuickAction = {
  id: string;
  title: string;
  image: any;
};

const QUICK_ACTIONS: QuickAction[] = [
  { id: "send", title: "Send Money", image: require("@/assets/images/send-money-bg.jpg") },
  { id: "pay", title: "Pay", image: require("@/assets/images/pay-merchant-bg.jpg") },
  { id: "savings", title: "Savings", image: require("@/assets/images/savings-bg.jpg") },
];

type FeaturedService = {
  id: string;
  title: string;
  image: any;
};

const FEATURED_SERVICES: FeaturedService[] = [
  { id: "marketplace", title: "Marketplace", image: require("@/assets/images/marketplace-bg.jpg") },
  { id: "accommodation", title: "Accommodation", image: require("@/assets/images/accommodation-bg.jpg") },
  { id: "hookup", title: "Student Hook-Up", image: require("@/assets/images/student-hookup-bg.jpg") },
];

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  date: string;
};

const RECENT_TRANSACTIONS: Transaction[] = [
  { id: "1", description: "Shoprite", amount: -245.50, type: "debit", date: "Today, 10:30 AM" },
  { id: "2", description: "Allowance Deposit", amount: 1500.00, type: "credit", date: "Yesterday" },
  { id: "3", description: "Uber", amount: -85.00, type: "debit", date: "2 days ago" },
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { balance, isLoading: walletLoading, refreshBalance } = useWallet();
  const { userInstitution } = useInstitution();
  const [refreshing, setRefreshing] = useState(false);
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);
  const [gazooAIVisible, setGazooAIVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleServicePress = (serviceId: string) => {
    const routes: Record<string, string> = {
      marketplace: "/marketplace",
      accommodation: "/accommodation",
      hookup: "/student-hookup",
    };
    
    const route = routes[serviceId];
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <ScreenContainer className="p-4" edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="gap-6 pb-6">
          {/* Header with Gradient */}
          <LinearGradient
            colors={BRAND_COLORS.gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-6 -mx-4 -mt-4 mb-2"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                {userInstitution ? (
                  <View className="flex-row items-center gap-3 mb-2">
                    <View className="w-12 h-12 rounded-lg bg-white p-2 items-center justify-center">
                      <Image
                        source={{ uri: userInstitution.logo }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="contain"
                      />
                    </View>
                    <View>
                      <Text className="text-3xl font-bold text-white">{userInstitution.shortName} Konnect</Text>
                      <Text className="text-lg font-semibold text-white mt-1">We care</Text>
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text className="text-3xl font-bold text-white">Student Konnect</Text>
                    <Text className="text-lg font-semibold text-white mt-1">We care</Text>
                  </View>
                )}
                <Text className="text-base text-white/90 mt-1">{FEATURE_DESCRIPTIONS.heroMessage}</Text>
                <Text className="text-sm text-white/80 mt-2">{FEATURE_DESCRIPTIONS.tagline}</Text>

                {/* Gazoo AI Button */}
                <TouchableOpacity
                  onPress={() => setGazooAIVisible(true)}
                  className="mt-4 flex-row items-center bg-white/20 backdrop-blur-lg rounded-2xl px-4 py-3 active:opacity-70"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: '#7c3aed' }}
                  >
                    <IconSymbol name="sparkles" size={20} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base">Chat with Gazoo AI</Text>
                    <Text className="text-white/80 text-xs">Your intelligent student companion</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            <TouchableOpacity 
              onPress={() => router.push("/notifications" as any)}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <IconSymbol name="bell.fill" size={20} color="white" />
            </TouchableOpacity>
          </View>
          </LinearGradient>



          {/* Quick Actions */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Quick Actions</Text>
              <TouchableOpacity
                onPress={() => setMoreOptionsVisible(true)}
                className="bg-surface px-4 py-2 rounded-full border border-border active:opacity-70"
              >
                <Text className="text-primary text-sm font-semibold">More</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  onPress={() => {
                    if (action.id === "savings") {
                      router.push("/savings-pockets");
                    } else if (action.id === "send") {
                      router.push("/send-money");
                    } else if (action.id === "pay") {
                      router.push("/pay");
                    }
                  }}
                  className="rounded-2xl overflow-hidden active:opacity-90"
                  style={{
                    width: 160,
                    height: 100,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Image
                    source={action.image}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
                    <View className="bg-black/60 px-4 py-2 rounded-full">
                      <Text className="text-white text-sm font-bold text-center">
                        {action.title}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Recent Transactions */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">
                Recent Transactions
              </Text>
              <TouchableOpacity onPress={() => router.push("/transactions" as any)}>
                <Text className="text-primary text-sm font-semibold">View All</Text>
              </TouchableOpacity>
            </View>
            {RECENT_TRANSACTIONS.map((transaction) => (
              <View
                key={transaction.id}
                className="bg-surface rounded-2xl p-4 border border-border"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      {transaction.description}
                    </Text>
                    <Text className="text-xs text-muted">{transaction.date}</Text>
                  </View>
                  <Text
                    className={`text-lg font-bold ${
                      transaction.type === "credit" ? "text-success" : "text-foreground"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : ""}R
                    {Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>



          {/* Featured Services */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Featured Services</Text>
            <View className="flex-row flex-wrap gap-3">
              {FEATURED_SERVICES.map((service) => (
                <View key={service.id} style={{ width: "48%" }}>
                  <TouchableOpacity
                    onPress={() => handleServicePress(service.id)}
                    className="rounded-2xl overflow-hidden active:opacity-90"
                    style={{
                      height: 140,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Image
                      source={service.image}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  </TouchableOpacity>
                  <Text className="text-sm font-semibold text-foreground mt-2 text-center">
                    {service.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* More Options Modal */}
      <MoreOptionsModal
        visible={moreOptionsVisible}
        onClose={() => setMoreOptionsVisible(false)}
      />
    </ScreenContainer>
  );
      <GazooAIChat visible={gazooAIVisible} onClose={() => setGazooAIVisible(false)} />
}
