import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 64) / 2; // 2 columns with padding

type InstitutionType = "university" | "tvet_college" | "college" | "staff" | "parent";

interface InstitutionCard {
  type: InstitutionType;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  features: string[];
}

const institutions: InstitutionCard[] = [
  {
    type: "university",
    title: "University",
    subtitle: "Traditional universities offering degrees",
    icon: "building.columns.fill",
    color: "#3b82f6", // blue
    features: ["Bachelor's, Master's, PhD", "24 institutions"],
  },
  {
    type: "tvet_college",
    title: "TVET College",
    subtitle: "Technical & vocational training",
    icon: "wrench.and.screwdriver.fill",
    color: "#14b8a6", // teal
    features: ["N1-N6 & NCV programs", "42 institutions"],
  },
  {
    type: "college",
    title: "College",
    subtitle: "Private colleges & institutions",
    icon: "graduationcap.fill",
    color: "#a16207", // brown
    features: ["Diplomas & certificates", "20 institutions"],
  },
  {
    type: "staff",
    title: "Staff",
    subtitle: "Faculty & administrative staff",
    icon: "person.badge.key.fill",
    color: "#ea580c", // orange
    features: ["Staff portal access", "Management tools"],
  },
  {
    type: "parent",
    title: "Parent",
    subtitle: "Parent & guardian portal",
    icon: "person.2.fill",
    color: "#db2777", // pink
    features: ["Track student progress", "Payment management"],
  },
];

export default function InstitutionSelectScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<InstitutionType | null>(null);

  const handleSelectInstitution = (type: InstitutionType) => {
    setSelectedType(type);
    // Navigate to appropriate screen based on type
    if (type === "staff" || type === "parent") {
      // For staff and parents, go directly to full registration
      router.push({
        pathname: "/onboarding/full-registration",
        params: { institutionType: type },
      });
    } else {
      // For students, show quick registration option
      router.push({
        pathname: "/onboarding/quick-registration",
        params: { institutionType: type },
      });
    }
  };

  return (
    <LinearGradient
      colors={["#1e3a8a", "#3b82f6", "#60a5fa"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <ScreenContainer>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Header */}
          <View className="items-center mt-8 mb-8">
            <View className="bg-white/20 p-4 rounded-2xl mb-4">
              <IconSymbol name="wallet" size={48} color="#fff" />
            </View>
            <View className="bg-white/95 rounded-3xl px-8 py-6 mb-4">
              <Text className="text-3xl font-bold text-primary text-center mb-2">
                Connecting More Than 300 Million Students
              </Text>
              <Text className="text-base text-muted-foreground text-center">
                From Different Institutions Across The World
              </Text>
            </View>
          </View>

          {/* Title */}
          <View className="mb-6 px-4">
            <Text className="text-2xl font-bold text-white text-center mb-2">
              Join Student Connect
            </Text>
            <Text className="text-base text-white/80 text-center">
              Select your institution type to get started
            </Text>
          </View>

          {/* Institution Cards Grid */}
          <View className="px-4">
            <View className="flex-row flex-wrap justify-between gap-4">
              {institutions.map((institution) => (
                <TouchableOpacity
                  key={institution.type}
                  onPress={() => handleSelectInstitution(institution.type)}
                  className="bg-white rounded-2xl overflow-hidden active:opacity-80"
                  style={{
                    width: institution.type === "parent" ? "100%" : CARD_WIDTH,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  {/* Icon Header */}
                  <View
                    className="p-6 items-center justify-center"
                    style={{ backgroundColor: institution.color }}
                  >
                    <View className="bg-white/20 p-4 rounded-2xl">
                      <IconSymbol name={institution.icon} size={40} color="#fff" />
                    </View>
                  </View>

                  {/* Content */}
                  <View className="p-4">
                    <Text className="text-xl font-bold text-foreground mb-1 text-center">
                      {institution.title}
                    </Text>
                    <Text className="text-sm text-muted-foreground mb-3 text-center">
                      {institution.subtitle}
                    </Text>

                    {/* Features */}
                    <View className="space-y-2">
                      {institution.features.map((feature, index) => (
                        <View key={index} className="flex-row items-center gap-2">
                          <IconSymbol
                            name="checkmark.circle.fill"
                            size={16}
                            color={institution.color}
                          />
                          <Text className="text-xs text-foreground flex-1">{feature}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Select Button */}
                    <TouchableOpacity
                      onPress={() => handleSelectInstitution(institution.type)}
                      className="mt-4 py-3 rounded-xl items-center"
                      style={{ backgroundColor: institution.color }}
                    >
                      <Text className="text-white font-bold text-base">Select</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sign In Link */}
          <View className="items-center mt-8">
            <Text className="text-white/80 text-sm mb-2">Already have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push("/auth")}
              className="bg-white/20 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold text-base">Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center mt-8">
            <Text className="text-white/60 text-xs">Secure & Trusted Platform</Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    </LinearGradient>
  );
}
