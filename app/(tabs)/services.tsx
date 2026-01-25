import { ScrollView, Text, View, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
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
    id: "tutor",
    name: "Tutoring",
    icon: "graduationcap.fill",
    description: "Find tutors or offer tutoring",
    backgroundImage: require("@/assets/images/hero-student-connect.jpg"),
    badgeText: "Peer Learning",
    badgeColor: "#06b6d4",
  },
  {
    id: "ehailing",
    name: "E-Hailing",
    icon: "car.fill",
    description: "Book rides with students",
    backgroundImage: require("@/assets/images/send-money-bg.jpg"),
    badgeText: "Book Ride",
    badgeColor: "#10b981",
  },
  {
    id: "podcast",
    name: "Podcasts",
    icon: "music.note",
    description: "Listen to student podcasts",
    backgroundImage: require("@/assets/images/student-podcast-bg.jpg"),
    badgeText: "Listen Now",
    badgeColor: "#a855f7",
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
      marketplace: "/marketplace",
      accommodation: "/accommodation",
      loans: "/student-loans",
      tutor: "/tutoring",
      ehailing: "/ehailing",
      podcast: "/podcasts",
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
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Services</Text>
            <Text className="text-base text-muted">
              Explore all student services and features
            </Text>
          </View>

          {/* Services Grid */}
          <View className="gap-4">
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
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
