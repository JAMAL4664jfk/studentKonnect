import { ScrollView, Text, View, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { LinearGradient } from "expo-linear-gradient";

type ServiceItem = {
  id: string;
  name: string;
  icon: any;
  description: string;
  backgroundImage: any;
  badgeText: string;
  badgeColor: string;
};

const SERVICES: ServiceItem[] = [
  {
    id: "my-account",
    name: "My Student Account",
    icon: "house.fill",
    description: "Access your student dashboard",
    backgroundImage: require("@/assets/images/hero-student-connect.jpg"),
    badgeText: "Dashboard",
    badgeColor: "#3b82f6",
  },
  {
    id: "chat",
    name: "Chat",
    icon: "message.fill",
    description: "Message your connections",
    backgroundImage: require("@/assets/images/hero-student-connect.jpg"),
    badgeText: "Coming Soon",
    badgeColor: "#8b5cf6",
  },
  {
    id: "campus-entertainment",
    name: "Campus Entertainment",
    icon: "music.note",
    description: "Podcasts, campus radio & live stations",
    backgroundImage: require("@/assets/images/student-podcast-bg.jpg"),
    badgeText: "Listen Now",
    badgeColor: "#a855f7",
  },
  {
    id: "marketplace",
    name: "Marketplace",
    icon: "cart.fill",
    description: "Buy and sell student items",
    backgroundImage: require("@/assets/images/student-marketplace.jpg"),
    badgeText: "Shop Now",
    badgeColor: "#f59e0b",
  },
  {
    id: "accommodation",
    name: "Accommodation",
    icon: "building.fill",
    description: "Find student housing",
    backgroundImage: require("@/assets/images/student-accommodation-bg.jpg"),
    badgeText: "Verified Listings",
    badgeColor: "#f97316",
  },
  {
    id: "loans",
    name: "Student Loans",
    icon: "creditcard.fill",
    description: "Apply for student loans",
    backgroundImage: require("@/assets/images/wallet-bg.jpg"),
    badgeText: "Apply Now",
    badgeColor: "#3b82f6",
  },
  {
    id: "wellness",
    name: "Wellness",
    icon: "heart.fill",
    description: "Mental health support",
    backgroundImage: require("@/assets/images/mental-health-counselling.jpg"),
    badgeText: "24/7 Support",
    badgeColor: "#ec4899",
  },
  {
    id: "career",
    name: "Career",
    icon: "briefcase.fill",
    description: "Career development tools",
    backgroundImage: require("@/assets/images/career-innovation-hero.jpg"),
    badgeText: "Opportunities",
    badgeColor: "#6366f1",
  },
  {
    id: "gamification",
    name: "Lifestyle & Rewards",
    icon: "gift.fill",
    description: "Earn points, badges, and streaks",
    backgroundImage: require("@/assets/images/lifestyle-rewards-banner.jpg"),
    badgeText: "Rewards System",
    badgeColor: "#eab308",
  },
  {
    id: "nsfas",
    name: "NSFAS",
    icon: "doc.text.fill",
    description: "Apply for student funding",
    backgroundImage: require("@/assets/images/wallet-bg.jpg"),
    badgeText: "Apply Now",
    badgeColor: "#10b981",
  },
  {
    id: "health-cover",
    name: "Student Health Cover",
    icon: "cross.case.fill",
    description: "Affordable healthcare plans",
    backgroundImage: require("@/assets/images/mental-health-counselling.jpg"),
    badgeText: "Get Covered",
    badgeColor: "#ef4444",
  },
  {
    id: "lecturer",
    name: "Connect to Lecturer",
    icon: "person.2.fill",
    description: "Chat with your lecturers",
    backgroundImage: require("@/assets/images/hero-student-connect.jpg"),
    badgeText: "Connect Now",
    badgeColor: "#6366f1",
  },
];

export default function ServicesScreen() {
  const colors = useColors();
  const router = useRouter();

  const handleServicePress = (serviceId: string) => {
    const routes: Record<string, string> = {
      "my-account": "/",
      chat: "/chat",
      "campus-entertainment": "/campus-entertainment",
      marketplace: "/marketplace",
      accommodation: "/accommodation",
      loans: "/student-loans",
      tutor: "/tutoring",
      wellness: "/wellness",
      career: "/career",
      gamification: "/gamification",
      nsfas: "/nsfas",
      "health-cover": "/student-health-cover",
      lecturer: "/connect-lecturer",
    };
    
    const route = routes[serviceId];
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <ScreenContainer className="p-4" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="flex-1 gap-6">
          {/* Services Grid - First Thing Visible */}
          <View className="gap-4 pt-4">
            {SERVICES.map((service) => (
              <TouchableOpacity
                key={service.id}
                onPress={() => handleServicePress(service.id)}
                className="rounded-2xl overflow-hidden border border-border active:opacity-80"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                  height: 160,
                }}
              >
                <ImageBackground
                  source={service.backgroundImage}
                  className="flex-1"
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
                    className="flex-1 p-4 justify-between"
                  >
                    {/* Badge */}
                    <View className="flex-row">
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: service.badgeColor }}
                      >
                        <Text className="text-xs font-bold text-white">
                          {service.badgeText}
                        </Text>
                      </View>
                    </View>

                    {/* Service Info */}
                    <View className="gap-1">
                      <View className="flex-row items-center gap-2">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center bg-white/20 backdrop-blur-sm"
                        >
                          <IconSymbol
                            name={service.icon as any}
                            size={20}
                            color="white"
                          />
                        </View>
                        <Text className="text-2xl font-bold text-white flex-1">
                          {service.name}
                        </Text>
                        <IconSymbol
                          name="chevron.right"
                          size={24}
                          color="white"
                        />
                      </View>
                      <Text className="text-sm text-white/90 ml-12">
                        {service.description}
                      </Text>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logo and Tagline Footer */}
          <View className="items-center gap-3 py-6 mt-4">
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 60, height: 60 }}
              contentFit="contain"
            />
            <Text className="text-2xl font-bold text-foreground text-center">
              Student Konnect
            </Text>
            <Text className="text-sm text-muted text-center px-4">
              Connecting over 300 million students globally
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
