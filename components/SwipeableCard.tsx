import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
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
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const ROTATION_ANGLE = 60;

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
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, {}, () => {
          runOnJS(onSwipeRight)();
        });
        translateY.value = withSpring(0);
      } else if (shouldSwipeLeft) {
        // Swipe left - Pass
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {}, () => {
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
    const scale = isTop ? 1 : 0.95;

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
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage, { backgroundColor: colors.surface }]}>
              <IconSymbol name="person.fill" size={80} color={colors.mutedForeground} />
            </View>
          )}

          {/* Like Overlay */}
          <Animated.View style={[styles.likeOverlay, likeOpacityStyle]}>
            <View style={[styles.likeLabel, { borderColor: "#10B981" }]}>
              <Text style={styles.likeText}>LIKE</Text>
            </View>
          </Animated.View>

          {/* Nope Overlay */}
          <Animated.View style={[styles.nopeOverlay, nopeOpacityStyle]}>
            <View style={[styles.nopeLabel, { borderColor: "#EF4444" }]}>
              <Text style={styles.nopeText}>NOPE</Text>
            </View>
          </Animated.View>
        </View>

        {/* Profile Info */}
        <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {profile.display_name}, {profile.age}
          </Text>
          {profile.institution && (
            <Text style={[styles.institution, { color: colors.mutedForeground }]}>
              {profile.institution}
            </Text>
          )}
          {profile.bio && (
            <Text style={[styles.bio, { color: colors.foreground }]} numberOfLines={2}>
              {profile.bio}
            </Text>
          )}
          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              {profile.interests.slice(0, 3).map((interest, index) => (
                <View key={index} style={[styles.interestTag, { backgroundColor: `${colors.primary}20` }]}>
                  <Text style={[styles.interestText, { color: colors.primary }]}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: "100%",
    height: "70%",
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
  likeOverlay: {
    position: "absolute",
    top: 40,
    left: 40,
  },
  likeLabel: {
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    transform: [{ rotate: "-20deg" }],
  },
  likeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#10B981",
  },
  nopeOverlay: {
    position: "absolute",
    top: 40,
    right: 40,
  },
  nopeLabel: {
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    transform: [{ rotate: "20deg" }],
  },
  nopeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#EF4444",
  },
  infoContainer: {
    padding: 24,
    height: "30%",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  institution: {
    fontSize: 14,
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    marginTop: 8,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
