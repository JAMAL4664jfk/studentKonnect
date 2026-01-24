import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";

const HEALTH_PLANS = [
  {
    id: "basic",
    name: "Basic Cover",
    price: "R250/month",
    features: [
      "GP consultations (unlimited)",
      "Acute medication",
      "Basic dental (1x per year)",
      "Optical (R1,000 per year)",
      "Emergency care",
    ],
    color: ["#3b82f6", "#2563eb"],
  },
  {
    id: "standard",
    name: "Standard Cover",
    price: "R450/month",
    features: [
      "All Basic Cover benefits",
      "Specialist consultations",
      "Chronic medication",
      "Advanced dental",
      "Optical (R2,500 per year)",
      "Mental health support (6 sessions)",
      "Physiotherapy",
    ],
    color: ["#10b981", "#059669"],
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium Cover",
    price: "R750/month",
    features: [
      "All Standard Cover benefits",
      "Hospital cover",
      "Surgical procedures",
      "Maternity care",
      "Unlimited mental health",
      "Optical (R5,000 per year)",
      "Gym membership subsidy",
      "Wellness programs",
    ],
    color: ["#8b5cf6", "#7c3aed"],
  },
];

const BENEFITS = [
  {
    icon: "stethoscope",
    title: "24/7 Medical Support",
    desc: "Access to healthcare professionals anytime",
  },
  {
    icon: "pills.fill",
    title: "Medication Coverage",
    desc: "Prescribed medication at discounted rates",
  },
  {
    icon: "heart.text.square.fill",
    title: "Mental Health",
    desc: "Counseling and therapy sessions included",
  },
  {
    icon: "cross.case.fill",
    title: "Emergency Care",
    desc: "Full coverage for medical emergencies",
  },
];

export default function StudentHealthCoverScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("standard");

  const handleApply = (planId: string) => {
    Toast.show({
      type: "info",
      text1: "Coming Soon",
      text2: "Health cover enrollment will be available soon!",
    });
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={["#ef4444", "#dc2626", "#b91c1c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerEmoji}>🏥</Text>
            <Text style={styles.headerTitle}>Student Health Cover</Text>
            <Text style={styles.headerSubtitle}>
              Affordable healthcare for students
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Benefits */}
          <View style={styles.benefitsGrid}>
            {BENEFITS.map((benefit, index) => (
              <View
                key={index}
                style={[styles.benefitCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.benefitIcon}>
                  <IconSymbol name={benefit.icon as any} size={24} color="#ef4444" />
                </View>
                <Text style={[styles.benefitTitle, { color: colors.foreground }]}>
                  {benefit.title}
                </Text>
                <Text style={[styles.benefitDesc, { color: colors.mutedForeground }]}>
                  {benefit.desc}
                </Text>
              </View>
            ))}
          </View>

          {/* Plans */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Choose Your Plan
          </Text>

          {HEALTH_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              style={[
                styles.planCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selectedPlan === plan.id ? plan.color[0] : colors.border,
                  borderWidth: selectedPlan === plan.id ? 2 : 1,
                },
              ]}
            >
              {plan.recommended && (
                <View style={[styles.recommendedBadge, { backgroundColor: plan.color[0] }]}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planName, { color: colors.foreground }]}>
                    {plan.name}
                  </Text>
                  <Text style={[styles.planPrice, { color: plan.color[0] }]}>
                    {plan.price}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    {
                      borderColor: selectedPlan === plan.id ? plan.color[0] : colors.border,
                    },
                  ]}
                >
                  {selectedPlan === plan.id && (
                    <View style={[styles.radioInner, { backgroundColor: plan.color[0] }]} />
                  )}
                </View>
              </View>

              <View style={styles.planFeatures}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <IconSymbol name="checkmark.circle.fill" size={16} color={plan.color[0]} />
                    <Text style={[styles.featureText, { color: colors.foreground }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}

          {/* Apply Button */}
          <TouchableOpacity
            onPress={() => handleApply(selectedPlan)}
            style={styles.applyButton}
          >
            <LinearGradient
              colors={
                HEALTH_PLANS.find((p) => p.id === selectedPlan)?.color || ["#ef4444", "#dc2626"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyGradient}
            >
              <IconSymbol name="checkmark.shield.fill" size={20} color="white" />
              <Text style={styles.applyText}>
                Apply for {HEALTH_PLANS.find((p) => p.id === selectedPlan)?.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Info Box */}
          <View style={[styles.infoBox, { backgroundColor: "#3b82f620" }]}>
            <IconSymbol name="info.circle.fill" size={20} color="#3b82f6" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: "#3b82f6" }]}>
                Why Choose Student Health Cover?
              </Text>
              <Text style={[styles.infoText, { color: "#3b82f6" }]}>
                • No waiting periods for students{"\n"}
                • Affordable monthly premiums{"\n"}
                • Access to 1000+ healthcare providers{"\n"}
                • Easy claims process via app
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
  },
  content: {
    padding: 16,
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  benefitCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ef444420",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendedBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recommendedText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "bold",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  planFeatures: {
    gap: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
  },
  applyButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  applyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  applyText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
