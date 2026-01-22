import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

interface PitchApplication {
  projectName: string;
  category: string;
  fundingAmount: string;
  description: string;
  problem: string;
  solution: string;
  targetMarket: string;
  revenueModel: string;
  teamSize: string;
}

export default function InnovationFundScreen() {
  const colors = useColors();
  const router = useRouter();
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [pitchData, setPitchData] = useState<PitchApplication>({
    projectName: "",
    category: "",
    fundingAmount: "",
    description: "",
    problem: "",
    solution: "",
    targetMarket: "",
    revenueModel: "",
    teamSize: "",
  });

  const categories = [
    "Technology",
    "Healthcare",
    "Education",
    "Finance",
    "Retail",
    "Agriculture",
    "Energy",
    "Other",
  ];

  const fundingTiers = [
    { amount: "R5,000 - R10,000", description: "Prototype Development" },
    { amount: "R10,000 - R25,000", description: "MVP & Market Testing" },
    { amount: "R25,000 - R50,000", description: "Scale & Growth" },
  ];

  const handleSubmitPitch = () => {
    if (
      !pitchData.projectName ||
      !pitchData.category ||
      !pitchData.fundingAmount ||
      !pitchData.description
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all required fields",
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Pitch Submitted!",
      text2: "Your application is under review. We'll contact you within 5-7 business days.",
    });

    setShowPitchModal(false);
    setPitchData({
      projectName: "",
      category: "",
      fundingAmount: "",
      description: "",
      problem: "",
      solution: "",
      targetMarket: "",
      revenueModel: "",
      teamSize: "",
    });
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="ml-4">
              <Text className="text-2xl font-bold text-foreground">Innovation Fund</Text>
              <Text className="text-sm text-muted">Turn ideas into reality</Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1">
          {/* Hero Section */}
          <ImageBackground
            source={require("@/assets/images/innovation-fund-hero-bg.jpg")}
            className="overflow-hidden"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)"]}
              className="p-6"
            >
              <View className="items-center py-8">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                  style={{ backgroundColor: colors.primary }}
                >
                  <IconSymbol name="lightbulb.fill" size={32} color="#fff" />
                </View>
                <Text className="text-3xl font-bold text-white text-center mb-2">
                  Student Innovation Fund
                </Text>
                <Text className="text-lg text-white/90 text-center mb-6">
                  Grants up to R50,000 for your startup ideas
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPitchModal(true)}
                  className="rounded-full px-8 py-4 active:opacity-90"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white text-lg font-bold">Submit Your Pitch</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* About Section */}
          <View className="p-4">
            <View className="bg-surface rounded-2xl p-6 border border-border mb-4">
              <Text className="text-xl font-bold text-foreground mb-3">
                About the Fund
              </Text>
              <Text className="text-base text-muted leading-relaxed mb-4">
                The Student Innovation Fund supports entrepreneurial students with grants ranging
                from R5,000 to R50,000. Submit your pitch, get scored by industry experts, and
                track your funding from application to disbursement.
              </Text>
              <View className="gap-3">
                <View className="flex-row items-start">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                  </View>
                  <Text className="flex-1 text-sm text-foreground">
                    <Text className="font-bold">No Equity Required:</Text> Keep 100% ownership of
                    your startup
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                  </View>
                  <Text className="flex-1 text-sm text-foreground">
                    <Text className="font-bold">Expert Mentorship:</Text> Get guidance from
                    successful entrepreneurs
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                  </View>
                  <Text className="flex-1 text-sm text-foreground">
                    <Text className="font-bold">Fast Approval:</Text> Receive feedback within 5-7
                    business days
                  </Text>
                </View>
              </View>
            </View>

            {/* Funding Tiers */}
            <Text className="text-xl font-bold text-foreground mb-3">Funding Tiers</Text>
            <View className="gap-3 mb-4">
              {fundingTiers.map((tier, index) => (
                <View
                  key={index}
                  className="bg-surface rounded-2xl p-4 border border-border"
                >
                  <Text className="text-lg font-bold text-foreground mb-1">
                    {tier.amount}
                  </Text>
                  <Text className="text-sm text-muted">{tier.description}</Text>
                </View>
              ))}
            </View>

            {/* How It Works */}
            <Text className="text-xl font-bold text-foreground mb-3">How It Works</Text>
            <View className="gap-3 mb-6">
              {[
                { step: "1", title: "Submit Pitch", desc: "Fill out the application form" },
                { step: "2", title: "Expert Review", desc: "Industry experts score your pitch" },
                { step: "3", title: "Interview", desc: "Top pitches get invited for interviews" },
                { step: "4", title: "Funding", desc: "Receive funds and start building" },
              ].map((item) => (
                <View key={item.step} className="flex-row items-start">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-white font-bold text-lg">{item.step}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-foreground">{item.title}</Text>
                    <Text className="text-sm text-muted">{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Pitch Submission Modal */}
        <Modal
          visible={showPitchModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPitchModal(false)}
        >
          <View className="flex-1 bg-background">
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <Text className="text-xl font-bold text-foreground">Submit Innovation Pitch</Text>
              <TouchableOpacity onPress={() => setShowPitchModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
              <View className="gap-4">
                {/* Project Name */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Project Name *
                  </Text>
                  <TextInput
                    value={pitchData.projectName}
                    onChangeText={(text) =>
                      setPitchData({ ...pitchData, projectName: text })
                    }
                    placeholder="e.g., EcoWare Solutions"
                    placeholderTextColor={colors.muted}
                    className="bg-surface rounded-xl p-4 text-foreground border border-border"
                  />
                </View>

                {/* Category */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">Category *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {categories.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          onPress={() => setPitchData({ ...pitchData, category: cat })}
                          className={`px-4 py-2 rounded-full border ${
                            pitchData.category === cat
                              ? "border-primary"
                              : "border-border"
                          }`}
                          style={{
                            backgroundColor:
                              pitchData.category === cat
                                ? colors.primary + "20"
                                : colors.surface,
                          }}
                        >
                          <Text
                            className="text-sm font-medium"
                            style={{
                              color:
                                pitchData.category === cat ? colors.primary : colors.foreground,
                            }}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Funding Amount */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Funding Amount Requested *
                  </Text>
                  <TextInput
                    value={pitchData.fundingAmount}
                    onChangeText={(text) =>
                      setPitchData({ ...pitchData, fundingAmount: text })
                    }
                    placeholder="e.g., R25,000"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    className="bg-surface rounded-xl p-4 text-foreground border border-border"
                  />
                </View>

                {/* Description */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Project Description *
                  </Text>
                  <TextInput
                    value={pitchData.description}
                    onChangeText={(text) =>
                      setPitchData({ ...pitchData, description: text })
                    }
                    placeholder="Describe your project in a few sentences"
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={4}
                    className="bg-surface rounded-xl p-4 text-foreground border border-border"
                    style={{ minHeight: 100 }}
                  />
                </View>

                {/* Problem */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Problem Statement
                  </Text>
                  <TextInput
                    value={pitchData.problem}
                    onChangeText={(text) => setPitchData({ ...pitchData, problem: text })}
                    placeholder="What problem are you solving?"
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={3}
                    className="bg-surface rounded-xl p-4 text-foreground border border-border"
                    style={{ minHeight: 80 }}
                  />
                </View>

                {/* Solution */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Your Solution
                  </Text>
                  <TextInput
                    value={pitchData.solution}
                    onChangeText={(text) => setPitchData({ ...pitchData, solution: text })}
                    placeholder="How does your product/service solve it?"
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={3}
                    className="bg-surface rounded-xl p-4 text-foreground border border-border"
                    style={{ minHeight: 80 }}
                  />
                </View>

                {/* Target Market */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Target Market
                  </Text>
                  <TextInput
                    value={pitchData.targetMarket}
                    onChangeText={(text) =>
                      setPitchData({ ...pitchData, targetMarket: text })
                    }
                    placeholder="Who are your customers?"
                    placeholderTextColor={colors.muted}
                    className="bg-surface rounded-xl p-4 text-foreground border border-border"
                  />
                </View>

                {/* Revenue Model */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Revenue Model
                  </Text>
                  <TextInput
                    value={pitchData.revenueModel}
                    onChangeText={(text) =>
                      setPitchData({ ...pitchData, revenueModel: text })
                    }
                    placeholder="How will you make money?"
                    placeholderTextColor={colors.muted}
                    className="bg-surface rounded-xl p-4 text-foreground border border-border"
                  />
                </View>

                {/* Team Size */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">Team Size</Text>
                  <TextInput
                    value={pitchData.teamSize}
                    onChangeText={(text) => setPitchData({ ...pitchData, teamSize: text })}
                    placeholder="e.g., 3 co-founders"
                    placeholderTextColor={colors.muted}
                    className="bg-surface rounded-xl p-4 text-foreground border border-border"
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmitPitch}
                  className="rounded-xl py-4 items-center active:opacity-90 mb-6"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white text-lg font-bold">Submit Pitch</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>

        <Toast />
      </View>
    </ScreenContainer>
  );
}
