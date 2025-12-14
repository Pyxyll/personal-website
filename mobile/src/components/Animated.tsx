import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ViewStyle,
  Pressable,
  PressableProps,
  View,
  StyleSheet,
} from 'react-native';
import { colors, animation, shadows } from '../theme';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
  slideFrom?: 'bottom' | 'left' | 'right' | 'none';
}

export function FadeIn({
  children,
  delay = 0,
  duration = animation.normal,
  style,
  slideFrom = 'bottom',
}: FadeInProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(
    slideFrom === 'bottom' ? 20 :
    slideFrom === 'left' ? -30 :
    slideFrom === 'right' ? 30 : 0
  )).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const transform = slideFrom === 'none'
    ? []
    : slideFrom === 'bottom'
      ? [{ translateY: slideAnim }]
      : [{ translateX: slideAnim }];

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
}

export function StaggeredList({ children, staggerDelay = animation.stagger }: StaggeredListProps) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <FadeIn delay={index * staggerDelay} key={index}>
          {child}
        </FadeIn>
      ))}
    </>
  );
}

interface AnimatedCardProps extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accentOnPress?: boolean;
}

export function AnimatedCard({
  children,
  style,
  accentOnPress = true,
  ...props
}: AnimatedCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.card,
            style,
            { transform: [{ scale: scaleAnim }] },
            pressed && accentOnPress && styles.cardPressed,
          ]}
        >
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
}

interface PulseProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Pulse({ children, style }: PulseProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: pulseAnim }]}>
      {children}
    </Animated.View>
  );
}

interface ShimmerProps {
  width: number | string;
  height: number;
  style?: ViewStyle;
}

export function Shimmer({ width, height, style }: ShimmerProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={[styles.shimmerContainer, { width, height }, style]}>
      <Animated.View
        style={[
          styles.shimmerWave,
          {
            transform: [
              {
                translateX: shimmerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 200],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

interface GlowBorderProps {
  children: React.ReactNode;
  active?: boolean;
  style?: ViewStyle;
}

export function GlowBorder({ children, active = false, style }: GlowBorderProps) {
  return (
    <View style={[styles.glowContainer, active && shadows.glow, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    borderColor: colors.accent,
    backgroundColor: colors.cardHover,
  },
  shimmerContainer: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  shimmerWave: {
    width: 100,
    height: '100%',
    backgroundColor: colors.border,
    opacity: 0.3,
  },
  glowContainer: {
    borderRadius: 0,
  },
});
