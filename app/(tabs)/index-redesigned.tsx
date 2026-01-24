import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Dimensions, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useWallet } from "@/contexts/WalletContext";
import { AnimatedText } from "@/components/AnimatedText";
import { AnimatedGradientCard } from "@/components/AnimatedGradientCard";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { BRAND_COLORS, FEATURE_COLORS } from "@/constants/brand-colors";
import { FEATURE_DESCRIPTIONS } from "@/constants/feature-descriptions";

const { width } = Dimensions.get("window");

const PREMIUM_FEATURES = [
  {
    id: "marketplace",
    title: "Marketplace",
    description: FEATURE_DESCRIPTIONS.features.marketplace.description,
    badge: FEATURE_DESCRIPTIONS.features.marketplace.badge,
    icon: "cart.fill",
    colors: [BRAND_COLORS.purple.light, BRAND_COLORS.purple.dark],
    route: "/marketplace",
  },
  {
    id: "accommodation",
    title: "Accommodation",
    description: FEATURE_DESCRIPTIONS.features.accommodation.description,
    badge: FEATURE_DESCRIPTIONS.features.accommodation.badge,
    icon: "house.fill",
    colors: [BRAND_COLORS.blue.light, BRAND_COLORS.blue.dark],
    route: "/accommodation",
  },
  {
    id: "digital-connect",
    title: "Digital Connect",
    description: FEATURE_DESCRIPTIONS.features.digitalConnect.description,
    badge: FEATURE_DESCRIPTIONS.features.digitalConnect.badge,
    icon: "laptopcomputer",
    colors: [BRAND_COLORS.gold.light, BRAND_COLORS.orange.DEFAULT],
    route: "/digital-connect",
  },
  {
    id: "streaming",
    title: "Streaming Hub",
    description: FEATURE_DESCRIPTIONS.features.streaming.description,
    badge: FEATURE_DESCRIPTIONS.features.streaming.badge,
    icon: "play.circle.fill",
    colors: [BRAND_COLORS.cyan, BRAND_COLORS.teal],
    route: "/podcasts",
  },
  {
    id: "wellness",
    title: "Wellness",
    description: FEATURE_DESCRIPTIONS.features.wellness.description,
    badge: FEATURE_DESCRIPTIONS.features.wellness.badge,
    icon: "heart.fill",
    colors: ["#ec4899", "#f43f5e"],
    route: "/wellness",
  },
  {
    id: "dating",
    title: "Student Hookup",
    description: FEATURE_DESCRIPTIONS.features.dating.description,
    badge: FEATURE_DESCRIPTIONS.features.dating.badge,
    icon: "heart.circle.fill",
    colors: ["#f43f5e", "#fb7185"],
    route: "/dating-swipe",
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { balance, isLoading } = useWallet();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header with Animated Gradient */}
        <Animated.View entering={FadeInDown.duration(800).springify()}>
          <LinearGradient
            colors={[...BRAND_COLORS.gradients.hero, BRAND_COLORS.purple.dark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            {/* Glassmorphism overlay */}
            <View style={styles.glassOverlay} />
            
            {/* Floating orbs for depth */}
            <View style={[styles.floatingOrb, { top: 20, right: 30, backgroundColor: BRAND_COLORS.gold.light }]} />
            <View style={[styles.floatingOrb, { bottom: 40, left: 20, backgroundColor: BRAND_COLORS.blue.light }]} />
            
            <View style={styles.heroContent}>
              <View style={{ flex: 1 }}>
                <AnimatedText
                  animation="slideDown"
                  gradient
                  gradientColors={['#ffffff', '#fcd34d', '#ffffff']}
                  style={styles.heroTitle}
                  glow
                >
                  Student Konnect
                </AnimatedText>
                
                <AnimatedText
                  animation="fadeIn"
                  delay={200}
                  style={styles.heroSubtitle}
                >
                  {FEATURE_DESCRIPTIONS.heroMessage}
                </AnimatedText>
                
                <AnimatedText
                  animation="fadeIn"
                  delay={400}
                  style={styles.heroTagline}
                >
                  {FEATURE_DESCRIPTIONS.tagline}
                </AnimatedText>
              </View>
              
              <TouchableOpacity
                onPress={() => router.push("/notifications" as any)}
                style={styles.notificationButton}
              >
                <View style={styles.notificationGlow} />
                <IconSymbol name="bell.fill" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Wallet Card with Glow Animation */}
        <Animated.View entering={FadeInUp.delay(300).duration(800).springify()} style={styles.walletContainer}>
          <AnimatedGradientCard
            colors={['#1e293b', '#334155', '#475569']}
            animationType="glow"
            glassmorphism
            style={styles.walletCard}
          >
            <View style={styles.walletContent}>
              {/* Balance Section */}
              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <AnimatedText
                  animation="pulse"
                  gradient
                  gradientColors={[BRAND_COLORS.gold.light, BRAND_COLORS.orange.DEFAULT, BRAND_COLORS.gold.light]}
                  style={styles.balanceAmount}
                  glow
                >
                  R{isLoading ? "---" : balance.toFixed(2)}
                </AnimatedText>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                {[
                  { icon: "paperplane.fill", label: "Send", color: BRAND_COLORS.blue.DEFAULT },
                  { icon: "creditcard.fill", label: "Pay", color: BRAND_COLORS.purple.DEFAULT },
                  { icon: "arrow.down.circle.fill", label: "Request", color: BRAND_COLORS.gold.DEFAULT },
                ].map((action, index) => (
                  <TouchableOpacity
                    key={action.label}
                    style={styles.quickActionButton}
                    onPress={() => {}}
                  >
                    <LinearGradient
                      colors={[action.color, action.color + '80']}
                      style={styles.quickActionGradient}
                    >
                      <IconSymbol name={action.icon as any} size={20} color="white" />
                    </LinearGradient>
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </AnimatedGradientCard>
        </Animated.View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <AnimatedText
            animation="slideRight"
            delay={500}
            gradient
            gradientColors={BRAND_COLORS.gradients.hero}
            style={styles.sectionTitle}
            glow
          >
            Explore Features ✨
          </AnimatedText>

          <View style={styles.featuresGrid}>
            {PREMIUM_FEATURES.map((feature, index) => (
              <Animated.View
                key={feature.id}
                entering={FadeInUp.delay(600 + index * 100).duration(600).springify()}
              >
                <PremiumFeatureCard
                  title={feature.title}
                  description={feature.description}
                  badge={feature.badge}
                  icon={feature.icon}
                  colors={feature.colors}
                  onPress={() => router.push(feature.route as any)}
                  delay={index * 100}
                />
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Trust Banner */}
        <Animated.View entering={FadeInUp.delay(1200).duration(600)} style={styles.trustBanner}>
          <LinearGradient
            colors={[BRAND_COLORS.gold.DEFAULT + '20', BRAND_COLORS.orange.DEFAULT + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.trustGradient}
          >
            <IconSymbol name="checkmark.shield.fill" size={24} color={BRAND_COLORS.gold.DEFAULT} />
            <Text style={styles.trustText}>{FEATURE_DESCRIPTIONS.trustMessage}</Text>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroGradient: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  floatingOrb: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.2,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 6,
    fontWeight: '600',
  },
  heroTagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  walletContainer: {
    paddingHorizontal: 16,
    marginTop: -24,
  },
  walletCard: {
    height: 200,
  },
  walletContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  balanceSection: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  featuresContainer: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trustBanner: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  trustGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  trustText: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND_COLORS.gold.dark,
  },
});
