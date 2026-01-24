import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BRAND_COLORS } from '@/constants/brand-colors';

interface AnimatedGradientCardProps {
  children: React.ReactNode;
  colors?: string[];
  style?: ViewStyle;
  animationType?: 'pulse' | 'glow' | 'shimmer' | 'none';
  glassmorphism?: boolean;
}

export function AnimatedGradientCard({
  children,
  colors = BRAND_COLORS.gradients.card,
  style,
  animationType = 'glow',
  glassmorphism = false,
}: AnimatedGradientCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const shimmerTranslate = useSharedValue(-200);

  useEffect(() => {
    if (animationType === 'pulse') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else if (animationType === 'glow') {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else if (animationType === 'shimmer') {
      shimmerTranslate.value = withRepeat(
        withTiming(400, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [animationType]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerTranslate.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {glassmorphism && (
          <View style={styles.glassmorphism} />
        )}
        
        {animationType === 'shimmer' && (
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        )}
        
        <View style={styles.content}>
          {children}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  glassmorphism: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
