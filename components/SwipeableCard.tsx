import React from "react";
import { View, Text, Dimensions, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const ROTATION_ANGLE = 30;

// Calculate responsive card dimensions
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 40, 420);
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.68, 650);
const IMAGE_HEIGHT_RATIO = 0.65;

interface DatingProfile {
  id: string;
  user_id: string;
  display_name: string;
  age: number;
  bio: string | null;
  interests: string[] | null;
  profile_photo_url: string | null;
  institution: string | null;
  course: string | null;
  looking_for: string | null;
}

interface SwipeableCardProps {
  profile: DatingProfile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
}

export function SwipeableCard({ profile, onSwipeLeft, onSwipeRight, isTop }: SwipeableCardProps) {
  const colors = useColors();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isTop) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (!isTop) return;

      const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD;
      const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD;

      if (shouldSwipeRight) {
        // Swipe right - Like
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, { damping: 15 }, () => {
          runOnJS(onSwipeRight)();
        });
        translateY.value = withSpring(0);
      } else if (shouldSwipeLeft) {
        // Swipe left - Pass
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { damping: 15 }, () => {
          runOnJS(onSwipeLeft)();
        });
        translateY.value = withSpring(0);
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-ROTATION_ANGLE, 0, ROTATION_ANGLE],
      Extrapolate.CLAMP
    );

    const opacity = isTop ? 1 : 0.5;
    const scale = isTop ? 1 : 0.92;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: withSpring(scale) },
      ],
      opacity: withTiming(opacity),
    };
  });

  const likeOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const nopeOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          {profile.profile_photo_url ? (
            <Image
              source={{ uri: profile.profile_photo_url }}
              style={styles.image}
              contentFit="cover"
              priority="high"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage, { backgroundColor: colors.surface }]}>
              <IconSymbol name="person.fill" size={100} color={colors.mutedForeground} />
            </View>
          )}

          {/* Gradient Overlay for better text readability */}
          <View style={styles.gradientOverlay} />

          {/* Like Overlay */}
          <Animated.View style={[styles.likeOverlay, likeOpacityStyle]}>
            <View style={styles.likeLabel}>
              <Text style={styles.likeText}>LIKE</Text>
            </View>
          </Animated.View>

          {/* Nope Overlay */}
          <Animated.View style={[styles.nopeOverlay, nopeOpacityStyle]}>
            <View style={styles.nopeLabel}>
              <Text style={styles.nopeText}>NOPE</Text>
            </View>
          </Animated.View>
        </View>

        {/* Profile Info */}
        <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
          <View style={styles.infoContent}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                {profile.display_name}
              </Text>
              <Text style={[styles.age, { color: colors.foreground }]}>, {profile.age}</Text>
            </View>
            
            {profile.institution && (
              <View style={styles.institutionRow}>
                <IconSymbol name="building.2.fill" size={14} color={colors.mutedForeground} />
                <Text style={[styles.institution, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {profile.institution}
                </Text>
              </View>
            )}

            {profile.course && (
              <View style={styles.courseRow}>
                <IconSymbol name="book.fill" size={14} color={colors.mutedForeground} />
                <Text style={[styles.course, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {profile.course}
                </Text>
              </View>
            )}
            
            {profile.bio && (
              <Text style={[styles.bio, { color: colors.foreground }]} numberOfLines={3}>
                {profile.bio}
              </Text>
            )}
            
            {profile.interests && profile.interests.length > 0 && (
              <View style={styles.interestsContainer}>
                {profile.interests.slice(0, 4).map((interest, index) => (
                  <View key={index} style={[styles.interestTag, { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` }]}>
                    <Text style={[styles.interestText, { color: colors.primary }]} numberOfLines={1}>
                      {interest}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  imageContainer: {
    width: "100%",
    height: `${IMAGE_HEIGHT_RATIO * 100}%`,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    alignItems: "center",
    justifyContent: "center",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "transparent",
  },
  likeOverlay: {
    position: "absolute",
    top: 30,
    left: 30,
  },
  likeLabel: {
    borderWidth: 4,
    borderColor: "#10B981",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    transform: [{ rotate: "-20deg" }],
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  likeText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#10B981",
    letterSpacing: 2,
  },
  nopeOverlay: {
    position: "absolute",
    top: 30,
    right: 30,
  },
  nopeLabel: {
    borderWidth: 4,
    borderColor: "#EF4444",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    transform: [{ rotate: "20deg" }],
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  nopeText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#EF4444",
    letterSpacing: 2,
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: "center",
  },
  infoContent: {
    gap: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    flexShrink: 1,
  },
  age: {
    fontSize: 26,
    fontWeight: "600",
  },
  institutionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  institution: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  course: {
    fontSize: 13,
    flex: 1,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  interestText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
