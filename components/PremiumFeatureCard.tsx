import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BRAND_COLORS, FEATURE_COLORS } from '@/constants/brand-colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface PremiumFeatureCardProps {
  title: string;
  description?: string;
  badge?: string;
  icon: string;
  colors: string[];
  onPress: () => void;
  delay?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function PremiumFeatureCard({
  title,
  description,
  badge,
  icon,
  colors,
  onPress,
  delay = 0,
}: PremiumFeatureCardProps) {
  const pressed = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        {
          rotateZ: `${interpolate(pressed.value, [0, 1], [0, 2])}deg`,
        },
      ],
    };
  });

  const handlePressIn = () => {
    pressed.value = withSpring(1);
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0);
    scale.value = withSpring(1);
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
      activeOpacity={1}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Glassmorphism overlay */}
        <View style={styles.glassOverlay} />
        
        {/* Glow effect */}
        <View style={[styles.glow, { backgroundColor: colors[0] }]} />
        
        {/* Content */}
        <View style={styles.content}>
          {/* Icon with glow */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconGlow, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]} />
            <IconSymbol name={icon as any} size={32} color="white" />
          </View>
          
          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          
          {/* Badge */}
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
          
          {/* Description */}
          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}
          
          {/* Arrow indicator */}
          <View style={styles.arrow}>
            <IconSymbol name="arrow.right" size={16} color="white" />
          </View>
        </View>
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  glow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.3,
    blur: 40,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    opacity: 0.5,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    lineHeight: 16,
  },
  arrow: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
