import React, { useEffect } from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  SlideInDown,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { BRAND_COLORS } from '@/constants/brand-colors';

interface AnimatedTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  gradient?: boolean;
  gradientColors?: string[];
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'bounce' | 'pulse' | 'none';
  delay?: number;
  glow?: boolean;
}

const AnimatedTextComponent = Animated.createAnimatedComponent(Text);

export function AnimatedText({
  children,
  style,
  gradient = false,
  gradientColors = [BRAND_COLORS.purple.light, BRAND_COLORS.blue.DEFAULT, BRAND_COLORS.gold.DEFAULT],
  animation = 'fadeIn',
  delay = 0,
  glow = false,
}: AnimatedTextProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (animation === 'bounce') {
      scale.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withSpring(1.1, { damping: 2, stiffness: 100 }),
            withSpring(1, { damping: 2, stiffness: 100 })
          ),
          -1,
          false
        )
      );
    } else if (animation === 'pulse') {
      opacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        )
      );
    }
  }, [animation, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const getEnteringAnimation = () => {
    switch (animation) {
      case 'fadeIn':
        return FadeIn.delay(delay).duration(600);
      case 'slideUp':
        return SlideInUp.delay(delay).duration(600).springify();
      case 'slideDown':
        return SlideInDown.delay(delay).duration(600).springify();
      case 'slideLeft':
        return SlideInLeft.delay(delay).duration(600).springify();
      case 'slideRight':
        return SlideInRight.delay(delay).duration(600).springify();
      default:
        return undefined;
    }
  };

  const textStyle = [
    style,
    glow && styles.glow,
  ];

  if (gradient) {
    return (
      <MaskedView
        maskElement={
          <AnimatedTextComponent
            style={[textStyle, animatedStyle]}
            entering={getEnteringAnimation()}
          >
            {children}
          </AnimatedTextComponent>
        }
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        >
          <AnimatedTextComponent
            style={[textStyle, { opacity: 0 }]}
            entering={getEnteringAnimation()}
          >
            {children}
          </AnimatedTextComponent>
        </LinearGradient>
      </MaskedView>
    );
  }

  return (
    <AnimatedTextComponent
      style={[textStyle, animatedStyle]}
      entering={getEnteringAnimation()}
    >
      {children}
    </AnimatedTextComponent>
  );
}

const styles = StyleSheet.create({
  glow: {
    textShadowColor: BRAND_COLORS.purple.light,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
});
